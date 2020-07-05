import { Attack } from 'model/attack';

/**
 * Specifications for properties the defender's HP stat should satisfy.
 */
export class HPRequirement {
    reduceWeather: boolean; // Minimize passive weather/burn damage: HP = 15 mod 16
    reduceLifeOrb: boolean; // Minimize Life Orb recoil: HP = 9 mod 10
    sitrusSuperFang: boolean; // Sitrus activation on super fang: even HP = 0 mod 2
    fourSubs: boolean; // Five substitutes: HP != 0 mod 4
    fiveSubs: boolean; // Five substitutes with leftovers: HP = 1, 2, 3, 7, or 11 mod 16

    constructor(initializer: {
        reduceWeather?: boolean,
        reduceLifeOrb?: boolean,
        sitrusSuperFang?: boolean,
        fourSubs?: boolean,
        fiveSubs?: boolean
    } = {}) {
        this.reduceWeather = !!initializer.reduceWeather;
        this.reduceLifeOrb = !!initializer.reduceLifeOrb;
        this.sitrusSuperFang = !!initializer.sitrusSuperFang;
        this.fourSubs = !!initializer.fourSubs;
        this.fiveSubs = !!initializer.fiveSubs;
    }
}

/**
 * A series of consecutive attacks for a defending Pokemon to survive with at least
 * the specified percent of HP remaining a certain percent of the time.
 *
 * The defending Pokemon's species should stay constant throughout all attacks, but
 * other factors (e.g. boosts and items) may vary.
 */
export class SurvivalRequirement {
    attacks: Attack[];
    percentRemaining: number;
    percentTime: number;

    constructor(percentRemaining: number, percentTime: number, ...attacks: Attack[]) {
        this.percentRemaining = percentRemaining;
        this.percentTime = percentTime;
        this.attacks = attacks;
    }
}

/**
 * A set of SurvivalRequirements and an HPRequirement.
 */
export class Requirements {
    hpReq: HPRequirement;
    survivalReqs: SurvivalRequirement[];

    constructor(hpReq: HPRequirement, ...survivalReqs: SurvivalRequirement[] ) {
        this.hpReq = hpReq;
        this.survivalReqs = survivalReqs;
    }
}
