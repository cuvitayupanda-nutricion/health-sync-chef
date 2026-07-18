# 7RISE Nutrition Engine — Arquitectura (Aprobada)

Plataforma 2 del ecosistema 7RISE. Convierte los datos de composición corporal enviados por la Plataforma 1 (InBody) en un plan alimentario personalizado en menos de 60 segundos. Uso no clínico. Público: gimnasios, entrenadores personales, centros fitness y adultos sanos.

Stack: React 19 + TypeScript + TanStack Start + Tailwind v4 + Lovable Cloud + Lovable AI Gateway.

---

## 1. Filosofía de producto

- Un dato entra → un plan sale.
- Minimalista, elegante, muy rápido. Inspirado en Apple Health, Notion y Stripe.
- Disclaimer permanente de "no clínico" en toda la UI.
- El Nutrition Engine es determinista. La IA solo explica.

## 2. Roles

Tabla `user_roles` separada + `has_role` SECURITY DEFINER.

- `super_admin` — dueño de la plataforma
- `gym_admin` — administra una organización
- `trainer` — gestiona clientes y planes
- `client` — vista de solo lectura

## 3. Módulos

```text
Autenticación / Onboarding
Dashboard (KPIs)
Clientes  (CRUD + timeline de evaluaciones)
Planes    (biblioteca de planes generados)
Nutrition Engine  ← corazón del sistema (determinista)
Panel Administrativo
  - Alimentos
  - Recetas
  - Menús (por nivel calórico)
  - Usuarios / Entrenadores / Gimnasios
  - Configuración general
Módulos IA
  - Explicaciones (activo)
  - Food Photo Analysis (Future module = TRUE)
API pública v1 (para Plataforma 3)
```

## 4. Estructura de rutas

```text
src/routes/
  __root.tsx
  index.tsx                              Landing pública
  auth.tsx                               Login / Signup (email + Google)
  api/public/
    intake.ts                            Webhook desde Plataforma 1 (HMAC)
    plan.$shareId.ts                     Vista pública del plan (share link)
    v1/plans.$id.ts                      API para Plataforma 3 (bearer)
  _authenticated/
    route.tsx                            Gate (ssr:false)
    dashboard/index.tsx
    clients/index.tsx
    clients/$clientId/index.tsx          (paso 3)
    clients/$clientId/new-plan.tsx       (paso 7)
    plans/index.tsx
    plans/$planId.tsx                    (paso 8)
    nutrition-engine/index.tsx           Vista del motor + configuración
    admin/foods.tsx
    admin/recipes.tsx
    admin/menus.tsx
    admin/users.tsx
    admin/trainers.tsx
    admin/gyms.tsx
    settings/index.tsx
```

## 5. Modelo de datos

Todas las tablas en `public` con GRANTs + RLS. Multi-tenant por `org_id`.

### Ya creado (paso 1)

- `organizations` (id, name, slug, branding jsonb)
- `profiles` (id = auth.uid, org_id, full_name, avatar_url)
- `user_roles` (user_id, org_id, role enum)
- `has_role(uuid, app_role)` y `has_role_in_org(uuid, uuid, app_role)`

### Pendiente

**`clients`**

- id, org_id, external_ref (id InBody), full_name, birthdate, sex, notes

**`assessments`** (mediciones)

- id, client_id, org_id, source ('inbody'|'manual')
- raw jsonb, weight_kg, height_cm, age, sex, bmi
- muscle_mass_kg, fat_mass_kg, fat_pct, body_water_l
- bmr_kcal, tdee_kcal, goal enum(lose_fat|maintain|gain_muscle)
- **physical_activity_level** (sedentary, light, moderate, active, very_active)
- **get_calculation_method** (mifflin_st_jeor, harris_benedict, katch_mcardle, inbody_direct)
- **calculation_date**
- measured_at, created_at

**`nutrition_plans`**

- id, client_id, assessment_id, org_id
- kcal, protein_g, carbs_g, fat_g
- **water_ml, fiber_g, calcium_mg, iron_mg, potassium_mg, sodium_mg**
- **goal_type** enum(lose_fat|maintain|gain_muscle)
- **diet_type** enum(Hipocalórica|Normocalórica|Hipercalórica)
- **meal_distribution** jsonb (kcal y macros por comida)
- menu jsonb (menú compuesto)
- **shopping_list** jsonb
- notes, status enum(draft|active|archived), version
- share_id uuid unique, generated_by, ai_model, created_at

**`plan_events`** — auditoría/analytics

**`api_tokens`** — para Plataforma 3 (token_hash, scopes, org_id)

### Biblioteca de alimentos (multi-fuente)

**`food_sources`** — catálogo de fuentes

- id, code (USDA, FAO, LATINFOODS, BEDCA, ECUADOR, BRAND)
- name, description, active

**`foods`**

