import { z } from "zod";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  runNutritionEngine,
  type ActivityLevel,
  type CalcMethod,
  type NutritionGoal,
  type Sex,
} from "@/lib/nutrition";
import { pickClosestMenu } from "@/lib/nutrition/menu-picker";

const intakeSchema = z.object({
  org_id: z.string().uuid(),
  generated_by: z.string().uuid().optional().nullable(),
  client: z.object({
    external_id: z.string().min(1).optional().nullable(),
    full_name: z.string().min(1),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    sex: z.enum(["male", "female"]).optional().nullable(),
    birth_date: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
  assessment: z.object({
    weight_kg: z.number().positive(),
    height_cm: z.number().positive(),
    age: z.number().int().positive().optional(),
    sex: z.enum(["male", "female"]),
    body_fat_pct: z.number().min(0).max(80).optional().nullable(),
    muscle_mass_kg: z.number().positive().optional().nullable(),
    visceral_fat: z.number().nonnegative().optional().nullable(),
    physical_activity_level: z
      .enum(["sedentary", "light", "moderate", "active", "very_active"])
      .default("moderate"),
    nutrition_goal: z.enum(["lose_fat", "maintain", "gain_muscle"]).default("maintain"),
    get_calculation_method: z
      .enum(["mifflin_st_jeor", "katch_mcardle", "harris_benedict"])
      .default("mifflin_st_jeor"),
    calculation_date: z.string().optional().nullable(),
  }),
  source: z.string().default("inbody_webhook"),
});

type IntakePayload = z.infer<typeof intakeSchema>;

export async function handlePublicIntake(request: Request): Promise<Response> {
  try {
    if (request.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405, { Allow: "POST" });
    }

    const rawBody = await request.text();
    const payload = parsePayload(rawBody);
    if (!payload.ok) return json(payload.body, 400);

    const organization = await getOrganization(payload.data.org_id);
    if (!organization) return json({ error: "organization_not_found" }, 404);
    if (!organization.webhook_secret) return json({ error: "webhook_secret_not_configured" }, 409);

    const signature =
      request.headers.get("x-7rise-signature") ?? request.headers.get("x-signature");
    if (!signature) return json({ error: "missing_signature" }, 401);

    const verified = await verifyHmac(rawBody, organization.webhook_secret, signature);
    if (!verified) return json({ error: "invalid_signature" }, 401);

    const result = await createNutritionPlan(payload.data, rawBody);
    return json(result, 201);
  } catch (error) {
    if (error instanceof PublicIntakeError) return json({ error: error.code }, error.status);
    console.error(error);
    return json({ error: "intake_failed" }, 500);
  }
}

class PublicIntakeError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}

function parsePayload(
  rawBody: string,
): { ok: true; data: IntakePayload } | { ok: false; body: { error: string; issues?: unknown } } {
  try {
    const parsed = intakeSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      return { ok: false, body: { error: "invalid_payload", issues: parsed.error.flatten() } };
    }
    return { ok: true, data: parsed.data };
  } catch {
    return { ok: false, body: { error: "invalid_json" } };
  }
}

