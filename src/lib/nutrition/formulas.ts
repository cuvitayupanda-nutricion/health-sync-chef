/**
 * 7RISE Nutrition Engine — Fórmulas puras
 * Sin dependencias, sin IA. Solo cálculo determinístico.
 */

export type Sex = "male" | "female";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type NutritionGoal = "lose_fat" | "maintain" | "gain_muscle";
export type CalcMethod = "mifflin_st_jeor" | "katch_mcardle" | "harris_benedict";

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const GOAL_ADJUSTMENT: Record<NutritionGoal, number> = {
  lose_fat: -0.2, // -20%
  maintain: 0,
  gain_muscle: 0.15, // +15%
};

/** Mifflin-St Jeor — recomendado por defecto. */
export function bmrMifflin(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

/** Katch-McArdle — requiere % grasa. */
export function bmrKatch(weightKg: number, bodyFatPct: number): number {
  const leanMass = weightKg * (1 - bodyFatPct / 100);
  return 370 + 21.6 * leanMass;
}

/** Harris-Benedict revisado (1984). */
export function bmrHarris(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex,
): number {
  return sex === "male"
    ? 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
    : 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
}

export function calculateBMR(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  bodyFatPct?: number | null;
  method?: CalcMethod;
}): number {
  const { weightKg, heightCm, age, sex, bodyFatPct, method = "mifflin_st_jeor" } = params;
  if (method === "katch_mcardle" && bodyFatPct != null) {
    return bmrKatch(weightKg, bodyFatPct);
  }
  if (method === "harris_benedict") {
    return bmrHarris(weightKg, heightCm, age, sex);
  }
  return bmrMifflin(weightKg, heightCm, age, sex);
}

export function calculateTDEE(bmr: number, activity: ActivityLevel): number {
  return bmr * ACTIVITY_FACTORS[activity];
}

export function calculateTargetKcal(tdee: number, goal: NutritionGoal): number {
  return Math.round(tdee * (1 + GOAL_ADJUSTMENT[goal]));
}

export interface MacroSplit {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/**
 * Distribución de macros por objetivo (g/kg de peso corporal para proteína
 * y grasa; carbohidratos rellenan las kcal restantes).
 */
export function calculateMacros(
  weightKg: number,
  targetKcal: number,
  goal: NutritionGoal,
): MacroSplit {
  const proteinPerKg = goal === "gain_muscle" ? 2.0 : goal === "lose_fat" ? 2.2 : 1.8;
  const fatPerKg = goal === "lose_fat" ? 0.8 : 1.0;

  const protein_g = Math.round(weightKg * proteinPerKg);
  const fat_g = Math.round(weightKg * fatPerKg);
  const remainingKcal = targetKcal - (protein_g * 4 + fat_g * 9);
  const carbs_g = Math.max(0, Math.round(remainingKcal / 4));

  return { protein_g, carbs_g, fat_g };
}

/** Hidratación: 35 ml por kg de peso corporal. */
export function calculateWaterMl(weightKg: number): number {
  return Math.round(weightKg * 35);
}

/** Micronutrientes de referencia (adulto sano, valores aproximados). */
export function referenceMicros(sex: Sex) {
  return {
    fiber_g: 30,
    calcium_mg: 1000,
    iron_mg: sex === "female" ? 18 : 8,
    potassium_mg: 3500,
    sodium_mg: 2300,
  };
}