- id, source_id, external_ref, name, brand
- per_100g: kcal, protein_g, carbs_g, fat_g, fiber_g, water_g
- micros jsonb (calcium_mg, iron_mg, potassium_mg, sodium_mg, ...)
- allergens text[], tags text[]

### Biblioteca de recetas

**`recipes`**

- id, name, difficulty enum(easy|medium|hard)
- preparation_time_min, estimated_cost_local, image_url
- ingredients jsonb (food_id, grams)
- preparation text
- allergens text[]
- kcal, protein_g, carbs_g, fat_g (agregados)

### Biblioteca de menús por nivel calórico

**`menu_slots`**

- id, kcal_level (2000, 2200, 2400, ...)
- meal_type enum(breakfast|lunch|snack|dinner)
- name, recipe_ids uuid[] (composición)
- kcal, protein_g, carbs_g, fat_g (agregados del slot)

El Nutrition Engine combina slots del mismo `kcal_level` (uno de cada `meal_type`) para producir miles de menús distintos.

## 6. Flujo del Nutrition Engine

```text
Plataforma 1 (InBody)
      │  POST /api/public/intake (HMAC)
      ▼
  clients + assessments
      │
      ▼
  Nutrition Engine (determinista)
   1. Leer GET (tdee_kcal)
   2. Leer objetivo (goal_type)
   3. Calcular calorías objetivo → target_kcal
   4. Calcular proteínas (g/kg de peso magro)
   5. Calcular grasas (% de kcal)
   6. Calcular carbohidratos (kcal restante)
   7. Elegir kcal_level más cercano en la biblioteca
   8. Combinar slots (breakfast + lunch + snack + dinner)
   9. Micronutrientes y water_ml objetivo
  10. Generar shopping_list agregada
      │
      ▼
  nutrition_plans (con share_id)
      │
      ▼  (opcional) IA
  Explicación humana del plan
      │
      ▼  (futuro) API pública
  Plataforma 3 (Coach)
```

## 7. Módulos de IA

- **Explicaciones (activo)** — Lovable AI Gateway. Transforma un plan ya calculado en texto amigable. No decide macros.
- **Food Photo Analysis (Future module = TRUE)** — Reconocimiento de alimentos por fotografía. Arquitectura preparada, sin implementación.

## 8. Dashboard (indicadores)

- Clientes activos
- Planes generados
- Objetivo nutricional más frecuente
- Distribución de objetivos
- Últimos clientes registrados

## 9. Integraciones externas

- **Plataforma 1 → P2**: `POST /api/public/intake` con HMAC (secret por organización).
- **P2 → Plataforma 3**: `GET /api/public/v1/plans/:id` con `Authorization: Bearer <api_token>`.

## 10. Estructura de código

```text
src/
  routes/                (arriba)
  components/
    ui/                  shadcn base
    brand/               BrandMark
    layout/              AppShell, Sidebar, Topbar
    shared/              PageHeader, StatTile, EmptyState, Disclaimer
    admin/               AdminLayout
    clients/             (paso 3)
    plans/               MacroRing, MealCard, PlanSummary (pasos 4–8)
  features/
    assessments/
    plans/
    clients/
    org/
  lib/
    nutrition/
      calculations.ts    TMB, GET (varios métodos)
      macros.ts          reparto kcal → P/G/C por objetivo
      menu-picker.ts     selección del kcal_level y combinación de slots
      shopping-list.ts   agregación de ingredientes
      validators.ts      rangos seguros (no clínico)
    ai/
      explanation-prompt.ts
      explanation.ts
      food-photo.ts      (Future — stub)
    security/hmac.ts
    plans.functions.ts   createServerFn
    clients.functions.ts
    intake.server.ts
  integrations/
    supabase/  lovable/
  hooks/
  styles.css             design tokens
```

## 11. Seguridad

- RLS en todas las tablas + GRANTs explícitos.
- Roles en tabla separada (`user_roles` + `has_role`).
- Webhook InBody con HMAC + anti-replay.
- API tokens hasheados (sha256).
- Disclaimer permanente.

## 12. Design system

Ver `src/styles.css`. Tokens oklch, radios generosos (1rem), sombras suaves, acento emerald 7RISE, macros con paleta cálida.

## 13. Roadmap

1. ✅ **Fundaciones** — Design system + AppShell + rutas + autenticación + componentes base
2. ✅ Motor nutricional (`lib/nutrition/*`)
3. ✅ Modelo de datos completo (clients, assessments, plans, foods, recipes, menu_slots)
4. Clients CRUD
5. Vista de assessment + entrada manual
6. ✅ Webhook intake real (`POST /api/public/intake`) con HMAC
7. Generación de plan con Nutrition Engine + IA de explicación
8. Vista de plan + share link público
9. Panel administrativo (foods, recipes, menus)
10. Settings (branding, webhook secret, API tokens)
11. API pública v1 para Plataforma 3
12. Pulido, analytics, export PDF, Food Photo Analysis
