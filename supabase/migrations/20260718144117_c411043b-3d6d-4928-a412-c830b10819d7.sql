
-- ============= ENUMS =============
CREATE TYPE public.sex_type AS ENUM ('male', 'female');
CREATE TYPE public.activity_level AS ENUM ('sedentary', 'light', 'moderate', 'active', 'very_active');
CREATE TYPE public.nutrition_goal AS ENUM ('lose_fat', 'maintain', 'gain_muscle');
CREATE TYPE public.calc_method AS ENUM ('mifflin_st_jeor', 'katch_mcardle', 'harris_benedict');
CREATE TYPE public.food_source AS ENUM ('usda', 'fao', 'bedca', 'ecuador', 'custom');
CREATE TYPE public.recipe_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE public.meal_slot_type AS ENUM ('breakfast', 'mid_morning', 'lunch', 'snack', 'dinner', 'post_workout', 'pre_workout');

-- ============= CLIENTS =============
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  trainer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  sex public.sex_type,
  birth_date DATE,
  notes TEXT,
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_clients_org ON public.clients(org_id);
CREATE INDEX idx_clients_user ON public.clients(user_id);
CREATE INDEX idx_clients_trainer ON public.clients(trainer_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members read clients" ON public.clients FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role_in_org(auth.uid(), org_id, 'gym_admin')
    OR public.has_role_in_org(auth.uid(), org_id, 'trainer')
    OR user_id = auth.uid()
  );
CREATE POLICY "Org staff manage clients" ON public.clients FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role_in_org(auth.uid(), org_id, 'gym_admin')
    OR public.has_role_in_org(auth.uid(), org_id, 'trainer')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role_in_org(auth.uid(), org_id, 'gym_admin')
    OR public.has_role_in_org(auth.uid(), org_id, 'trainer')
  );

CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= ASSESSMENTS =============
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5,2) NOT NULL,
  height_cm NUMERIC(5,2) NOT NULL,
  age INTEGER NOT NULL,
  sex public.sex_type NOT NULL,
  body_fat_pct NUMERIC(4,2),
  muscle_mass_kg NUMERIC(5,2),
  visceral_fat NUMERIC(4,2),
  physical_activity_level public.activity_level NOT NULL DEFAULT 'moderate',
  nutrition_goal public.nutrition_goal NOT NULL DEFAULT 'maintain',
  get_calculation_method public.calc_method NOT NULL DEFAULT 'mifflin_st_jeor',
  calculation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'inbody_webhook',
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_assessments_client ON public.assessments(client_id);
CREATE INDEX idx_assessments_org ON public.assessments(org_id);
CREATE INDEX idx_assessments_date ON public.assessments(calculation_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessments TO authenticated;
GRANT ALL ON public.assessments TO service_role;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members read assessments" ON public.assessments FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role_in_org(auth.uid(), org_id, 'gym_admin')
    OR public.has_role_in_org(auth.uid(), org_id, 'trainer')
    OR EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_id AND c.user_id = auth.uid())
  );
CREATE POLICY "Org staff manage assessments" ON public.assessments FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role_in_org(auth.uid(), org_id, 'gym_admin')
    OR public.has_role_in_org(auth.uid(), org_id, 'trainer')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role_in_org(auth.uid(), org_id, 'gym_admin')
    OR public.has_role_in_org(auth.uid(), org_id, 'trainer')
  );

CREATE TRIGGER trg_assessments_updated_at BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= FOODS (global) =============
CREATE TABLE public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source public.food_source NOT NULL DEFAULT 'custom',
  source_code TEXT,
  name TEXT NOT NULL,
  name_es TEXT,
  category TEXT,
  kcal_per_100g NUMERIC(6,2) NOT NULL,
  protein_g_per_100g NUMERIC(6,2) NOT NULL DEFAULT 0,
  carbs_g_per_100g NUMERIC(6,2) NOT NULL DEFAULT 0,
  fat_g_per_100g NUMERIC(6,2) NOT NULL DEFAULT 0,
  fiber_g_per_100g NUMERIC(6,2) DEFAULT 0,
  calcium_mg_per_100g NUMERIC(7,2) DEFAULT 0,
  iron_mg_per_100g NUMERIC(7,2) DEFAULT 0,
  potassium_mg_per_100g NUMERIC(7,2) DEFAULT 0,
  sodium_mg_per_100g NUMERIC(7,2) DEFAULT 0,
  allergens TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_foods_name ON public.foods(name);
