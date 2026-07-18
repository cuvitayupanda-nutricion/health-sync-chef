-- Paso 3: webhook publico de intake desde Plataforma 1.
-- Cada organizacion define su secreto compartido para validar HMAC.

ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS webhook_secret TEXT;

COMMENT ON COLUMN public.organizations.webhook_secret IS
  'Secreto compartido para validar firmas HMAC del webhook /api/public/intake. No exponer al cliente.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_org_external_id
ON public.clients(org_id, external_id)
WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS nutrition_plans_assessment_idx
ON public.nutrition_plans(assessment_id);
