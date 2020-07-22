import { Spread, Stat, Attack } from '../model';
import { Pokemon, calcStat } from '@smogon/calc';

/**
 * Applies the specified EV spread to the defending Pokemon in each of the Attack objects.
 * 
 * @param spread The spread to be applied.
 * @param attacks The Attack array whose defenders will have their EV spreads and stats changed.
 */
export function applySpread(spread: Spread, attacks: Attack[]): void {
    for (let i = 0; i < attacks.length; i++) {
        const defender: Pokemon = attacks[i].defender;

        for (const stat of [Stat.HP, Stat.DEF, Stat.SDEF]) {
            defender.evs[stat] = spread[stat]; // Update EVs

            // Update stat
            const newStat = calcStat(defender.gen, stat, defender.species.baseStats[stat],
                                     defender.ivs[stat], defender.evs[stat], defender.level, defender.nature);
            defender.stats[stat] = newStat;
            defender.rawStats[stat] = newStat;
        }
    }
}
