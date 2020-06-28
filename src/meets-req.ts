import { calculate } from '@smogon/calc';
import { Generation } from '@smogon/calc/dist/data/interface';
import { getKOChance } from 'ko-chance';
import { Requirement } from 'model/requirement';

/**
   * Determines whether the defending Pokemon survives the series of attacks with a percentage of HP left over
   * a certain percent of the time.
   * 
   * @param requirement The Requirement object specifying the attack series, defending Pokemon, percentRemaining,
   * and percentTime to be met.
   */
export function meetsReq(requirement: Requirement): boolean {
    const gen: Generation = requirement.attacks[0].attacker.gen; // Extract generation from first attacker
    const damageRolls: number[][] = []; // Array of damage rolls from each attack

    // Add each attack's damage rolls to the damageRolls array
    requirement.attacks.forEach(attack => 
        damageRolls.push(...toRolls(calculate(gen, attack.attacker, attack.defender, attack.move, attack.field).damage)));

    // Extract maxHP from defender of first attack (they should all be the same Pokemon)
    const maxHP: number = requirement.attacks[0].defender.maxHP();
    const effectiveHP: number = maxHP * (1 - requirement.percentRemaining / 100);

    return 1 - getKOChance(effectiveHP, ...damageRolls) >= requirement.percentTime / 100;
}

/**
 * Converts the damage field of the Result object returned by Smogon's calculate function to an
 * array of arrays. The damage field may be a number for fixed damage moves (e.g. Seismic Toss), an
 * array of 16 numbers for a normal damage roll, an array of two numbers for Parental Bond fixed-damage
 * moves, and an array of two length-sixteen arrays for a normal Parental Bond attack.
 * 
 * @param damage damage field output by Result object returned by the calculate function
 */
function toRolls(damage: number | number[] | [number, number] | [number[], number[]]): number[][] {
    if (typeof damage === 'number') { // number
        return [[damage]];
    } else if ((damage as number[]).length > 2) { // number[]
        return [damage as number[]];
    } else { // damage.length == 2
        if (typeof damage[0] === 'number') { // [number, number]
            return [[damage[0] as number], [damage[1] as number]];
        } else { // [number[], number[]]
            return damage as [number[], number[]];
        }
    }
}