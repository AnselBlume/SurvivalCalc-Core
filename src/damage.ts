import { Attack } from 'model/attack';
import { calculate } from '@smogon/calc';
import { Generation } from '@smogon/calc/dist/data/interface';

/**
 * Calls the Smogon calculator API to get the damage rolls for each attack.
 * 
 * @param attacks Array of array of numbers where each array of numbers represents the
 * rolls from one attack. 
 */
export function getDamageRolls(...attacks: Attack[]): number[][] {
    const damageRolls: number[][] = []; // Array of damage rolls from each attack
    const gen: Generation = attacks[0].attacker.gen; // Extract generation from first attacker

    attacks.forEach(attack => 
        damageRolls.push(...toRolls(calculate(gen, attack.attacker, attack.defender, attack.move, attack.field).damage)));

    return damageRolls;
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
