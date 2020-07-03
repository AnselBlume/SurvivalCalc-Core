import { calculate, Pokemon } from '@smogon/calc';
import { Generation } from '@smogon/calc/dist/data/interface';
import { getKOChance } from 'ko-chance';
import { SurvivalRequirement, HPRequirement, Requirements } from 'model/requirements';

/**
 * Determines whether the defending Pokemon specified by the first attack in the first
 * SurvivalRequirement meets the SurvivalRequirement and the HPRequirement.
 * 
 * @param requirements The set of requirements to check.
 */
export function meetsReqs(requirements: Requirements): boolean {
    const hpReq: HPRequirement = requirements.hpReq;
    const survivalReqs: SurvivalRequirement[] = requirements.survivalReqs;

    if (!meetsHPReq(survivalReqs[0].attacks[0].defender, hpReq)) {
        return false;
    }

    for (const survivalReq of survivalReqs) {
        if (!meetsSurvivalReq(survivalReq)) {
            return false;
        }
    }

    return true;
}

/**
   * Determines whether the defending Pokemon survives the series of attacks with a percentage of HP left over
   * a certain percent of the time.
   * 
   * @param requirement The SurvivalRequirement object specifying the attack series, defending Pokemon, percentRemaining,
   * and percentTime to be met.
   */
export function meetsSurvivalReq(requirement: SurvivalRequirement): boolean {
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
 * Determines whether the defending Pokemon's HP stat is a value that meets the desired requirements, if any.
 * These include minmizing weather/burn damage, minimizing Life Orb recoil, causing Sitrus Berry to activate
 * after Super Fang, having the ability to substitute four times, and having the ability to substitute
 * five times while holding Leftovers.
 * 
 * @param defender The defending Pokemon with the HP stat to consider. 
 * @param requirement The HPRequirement to be checked.
 */
export function meetsHPReq(defender: Pokemon, requirement: HPRequirement): boolean {
    const hpStat = defender.maxHP();

    // TODO: Consider adding in combinations of these special numbers 
    // (e.g. reduceLifeOrb && sitrusSuperFang ==> hpStat % 10 == 8)

    if (requirement.reduceWeather && hpStat % 16 !== 15) {
        return false;
    } else if (requirement.reduceLifeOrb && hpStat % 10 !== 9) {
        return false;
    } else if (requirement.sitrusSuperFang && hpStat % 2 !== 0) {
        return false;
    } else if (requirement.fourSubs && hpStat % 4 === 0) {
        return false;
    } else if (requirement.fiveSubs) {
        const mod16 = hpStat % 16;
        if (mod16 !== 1 && mod16 !== 2 && mod16 !== 3 && mod16 !== 6 && mod16 !== 7 && mod16 !== 11) {
            return false;
        }
    }

    return true;
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