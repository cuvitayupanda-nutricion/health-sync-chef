-- 7RISE Nutrition Engine — arquitectura definitiva
-- Preparación de fuentes nutricionales, recetas enriquecidas, biblioteca de
-- opciones por nivel calórico y módulos futuros de IA.

-- ============= FOOD SOURCES =============
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'latinfoods'
      AND enumtypid = 'public.food_source'::regtype
  ) THEN
    ALTER TYPE public.food_source ADD VALUE 'latinfoods';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'ecuador_food_table'
      AND enumtypid = 'public.food_source'::regtype
  ) THEN
    ALTER TYPE public.food_source ADD VALUE 'ecuador_food_table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'commercial_brand'
      AND enumtypid = 'public.food_source'::regtype
  ) THEN
    ALTER TYPE public.food_source ADD VALUE 'commercial_brand';
  END IF;
END $$;

CREATE TABLE public.nutrition_data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  region TEXT,
  provider_url TEXT,
  is_import_enabled BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.nutrition_data_sources IS
  'Catálogo de fuentes nutricionales soportadas. La importación queda deshabilitada hasta implementar conectores.';

INSERT INTO public.nutrition_data_sources (source, display_name, region, provider_url, metadata)
VALUES
  ('usda', 'USDA FoodData Central', 'United States', 'https://fdc.nal.usda.gov/', '{"future_import": true}'::jsonb),
  ('fao', 'FAO/INFOODS', 'Global', 'https://www.fao.org/infoods/', '{"future_import": true}'::jsonb),
  ('latinfoods', 'LATINFOODS', 'Latin America', 'https://www.fao.org/infoods/infoods/tables-and-databases/latin-america/en/', '{"future_import": true}'::jsonb),
  ('bedca', 'BEDCA', 'Spain', 'https://www.bedca.net/', '{"future_import": true}'::jsonb),
  ('ecuador', 'Tabla de Composición de Alimentos del Ecuador', 'Ecuador', NULL, '{"future_import": true, "legacy_source_code": true}'::jsonb),
  ('ecuador_food_table', 'Tabla de Composición de Alimentos del Ecuador', 'Ecuador', NULL, '{"future_import": true}'::jsonb),
  ('commercial_brand', 'Marcas comerciales', 'Commercial', NULL, '{"future_import": true}'::jsonb),
  ('custom', 'Carga manual 7RISE', 'Custom', NULL, '{"future_import": false}'::jsonb)
ON CONFLICT (source) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  region = EXCLUDED.region,
  provider_url = EXCLUDED.provider_url,
  metadata = public.nutrition_data_sources.metadata || EXCLUDED.metadata,
  updated_at = now();

ALTER TABLE public.foods
  ADD COLUMN data_source_id UUID REFERENCES public.nutrition_data_sources(id) ON DELETE SET NULL,
  ADD COLUMN brand_name TEXT,
  ADD COLUMN external_metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.foods f
SET data_source_id = s.id
FROM public.nutrition_data_sources s
WHERE f.source::text = s.source
  AND f.data_source_id IS NULL;

CREATE INDEX idx_foods_data_source ON public.foods(data_source_id);
CREATE INDEX idx_foods_brand_name ON public.foods(brand_name) WHERE brand_name IS NOT NULL;

GRANT SELECT ON public.nutrition_data_sources TO authenticated;
GRANT ALL ON public.nutrition_data_sources TO service_role;
ALTER TABLE public.nutrition_data_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read nutrition data sources"
ON public.nutrition_data_sources FOR SELECT TO authenticated
USING (is_active = true);

CREATE POLICY "Super admin manage nutrition data sources"
ON public.nutrition_data_sources FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER trg_nutrition_data_sources_updated_at
BEFORE UPDATE ON public.nutrition_data_sources
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= NUTRITION PLANS =============
ALTER TABLE public.nutrition_plans
  ADD COLUMN goal_type public.nutrition_goal,
  ADD COLUMN diet_type TEXT CHECK (diet_type IN ('Hipocalórica', 'Normocalórica', 'Hipercalórica'));

UPDATE public.nutrition_plans
SET
  goal_type = COALESCE(goal_type, 'maintain'),
  diet_type = COALESCE(diet_type, 'Normocalórica');

ALTER TABLE public.nutrition_plans
  ALTER COLUMN goal_type SET NOT NULL,
  ALTER COLUMN diet_type SET NOT NULL;

COMMENT ON COLUMN public.nutrition_plans.goal_type IS
  'Objetivo nutricional usado por Nutrition Engine: lose_fat, maintain o gain_muscle.';
