/**
 * 7RISE Nutrition Engine — Orquestador puro.
 *
 * Toma una evaluación (assessment) y devuelve el objetivo calórico + macros
 * + micros + hidratación. NO consulta la base de datos ni llama a IA.
 * La selección del menú más cercano se hace por separado en `menu-picker.ts`.
 */

import {
  calculateBMR,
  calculateMacros,
  calculateTDEE,
  calculateTargetKcal,
  calculateWaterMl,
  referenceMicros,
  type ActivityLevel,
  type CalcMethod,
  type MacroSplit,
  type NutritionGoal,
  type Sex,
} from "./formulas";

export interface EngineInput {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  bodyFatPct?: number | null;
  activity: ActivityLevel;
  goal: NutritionGoal;
  method?: CalcMethod;
}

export interface EngineResult {
  bmr: number;
  tdee: number;
  target_kcal: number;
  macros: MacroSplit;
  water_ml: number;
  micros: {
    fiber_g: number;
    calcium_mg: number;
    iron_mg: number;
    potassium_mg: number;
    sodium_mg: number;
  };
  meta: {
    method: CalcMethod;
    activity: ActivityLevel;
    goal: NutritionGoal;
  };
}

export function runNutritionEngine(input: EngineInput): EngineResult {
  const method = input.method ?? "mifflin_st_jeor";
  const bmr = calculateBMR({
    weightKg: input.weightKg,
    heightCm: input.heightCm,
    age: input.age,
    sex: input.sex,
    bodyFatPct: input.bodyFatPct,
    method,
  });
  const tdee = calculateTDEE(bmr, input.activity);
  const target_kcal = calculateTargetKcal(tdee, input.goal);
  const macros = calculateMacros(input.weightKg, target_kcal, input.goal);
  const water_ml = calculateWaterMl(input.weightKg);
  const micros = referenceMicros(input.sex);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target_kcal,
    macros,
    water_ml,
    micros,
    meta: { method, activity: input.activity, goal: input.goal },
  };
}
