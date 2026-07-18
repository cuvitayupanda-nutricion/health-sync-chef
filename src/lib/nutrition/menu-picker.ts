/**
 * Selector de menú por cercanía calórica.
 * Dado un `target_kcal` y una lista de menús activos, elige el más cercano.
 */

export interface MenuCandidate {
  id: string;
  name: string;
  kcal_level: number;
  total_kcal: number;
}

export function pickClosestMenu<T extends MenuCandidate>(
  targetKcal: number,
  menus: T[],
): T | null {
  if (menus.length === 0) return null;
  let best = menus[0];
  let bestDelta = Math.abs(best.total_kcal - targetKcal);
  for (let i = 1; i < menus.length; i++) {
    const delta = Math.abs(menus[i].total_kcal - targetKcal);
    if (delta < bestDelta) {
      best = menus[i];
      bestDelta = delta;
    }
  }
  return best;
}
