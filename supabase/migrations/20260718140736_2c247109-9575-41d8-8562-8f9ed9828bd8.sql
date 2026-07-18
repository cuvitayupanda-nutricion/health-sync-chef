-- 1. Tabla nutrition_plans
CREATE TABLE public.nutrition_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  assessment_id uuid,

  -- Calorías
  target_kcal numeric(7,2) NOT NULL,
  assigned_menu_kcal numeric(7,2),

  -- Macronutrientes
  protein_g numeric(7,2),
  carbs_g numeric(7,2),
  fat_g numeric(7,2),
  fiber_g numeric(7,2),

  -- Hidratación
  water_ml integer,

  -- Micronutrientes
  calcium_mg numeric(8,2),
  iron_mg numeric(8,2),
  potassium_mg numeric(8,2),
  sodium_mg numeric(8,2),

  -- Estructura del plan
  meal_distribution jsonb NOT NULL DEFAULT '{}'::jsonb,
  shopping_list jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Menú asignado
  menu_id uuid,
  menu_name text,

  -- Textos
  observations text,
  disclaimer text NOT NULL DEFAULT 'Información de carácter educativo. No sustituye la valoración de un profesional de la salud.',

  -- Estado
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  version integer NOT NULL DEFAULT 1,

  -- Compartir públicamente
  share_id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,

  -- Trazabilidad
  generated_by uuid,
  ai_model text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Índices
CREATE INDEX nutrition_plans_org_idx ON public.nutrition_plans(org_id);
CREATE INDEX nutrition_plans_client_idx ON public.nutrition_plans(client_id);
CREATE INDEX nutrition_plans_menu_idx ON public.nutrition_plans(menu_id);
CREATE INDEX nutrition_plans_target_kcal_idx ON public.nutrition_plans(target_kcal);

-- 3. GRANTs
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_plans TO authenticated;
GRANT SELECT ON public.nutrition_plans TO anon; -- solo para lectura por share_id vía política
GRANT ALL ON public.nutrition_plans TO service_role;

-- 4. RLS
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;

-- Miembros de la organización pueden leer sus planes
CREATE POLICY "Org members read plans"
ON public.nutrition_plans FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.org_id = nutrition_plans.org_id
  )
);

-- El cliente autenticado puede leer su propio plan
CREATE POLICY "Client reads own plan"
ON public.nutrition_plans FOR SELECT
TO authenticated
USING (client_id = auth.uid());

-- Entrenadores y admins del gimnasio pueden crear planes en su organización
CREATE POLICY "Trainers create plans"
ON public.nutrition_plans FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role_in_org(auth.uid(), org_id, 'trainer'::app_role)
  OR public.has_role_in_org(auth.uid(), org_id, 'gym_admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

-- Entrenadores y admins pueden actualizar planes de su organización
CREATE POLICY "Trainers update plans"
ON public.nutrition_plans FOR UPDATE
TO authenticated
USING (
  public.has_role_in_org(auth.uid(), org_id, 'trainer'::app_role)
  OR public.has_role_in_org(auth.uid(), org_id, 'gym_admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  public.has_role_in_org(auth.uid(), org_id, 'trainer'::app_role)
  OR public.has_role_in_org(auth.uid(), org_id, 'gym_admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

-- Solo gym_admin o super_admin borran
CREATE POLICY "Admins delete plans"
ON public.nutrition_plans FOR DELETE
TO authenticated
USING (
  public.has_role_in_org(auth.uid(), org_id, 'gym_admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

-- 5. Trigger updated_at
CREATE TRIGGER nutrition_plans_set_updated_at
BEFORE UPDATE ON public.nutrition_plans
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();