import { Requirements } from 'model';
import { SpeciesName, Specie } from '@smogon/calc/dist/data/interface';

/**
 * Performs basic validation on the Requirements object and throws a TypeError if invalid
 * input is detected.
 * 
 * @param requirements The Requirements to be validated.
 */
export function validateInput(requirements: Requirements): void {
    nonEmptyRequirements(requirements);
    sameDefenderBaseSpecies(requirements);
    noStatusMoves(requirements);
}

/**
 * Throws a TypeError if the HPRequirement is falsy or the SurvivalRequirement array
 * has length zero.
 * 
 * @param requirements 
 */
function nonEmptyRequirements(requirements: Requirements): void {
    if (!requirements.hpReq) {
        throw new TypeError(`HPRequirements must be valid (but can be all false): ${requirements.hpReq}`);
    }

    if (requirements.survivalReqs.length === 0) {
        throw new TypeError('One or more SurvivalRequirements must be provided');
    }
}

/**
 * Throws a TypeError if one of the Attacks in the SurvivalRequirements has a status move. 
 * 
 * @param requirements The Requirements with the Attacks to check. 
 * @throws A TypeError if an attack has a status move.
 */
function noStatusMoves(requirements: Requirements): void {
    for (const survivalReq of requirements.survivalReqs) {
        for (const attack of survivalReq.attacks) {
            if (attack.move.defensiveCategory === 'Status') {
                throw new TypeError(`Attacks cannot include status moves: ${attack.move.name}`);
            }
        }
    }
}

/**
 * Throws a TypeError if the defending Pokemon always has the same base species.
 * 
 * Megas have the same base species as their non-mega counterparts, and alternate forms of a
 * Pokemon have the same base species as the base form. 
 * 
 * @param requirements The requirements to check.
 * @throws A TypeError if the defending Pokemon don't have the same base species.
 */
function sameDefenderBaseSpecies(requirements: Requirements): void {
    // baseSpecies is only present if the Pokemon is an alternate form
    let species: Specie = requirements.survivalReqs[0].attacks[0].defender.species;
    const baseSpecies: SpeciesName = species.baseSpecies ? species.baseSpecies : species.name;

    for (const survivalReq of requirements.survivalReqs) {
        for (const attack of survivalReq.attacks) {
            species = attack.defender.species;
            const thisBaseSpecies = species.baseSpecies ? species.baseSpecies : species.name;

            if (thisBaseSpecies !== baseSpecies) {
                throw new TypeError(`Defending Pokemon's base species must be the same: ${baseSpecies} != ${thisBaseSpecies}`);
            }
        }
    }
}