CREATE INDEX idx_foods_source ON public.foods(source);
CREATE UNIQUE INDEX idx_foods_source_code ON public.foods(source, source_code) WHERE source_code IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.foods TO authenticated;
GRANT ALL ON public.foods TO service_role;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read foods" ON public.foods FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manage foods" ON public.foods FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER trg_foods_updated_at BEFORE UPDATE ON public.foods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= RECIPES (global) =============
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  difficulty public.recipe_difficulty NOT NULL DEFAULT 'easy',
  prep_time_min INTEGER,
  cook_time_min INTEGER,
  cost_estimate NUMERIC(6,2),
  image_url TEXT,
  servings INTEGER NOT NULL DEFAULT 1,
  instructions TEXT,
  allergens TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_recipes_name ON public.recipes(name);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipes TO authenticated;
GRANT ALL ON public.recipes TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read recipes" ON public.recipes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manage recipes" ON public.recipes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER trg_recipes_updated_at BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= RECIPE_INGREDIENTS =============
CREATE TABLE public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE RESTRICT,
  grams NUMERIC(7,2) NOT NULL,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_recipe_ingredients_recipe ON public.recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_food ON public.recipe_ingredients(food_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_ingredients TO authenticated;
GRANT ALL ON public.recipe_ingredients TO service_role;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read recipe_ingredients" ON public.recipe_ingredients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manage recipe_ingredients" ON public.recipe_ingredients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- ============= MENUS (global, por nivel calórico) =============
CREATE TABLE public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kcal_level INTEGER NOT NULL,
  total_kcal NUMERIC(7,2) NOT NULL,
  total_protein_g NUMERIC(7,2) NOT NULL DEFAULT 0,
  total_carbs_g NUMERIC(7,2) NOT NULL DEFAULT 0,
  total_fat_g NUMERIC(7,2) NOT NULL DEFAULT 0,
  total_fiber_g NUMERIC(7,2) DEFAULT 0,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_menus_kcal_level ON public.menus(kcal_level);
CREATE INDEX idx_menus_active ON public.menus(is_active);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.menus TO authenticated;
GRANT ALL ON public.menus TO service_role;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read menus" ON public.menus FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manage menus" ON public.menus FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER trg_menus_updated_at BEFORE UPDATE ON public.menus
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= MENU_SLOTS =============
CREATE TABLE public.menu_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  slot_type public.meal_slot_type NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  target_kcal NUMERIC(6,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_menu_slots_menu ON public.menu_slots(menu_id, order_index);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_slots TO authenticated;
GRANT ALL ON public.menu_slots TO service_role;
ALTER TABLE public.menu_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read menu_slots" ON public.menu_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manage menu_slots" ON public.menu_slots FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- ============= MENU_SLOT_OPTIONS =============
CREATE TABLE public.menu_slot_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES public.menu_slots(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE RESTRICT,
  serving_grams NUMERIC(7,2),
  option_kcal NUMERIC(6,2),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_menu_slot_options_slot ON public.menu_slot_options(slot_id);
CREATE INDEX idx_menu_slot_options_recipe ON public.menu_slot_options(recipe_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_slot_options TO authenticated;
GRANT ALL ON public.menu_slot_options TO service_role;
ALTER TABLE public.menu_slot_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read menu_slot_options" ON public.menu_slot_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manage menu_slot_options" ON public.menu_slot_options FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
