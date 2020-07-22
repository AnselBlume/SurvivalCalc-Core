import { Spread, Stat, Attack } from '../model';

/**
 * Applies the specified EV spread to the defending Pokemon in each of the Attack objects.
 * 
 * @param spread The spread to be applied.
 * @param attacks The Attack array whose defenders will be cloned with the hp, def, and sDef EVs
 * replaced.
 */
export function applySpread(spread: Spread, attacks: Attack[]): void {
    for (let i = 0; i < attacks.length; i++) {
        const defender = attacks[i].defender;

        defender.evs[Stat.HP] = spread[Stat.HP];
        defender.evs[Stat.DEF] = spread[Stat.DEF];
        defender.evs[Stat.SDEF] = spread[Stat.SDEF];

        // The Pokemon's constructor needs to be called in order to recompute stats from EVs
        attacks[i].defender = defender.clone();
    }
}
