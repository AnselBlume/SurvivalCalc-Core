import { Spread } from 'model/spread';
import { Stat } from 'model/stat';

/**
 * A class whose loss function determines how bad a Spread is.
 */
export interface LossFunction {
    loss(spread: Spread): number;
}

export class MinimizeHP implements LossFunction {
    loss(spread: Spread): number {
        return spread[Stat.HP];
    }
}

export class MaximizeHP implements LossFunction {
    loss(spread: Spread): number {
        return -spread[Stat.HP];
    }
}

export class MinimizeEVs implements LossFunction {
    mode: MinimizeHP | MaximizeHP;

    constructor(mode: MinimizeHP | MaximizeHP) {
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
