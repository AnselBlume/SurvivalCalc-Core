import { Attack } from 'model/attack';

/**
 * A series of consecutive attacks for a defending Pokemon to survive with at least 
 * the specified percent of HP remaining a certain percent of the time. 
 *
 * The defending Pokemon's species should stay constant throughout all attacks, but
 * other factors (e.g. boosts and items) may vary.
 */
export class Requirement {
    attacks: Attack[];
    percentRemaining: number;
    percentTime: number;

    constructor(percentRemaining: number, percentTime: number, ...attacks: Attack[]) {
        this.percentRemaining = percentRemaining;
        this.percentTime = percentTime;
        this.attacks = attacks;
    }
}
