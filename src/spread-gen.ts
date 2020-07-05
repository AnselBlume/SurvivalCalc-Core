import { Pokemon, Generations } from '@smogon/calc/';
import { Stats } from '@smogon/calc/dist/stats';
import { Spread, Stat } from 'model';

export class SpreadGenerator {
    defender: Pokemon;

    constructor(defender: Pokemon) {
        this.defender = defender;
    }

    /**
     * Generates all possible spreads up to maxEVs EVs. Generated spreads do not have
     * extra EVs that do not change the stats.
     *
     * @param maxEVs The maximum number of EVs that can be used to generate a spread.
     */
    *getAllSpreads(maxEVs = 508): Generator<Spread, void, void> {
        let spread = new Spread();

        for (let hpEVs = 0; hpEVs <= 252;) {
            for (let defEVs = 0; defEVs <= 252;) {
                for (let sDefEVs = 0; sDefEVs <= 252;) {
                    if (hpEVs + defEVs + sDefEVs > maxEVs) {
                        break;
                    }
                    spread = new Spread(hpEVs, defEVs, sDefEVs);
                    yield spread;

                    sDefEVs += this.getNextIncrement(spread, Stat.SDEF);
                }
                defEVs += this.getNextIncrement(spread, Stat.DEF);
            }
            hpEVs += this.getNextIncrement(spread, Stat.HP);
        }
    }

    /**
     * Generates a subset of getAllSpreads(maxEVs) which is "maximal" in the sense that
     * for each spread s in getAllSpreads(maxEVs), there exists a spread s' in getMaximalSpreads(maxEVs)
     * such that s.hpEVs <= s'.hpEVs, s.defEVs <= s'.defEVs, and s.sDefEVs <= s'.sDefEVs. Thus,
     * running a search to find the best spread using up to a certain amount of EVs runs faster
     * when calling this method.
     *
     * May have extra EVs that do not change the stat, so the user should call removeExtraEVs 
     * on the spread when appropriate (this is for optimization purposes, as calling removeExtraEVs 
     * on every generated spread would be expensive).
     *
     * @param maxEVs The maximum total EVs a spread will have.
     */
    *getMaximalSpreads(maxEVs: number): Generator<Spread, void, void> {
        maxEVs = Math.min(Math.max(0, maxEVs), 508); // Restrict to {0, ... , 508}
        let spread = new Spread();

        for (let hpEVs = 0; hpEVs <= 252;) {
            if (hpEVs > maxEVs) {
                break;
            }

            for (let defEVs = 0; defEVs <= 252;) {
                const sDefEVs = Math.min(maxEVs - hpEVs - defEVs, 252);

                // sDefEVs must be valid. Also ensures that defEVs <= totalEVs
                if (sDefEVs >= 0) {
                    spread = new Spread(hpEVs, defEVs, sDefEVs);
                    yield spread;
                }

                defEVs += this.getNextIncrement(spread, Stat.DEF);
            }
            hpEVs += this.getNextIncrement(spread, Stat.HP);
        }
    }

    /**
     * Generates all possible spreads with HP and the selected defensive side.
     *
     * @param side The defensive side, along with HP, EVs will be generated for
     */
    *getOneSidedSpreads(side: Stat.DEF | Stat.SDEF): Generator<Spread, void, void> {
        for (let hpEVs = 0; hpEVs <= 252;) {
            const spread = new Spread(hpEVs);

            for (let sideEVs = 0; sideEVs <= 252;) {
                spread[side] = sideEVs;
                yield spread;

                sideEVs += this.getNextIncrement(spread, side);
            }
            hpEVs += this.getNextIncrement(spread, Stat.HP);
        }
    }

    /**
     * Removes extra EVs which do not contribute to stat gain.
     * 
     * @param spread The spread to remove extra EVs from
     */
    removeExtraEVs(spread: Spread): void {
        for (const stat of [Stat.HP, Stat.DEF, Stat.SDEF]) {
            while (spread[stat] % 4 !== 0) { // Bring down to a multiple of four
                spread[stat] -= 1;
            }

            // Remove EVs while doing so doesn't change the stat
            const currentStat: number = this.calcStat(spread[stat], stat);
            while (spread[stat] > 0 && this.calcStat(spread[stat] - 4, stat) === currentStat) {
                spread[stat] -= 4;
            }
        }
    }

    // Generate spreads without extraneous EVs
    private getNextIncrement(spread: Spread, stat: Stat): number {
        if (this.defender.level === 50) { // Hard-code common cases
            if (spread[stat] === 0) {
                return this.defender.ivs[stat] % 2 === 0 ? 8 : 4;
            } else {
                return 8;
            }
        } else if (this.defender.level === 100) {
            return 4;
        } else { // TODO: Consider implementing closed-form/lower bound
            const currentStat = this.calcStat(spread[stat], stat);
            let nextEVs = spread[stat] + 4;

            while (this.calcStat(nextEVs, stat) === currentStat) {
                nextEVs += 4;
            }

            return nextEVs - spread[stat];
        }
    }

    private calcStat(evs: number, stat: Stat) {
        return Stats.calcStat(Generations.get(8), stat, this.defender.species.baseStats[stat],
                              this.defender.ivs[stat], evs, this.defender.level, this.defender.nature);
    }
}
