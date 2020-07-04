import { Pokemon } from '@smogon/calc';
import { getDamageRolls } from 'damage';
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
    const damageRolls: number[][] = getDamageRolls(...requirement.attacks);

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