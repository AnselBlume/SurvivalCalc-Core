import { Requirements, Spread, SurvivalRequirement, Stat } from './model';
import { Pokemon } from '@smogon/calc';
import { MoveCategory } from '@smogon/calc/dist/data/interface';
import { MinEVsLoss, MinHPLoss, MaxHPLoss } from './utilities/loss-func';
import { validateInput, SpreadGenerator, SpreadComparator, meetsReqs, applySpread } from './utilities';

/**
 * Finds the EV spread which meets the requirements which uses the fewest total EVs.
 *
 * @param requirements The Requirements to be met.
 */
export function findMinEVs(requirements: Requirements): Spread {
    validateInput(requirements);

    // Extract defending Pokemon from first requirement's first attack for SpreadGenerator
    const defender: Pokemon = requirements.survivalReqs[0].attacks[0].defender;

    let hpLossFunc: MaxHPLoss | MinHPLoss;

    // Get spreads to consider
    const spreadGen: SpreadGenerator = new SpreadGenerator(defender);
    let spreads: Generator<Spread, void, void>;

    // If all attacks do damage to the same defensive side we just need to generate EVs
    // for HP and that defensive stat
    if (hasSameDefensiveCategory(requirements.survivalReqs)) {
        const stat: Stat.DEF | Stat.SDEF = getSameDefensiveStat(requirements.survivalReqs);
        spreads = spreadGen.getOneSidedSpreads(stat);
        hpLossFunc = new MaxHPLoss(); // Maximize HP for overall bulk
    } else {
        spreads = spreadGen.getAllSpreads();
        hpLossFunc = new MinHPLoss(); // Minimize HP for draining moves
    }
    const minEVsLossFunc: MinEVsLoss = new MinEVsLoss(hpLossFunc);

    // Find best EV spread
    const comparator: SpreadComparator = new SpreadComparator(minEVsLossFunc);
    let bestEVTotal = Infinity;
    const minimizingHP = hpLossFunc instanceof MinHPLoss; // Are we minimizing HP

    for (const spread of spreads) {
        // We could simply check whether each spread meets the requirements then let the SpreadComparator
        // use the MinimizeEVs loss function to find the best spread. However, calling meetsReqs on every
        // spread is expensive. Check whether the spread has fewer EVs than the best first and if the HP
        // is either higher or lower than the best, depending on whether we're maximizing or minimizing it
        const evTotal = spread[Stat.HP] + spread[Stat.DEF] + spread[Stat.SDEF];
        const hasBadHP = comparator.bestSpread
                         && (minimizingHP && spread[Stat.HP] > comparator.bestSpread[Stat.HP]
                             || !minimizingHP && spread[Stat.HP] < comparator.bestSpread[Stat.HP]);

        if (evTotal > bestEVTotal || evTotal === bestEVTotal && hasBadHP) {
            continue;
        }

        // Apply spread to each defender
        requirements.survivalReqs.forEach(survivalReq => applySpread(spread, survivalReq.attacks));

        if (meetsReqs(requirements) && comparator.ingestSpread(spread)) { // Meets requirements and is better
            bestEVTotal = evTotal;
        }
    }

    if (!comparator.bestSpread) {
        throw new Error('The defending Pokemon cannot meet the specified requirements');
    }

    return comparator.bestSpread;
}

/**
 * Checks whether each Attack of each SurvivalRequirement does damage to the same defensive side.
 *
 * @param survivalReqs The array of SurvivalRequirements to check.
 */
function hasSameDefensiveCategory(survivalReqs: SurvivalRequirement[]): boolean {
    const defensiveCategory: MoveCategory = survivalReqs[0].attacks[0].move.defensiveCategory;

    for (const survivalReq of survivalReqs) {
        for (const attack of survivalReq.attacks) {
            if (attack.move.defensiveCategory !== defensiveCategory) {
                return false;
            }
        }
    }

    return true;
}

/**
 * Gets the defensive Stat corresponding to the defensive category shared by all attacks.
 *
 * @param survivalReqs The SurvivalRequirements to extract the defensive category from.
 * @throws A TypeError if the defensive category is 'Status'.
 */
function getSameDefensiveStat(survivalReqs: SurvivalRequirement[]): Stat.DEF | Stat.SDEF {
    const defensiveCategory: MoveCategory = survivalReqs[0].attacks[0].move.defensiveCategory;

    if (defensiveCategory === 'Physical') {
        return Stat.DEF;
    } else { // defensiveCategory === 'Special' as already validated input
        return Stat.SDEF;
    }
}
