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

export interface CalorieLevelCandidate {
  id: string;
  kcal_level: number;
  label: string;
}

export function pickClosestMenu<T extends MenuCandidate>(targetKcal: number, menus: T[]): T | null {
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

export function pickClosestCalorieLevel<T extends CalorieLevelCandidate>(
  targetKcal: number,
  levels: T[],
): T | null {
  if (levels.length === 0) return null;
  let best = levels[0];
  let bestDelta = Math.abs(best.kcal_level - targetKcal);
  for (let i = 1; i < levels.length; i++) {
    const delta = Math.abs(levels[i].kcal_level - targetKcal);
    if (delta < bestDelta) {
      best = levels[i];
      bestDelta = delta;
    }
  }
  return best;
}