async function getOrganization(orgId: string) {
  const { data, error } = await supabaseAdmin
    .from("organizations")
    .select("id, webhook_secret")
    .eq("id", orgId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function createNutritionPlan(payload: IntakePayload, rawBody: string) {
  const age = payload.assessment.age ?? calculateAge(payload.client.birth_date);
  if (!age) throw new PublicIntakeError(400, "missing_age");

  const client = await upsertClient(payload);
  const assessment = await createAssessment(payload, client.id, age, rawBody);
  const engine = runNutritionEngine({
    weightKg: payload.assessment.weight_kg,
    heightCm: payload.assessment.height_cm,
    age,
    sex: payload.assessment.sex as Sex,
    bodyFatPct: payload.assessment.body_fat_pct,
    activity: payload.assessment.physical_activity_level as ActivityLevel,
    goal: payload.assessment.nutrition_goal as NutritionGoal,
    method: payload.assessment.get_calculation_method as CalcMethod,
  });

  const menu = await findClosestMenu(engine.target_kcal);
  const mealDistribution = menu ? await buildMealDistribution(menu.id) : {};

  const { data: plan, error } = await supabaseAdmin
    .from("nutrition_plans")
    .insert({
      org_id: payload.org_id,
      client_id: client.id,
      assessment_id: assessment.id,
      target_kcal: engine.target_kcal,
      assigned_menu_kcal: menu?.total_kcal ?? null,
      protein_g: engine.macros.protein_g,
      carbs_g: engine.macros.carbs_g,
      fat_g: engine.macros.fat_g,
      fiber_g: engine.micros.fiber_g,
      water_ml: engine.water_ml,
      calcium_mg: engine.micros.calcium_mg,
      iron_mg: engine.micros.iron_mg,
      potassium_mg: engine.micros.potassium_mg,
      sodium_mg: engine.micros.sodium_mg,
      meal_distribution: mealDistribution,
      shopping_list: [],
      menu_id: menu?.id ?? null,
      menu_name: menu?.name ?? null,
      generated_by: payload.generated_by ?? null,
      observations: `BMR ${engine.bmr} kcal; TDEE ${engine.tdee} kcal; metodo ${engine.meta.method}.`,
      status: "draft",
    })
    .select("id, share_id, target_kcal, assigned_menu_kcal, menu_id, menu_name")
    .single();

  if (error) throw error;

  return {
    plan_id: plan.id,
    share_id: plan.share_id,
    client_id: client.id,
    assessment_id: assessment.id,
    target_kcal: plan.target_kcal,
    assigned_menu_kcal: plan.assigned_menu_kcal,
    menu: plan.menu_id ? { id: plan.menu_id, name: plan.menu_name } : null,
  };
}

async function upsertClient(payload: IntakePayload) {
  const baseClient = {
    org_id: payload.org_id,
    full_name: payload.client.full_name,
    email: payload.client.email ?? null,
    phone: payload.client.phone ?? null,
    sex: payload.client.sex ?? payload.assessment.sex,
    birth_date: payload.client.birth_date ?? null,
    notes: payload.client.notes ?? null,
    external_id: payload.client.external_id ?? null,
  };

  if (payload.client.external_id) {
    const { data: existing, error: selectError } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("org_id", payload.org_id)
      .eq("external_id", payload.client.external_id)
      .maybeSingle();

    if (selectError) throw selectError;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from("clients")
        .update(baseClient)
        .eq("id", existing.id)
        .select("id")
        .single();

      if (error) throw error;
      return data;
    }
  }

  const { data, error } = await supabaseAdmin
    .from("clients")
    .insert(baseClient)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

async function createAssessment(
  payload: IntakePayload,
  clientId: string,
  age: number,
  rawBody: string,
) {
  const { data, error } = await supabaseAdmin
    .from("assessments")
    .insert({
      org_id: payload.org_id,
      client_id: clientId,
      weight_kg: payload.assessment.weight_kg,
      height_cm: payload.assessment.height_cm,
      age,
      sex: payload.assessment.sex,
      body_fat_pct: payload.assessment.body_fat_pct ?? null,
      muscle_mass_kg: payload.assessment.muscle_mass_kg ?? null,
      visceral_fat: payload.assessment.visceral_fat ?? null,
      physical_activity_level: payload.assessment.physical_activity_level,
      nutrition_goal: payload.assessment.nutrition_goal,
      get_calculation_method: payload.assessment.get_calculation_method,
      calculation_date: payload.assessment.calculation_date ?? new Date().toISOString(),
      source: payload.source,
      raw_payload: JSON.parse(rawBody),
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

async function findClosestMenu(targetKcal: number) {
  const { data, error } = await supabaseAdmin
    .from("menus")
    .select("id, name, kcal_level, total_kcal")
    .eq("is_active", true);

  if (error) throw error;
  return pickClosestMenu(targetKcal, data ?? []);
}

async function buildMealDistribution(menuId: string) {
  const { data, error } = await supabaseAdmin
    .from("menu_slots")
    .select(
      "id, name, slot_type, order_index, target_kcal, menu_slot_options(id, order_index, serving_grams, option_kcal, recipes(id, name, description))",
    )
    .eq("menu_id", menuId)
    .order("order_index", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((slot) => {
    const options = [...(slot.menu_slot_options ?? [])].sort(
      (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
    );
    const selected = options[0] ?? null;
    return {
      slot: slot.slot_type,
      name: slot.name,
      target_kcal: slot.target_kcal,
      selected_option: selected
        ? {
            id: selected.id,
            serving_grams: selected.serving_grams,
            kcal: selected.option_kcal,
            recipe: selected.recipes,
          }
        : null,
    };
  });
}

async function verifyHmac(rawBody: string, secret: string, signature: string): Promise<boolean> {
  const expected = await signBody(rawBody, secret);
  const received = normalizeSignature(signature);
  return constantTimeEqual(expected, received);
}

async function signBody(rawBody: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizeSignature(signature: string): string {
  return signature
    .trim()
    .replace(/^sha256=/i, "")
    .toLowerCase();
}

function constantTimeEqual(a: string, b: string): boolean {
  if (!/^[a-f0-9]+$/.test(a) || !/^[a-f0-9]+$/.test(b)) return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function calculateAge(birthDate?: string | null): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - birth.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age > 0 ? age : null;
}

function json(body: unknown, status = 200, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}