COMMENT ON COLUMN public.nutrition_plans.diet_type IS
  'Clasificación calórica del plan: Hipocalórica, Normocalórica o Hipercalórica.';

-- ============= RECIPES =============
ALTER TABLE public.recipes
  ADD COLUMN preparation_time INTEGER,
  ADD COLUMN estimated_cost NUMERIC(8,2),
  ADD COLUMN image TEXT,
  ADD COLUMN ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN preparation TEXT;

UPDATE public.recipes
SET
  preparation_time = COALESCE(preparation_time, prep_time_min, 0) + COALESCE(cook_time_min, 0),
  estimated_cost = COALESCE(estimated_cost, cost_estimate),
  image = COALESCE(image, image_url),
  preparation = COALESCE(preparation, instructions)
WHERE preparation_time IS NULL
   OR estimated_cost IS NULL
   OR image IS NULL
   OR preparation IS NULL;

COMMENT ON COLUMN public.recipes.preparation_time IS
  'Tiempo total estimado de preparación en minutos.';
COMMENT ON COLUMN public.recipes.estimated_cost IS
  'Costo estimado de la receta en la moneda configurada por organización.';
COMMENT ON COLUMN public.recipes.ingredients IS
  'Snapshot JSON de ingredientes para edición rápida; recipe_ingredients conserva la relación normalizada.';
COMMENT ON COLUMN public.recipes.preparation IS
  'Pasos de preparación en lenguaje humano.';

-- ============= MENU LIBRARY BY CALORIE LEVEL =============
CREATE TABLE public.menu_calorie_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kcal_level INTEGER NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.menu_calorie_levels IS
  'Niveles calóricos disponibles para la biblioteca de opciones de menú, por ejemplo 2200 kcal.';

CREATE TABLE public.meal_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kcal_level_id UUID NOT NULL REFERENCES public.menu_calorie_levels(id) ON DELETE CASCADE,
  kcal_level INTEGER NOT NULL,
  meal_type public.meal_slot_type NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  target_kcal NUMERIC(7,2),
  serving_grams NUMERIC(7,2),
  order_index INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT meal_options_kcal_level_matches_parent
    CHECK (kcal_level > 0)
);

COMMENT ON TABLE public.meal_options IS
  'Opciones intercambiables por nivel calórico y momento de comida. Permite 20 desayunos, 20 almuerzos, etc. por kcal_level.';

CREATE INDEX idx_meal_options_level_type
ON public.meal_options(kcal_level, meal_type, is_active);

CREATE INDEX idx_meal_options_recipe
ON public.meal_options(recipe_id);

CREATE UNIQUE INDEX idx_meal_options_level_type_order
ON public.meal_options(kcal_level_id, meal_type, order_index);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_calorie_levels TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_options TO authenticated;
GRANT ALL ON public.menu_calorie_levels TO service_role;
GRANT ALL ON public.meal_options TO service_role;

ALTER TABLE public.menu_calorie_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read menu calorie levels"
ON public.menu_calorie_levels FOR SELECT TO authenticated
USING (is_active = true);

CREATE POLICY "Super admin manage menu calorie levels"
ON public.menu_calorie_levels FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Authenticated read meal options"
ON public.meal_options FOR SELECT TO authenticated
USING (is_active = true);

CREATE POLICY "Super admin manage meal options"
ON public.meal_options FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER trg_menu_calorie_levels_updated_at
BEFORE UPDATE ON public.menu_calorie_levels
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_meal_options_updated_at
BEFORE UPDATE ON public.meal_options
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= FUTURE AI MODULES =============
CREATE TABLE public.ai_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  future_module BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'disabled')),
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.ai_modules (module_key, name, future_module, status, description, metadata)
VALUES (
  'food_photo_analysis',
  'Food Photo Analysis',
  true,
  'planned',
  'Future Module para reconocer alimentos mediante fotografías y estimar calorías, macronutrientes y micronutrientes.',
  '{"develop_now": false}'::jsonb
)
ON CONFLICT (module_key) DO UPDATE SET
  name = EXCLUDED.name,
  future_module = EXCLUDED.future_module,
  status = EXCLUDED.status,
  description = EXCLUDED.description,
  metadata = public.ai_modules.metadata || EXCLUDED.metadata,
  updated_at = now();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_modules TO authenticated;
GRANT ALL ON public.ai_modules TO service_role;
ALTER TABLE public.ai_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read ai modules"
ON public.ai_modules FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Super admin manage ai modules"
ON public.ai_modules FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER trg_ai_modules_updated_at
BEFORE UPDATE ON public.ai_modules
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
