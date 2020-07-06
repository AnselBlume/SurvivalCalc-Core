import { Spread } from 'model/spread';
import { Attack } from 'model/attack';
import { LossFunction } from 'util/loss-func';
import { applySpread } from 'util/apply-spread';
import { getDamageRolls } from 'util/damage';
import { getKOChance } from 'util/ko-chance';

export class SpreadComparator {
    bestSpread: Spread;

    lossFunc: LossFunction;
    bestLoss: number;

    attacks: Attack[];
    bestHitsToKO: number;
    bestXHKOChance: number;
    bestDmgPercent: number;

    /**
     * Initializes the SpreadComparator object. The toMinimize parameter is either a loss
     * function or an array of attacks whose damage will be minimized according to the following
     * criteria in descending order of importance.
     * 
     * When maximum damage is rolled,
     * 
     * - Choose the spread which results in the lowest number X in a possible or guaranteed XHKO.
     * 
     * - Choose the spread which has the lower likelihood to XHKO.
     * 
     * - Choose the spread which results in a lower percentage of HP dealt as damage.
     * 
     * If the toMinimize parameter is an array of Attacks, the defenders of each Attack object
     * will have their EVs modified.
     * 
     * @param toMinimize The input to minimize: either a LossFunction or an array of Attacks whose damage
     * will be minimized. 
     */
    constructor(toMinimize: LossFunction | Attack[]) {
        if ((toMinimize as LossFunction).loss) {
            this.lossFunc = toMinimize as LossFunction;
        } else {
            this.attacks = toMinimize as Attack[];
        }
    }

    /**
     * Ingests the spread and compares it to those encountered previously.
     * 
     * @param spread The new spread to compare. 
     */
    ingestSpread(spread: Spread): void {
        if (this.lossFunc) { // Loss function mode
            const loss = this.lossFunc.loss(spread);
            
            if (!this.bestSpread || loss < this.bestLoss) {
                this.bestSpread = spread;
                this.bestLoss = loss;
            }
        } else { // Compare spreads by damage
            applySpread(spread, this.attacks);
            const damageRolls: number[][] = getDamageRolls(...this.attacks);
            const maxDamage = damageRolls.reduce((x, y) => x + y[y.length - 1], 0);

            // Save the new spread if it is better
            let isBetterSpread = false;
            
            // Check the number of hits to KO
            const hitsToKO: number = this.getHitsToKO(maxDamage);

            if (this.bestHitsToKO) {
                if (hitsToKO < this.bestHitsToKO) { // New spread takes fewer hits before getting KO'd
                    return;
                } else if (hitsToKO > this.bestHitsToKO) {
                    isBetterSpread = true;
                }
            }

            // Number of hits is equal or better than the best
            // If equal, compare XHKO chances. If better, compute XHKO chance anyways to save as the best
            const xhkoRolls: number[][] = []; // Copy damageRolls numOfHits times to compute XHKO chance
            for (let i = 0; i < hitsToKO; i++) {
                xhkoRolls.push(...damageRolls);
            }

            const xhkoChance = getKOChance(this.attacks[0].defender.maxHP(), ...xhkoRolls);

            if (this.bestXHKOChance) {
                if (xhkoChance > this.bestXHKOChance) {
                    return;
                } else if (xhkoChance < this.bestXHKOChance) {
                    isBetterSpread = true;
                }
            }

            // KO chance is equal or better than the best
            // If equal, compare damage percents. If better, compute damage percent anyways to save as the best
            // Note that if s.dmgPercent < s'.dmgPercent, then X hits of maxDamage still has s.dmgPercent < s'.dmgPercent
            const dmgPercent = this.getDamagePercent(maxDamage);

            if (this.bestDmgPercent) {
                if (dmgPercent > this.bestDmgPercent) {
                    return;
                } else if (dmgPercent < this.bestDmgPercent) {
                    isBetterSpread = true;
                }
            }

            // Save the spread and its associated calculations if it is better or it is the first
            if (!this.bestSpread || isBetterSpread) {
                this.bestSpread = spread;
                this.bestHitsToKO = hitsToKO;
                this.bestXHKOChance = xhkoChance;
                this.bestDmgPercent = dmgPercent;
            }
        }
    }

    private getHitsToKO(maxDamage: number): number {
        return Math.ceil(this.attacks[0].defender.maxHP() / maxDamage);
    }

    private getDamagePercent(maxDamage: number): number {
        return maxDamage / this.attacks[0].defender.maxHP() * 100;
    }
}
