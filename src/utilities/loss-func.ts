import { Spread } from 'model/spread';
import { Stat } from 'model/stat';
import { Pokemon, calcStat, Generations } from '@smogon/calc';

/**
 * A class whose loss function determines how bad a Spread is.
 */
export interface LossFunction {
    loss(spread: Spread): number;
}

/**
 * Loss function to minimize HP
 */
export class MinHPLoss implements LossFunction {
    loss(spread: Spread): number {
        return spread[Stat.HP];
    }
}

/**
 * Loss function to maximize HP
 */
export class MaxHPLoss implements LossFunction {
    loss(spread: Spread): number {
        return -spread[Stat.HP];
    }
}

/**
 * Loss function to minimize EVs while minimizing or maximizing HP
 */
export class MinEVsLoss implements LossFunction {
    mode: MinHPLoss | MaxHPLoss;

    constructor(mode: MinHPLoss | MaxHPLoss) {
        this.mode = mode;
    }

    loss(spread: Spread): number {
        const evTotal = spread[Stat.HP] + spread[Stat.DEF] + spread[Stat.SDEF];

        // Multiplying evTotal by 1000 ensures a smaller EV total is always selected
        // over minimizing/maximizing HP as [Min,Max]imizeHP returns a number with abs
        // value in {0, ... , 255}
        return 1000 * evTotal + this.mode.loss(spread);
    }
}

/**
 * Loss function to find spreads with the best overall bulk. The weight parameter in [0, 1] controls
 * how much attention is paid to the def/sDef side, with a weight of 0 maximizing defensive bulk
 * and a weight of 1 maximizing special defensive bulk. A weight of .5 balances the bulk equally.
 *
 * This loss function was derived in a similar fashion to X-Act's original here:
 * https://www.smogon.com/dp/articles/maximizing_defenses
 */
export class BulkLoss implements LossFunction {
    defender: Pokemon;
    damageConst: number;
    weight: number;

    constructor(defender: Pokemon, weight: number) {
        if (weight < 0 || weight > 1) {
            throw new TypeError('weight argument must be in [0, 1]');
        }

        this.defender = defender;
        this.weight = weight;

        // Compute damage constant
        // Assume attacker has same level as defender, base 100 power move, base 120 attack and boosting nature
        this.damageConst = (2 * defender.level / 5 + 2) * 2
                           * calcStat(Generations.get(8), Stat.ATK, 120, 31, 252, defender.level, 'Adamant');
    }

    loss(spread: Spread): number {
        const hpStat = calcStat(Generations.get(8), Stat.HP, this.defender.species.baseStats[Stat.HP],
                                this.defender.ivs[Stat.HP], spread[Stat.HP], this.defender.level, this.defender.nature);
        const defStat = calcStat(Generations.get(8), Stat.DEF, this.defender.species.baseStats[Stat.DEF],
                                 this.defender.ivs[Stat.DEF], spread[Stat.DEF], this.defender.level, this.defender.nature);
        const sDefStat = calcStat(Generations.get(8), Stat.SDEF, this.defender.species.baseStats[Stat.SDEF],
                                  this.defender.ivs[Stat.SDEF], spread[Stat.SDEF], this.defender.level, this.defender.nature);


        return (this.damageConst * ((1 - this.weight) / defStat + this.weight / sDefStat) + 2) / hpStat;
    }
}
