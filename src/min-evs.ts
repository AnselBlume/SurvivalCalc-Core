import { Requirements, Spread, SurvivalRequirement, Stat } from 'model';
import { Pokemon } from '@smogon/calc';
import { MoveCategory } from '@smogon/calc/dist/data/interface';
import { MinEVsLoss, MinHPLoss, MaxHPLoss } from 'utilities/loss-func';
import { validateInput, SpreadGenerator, SpreadComparator, meetsReqs, applySpread } from 'utilities';

export function getMinEVs(requirements: Requirements): Spread {
    validateInput(requirements);

    // Extract defending Pokemon from first requirement's first attack for SpreadGenerator
    const defender: Pokemon = requirements.survivalReqs[0].attacks[0].defender;

    let lossFunc: MinEVsLoss;

    // Get spreads to consider
    const spreadGen: SpreadGenerator = new SpreadGenerator(defender);
    let spreads: Generator<Spread, void, void>;

    // If all attacks do damage to the same defensive side we just need to generate EVs
    // for HP and that defensive stat
    if (hasSameDefensiveCategory(requirements.survivalReqs)) {
        const stat: Stat.DEF | Stat.SDEF = getSameDefensiveStat(requirements.survivalReqs);
        spreads = spreadGen.getOneSidedSpreads(stat);
        lossFunc = new MinEVsLoss(new MaxHPLoss()); // Maximize HP for overall bulk
    } else {
        spreads = spreadGen.getAllSpreads();
        lossFunc = new MinEVsLoss(new MinHPLoss()); // Minimize HP for draining moves
    }

    // Find best EV spread
    const comparator: SpreadComparator = new SpreadComparator(lossFunc);
    let bestEVTotal = 510;

    for (const spread of spreads) {
        // We could simply check whether each spread meets the requirements then let the SpreadComparator 
        // use the MinimizeEVs loss function to find the best spread. However, calling meetsReqs on every
        // spread is expensive. Check whether the spread has fewer EVs than the best first
        const evTotal = spread[Stat.HP] + spread[Stat.DEF] + spread[Stat.SDEF];

        if (evTotal > bestEVTotal) { // This spread is not minimal
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
