import { Requirements, Spread, Attack } from 'model';
import { BulkLoss, SpreadComparator, validateInput, SpreadGenerator, meetsReqs, applySpread } from 'utilities';
import { Pokemon } from '@smogon/calc';

/**
 * Finds the best EV spread which meets the specified Requirements and uses up to maxEVs EVs, while
 * minimizing the damage from the Attack[] or minimizing the BulkLoss.
 *
 * @param reqs The Requirements to be met.
 * @param toMinimize An array of Attacks or a BulkLoss to minimize.
 * @param maxEVs The total number of usable EVs.
 */
export function findBestEVs(reqs: Requirements, toMinimize: Attack[] | BulkLoss, maxEVs: number): Spread {
    validateInput(reqs);

    const defender: Pokemon = reqs.survivalReqs[0].attacks[0].defender;
    const comparator: SpreadComparator = new SpreadComparator(toMinimize);
    const spreadGen: SpreadGenerator = new SpreadGenerator(defender);

    for (const spread of spreadGen.getMaximalSpreads(maxEVs)) {
        // If a spread which meets the requirements exists with evTotal T, for any spread s
        // which meets the requirements there exists a spread s' which is at least as good as
        // s which has >= T total EVs. However, getMaximalSpreads already generates spreads with
        // evTotal == maxEVs for valid maxEVs, so we don't need to keep track of the evTotal here

        // Apply spread to each defender
        reqs.survivalReqs.forEach(survivalReq => applySpread(spread, survivalReq.attacks));

        if (meetsReqs(reqs)) {
            comparator.ingestSpread(spread);
        }
    }

    if (!comparator.bestSpread) {
        throw new Error('The defending Pokemon cannot meet the specified requirements');
    }

    spreadGen.removeExtraEVs(comparator.bestSpread);

    return comparator.bestSpread;
}
