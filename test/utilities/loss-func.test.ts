import * as lossFuncs from 'utilities/loss-func';
import { Spread } from 'model';
import { Pokemon, Generations } from '@smogon/calc';

describe('Loss Function Unit Tests', () => {
    const spread1 = new Spread(20, 76, 128);
    const spread2 = new Spread(52, 244, 176);
    const spread3 = new Spread(252, 4, 252);

    test('Minimize HP', () => {
        const minHP = new lossFuncs.MinHPLoss();

        expect(minHP.loss(spread1)).toBe(20);
        expect(minHP.loss(spread2)).toBe(52);
        expect(minHP.loss(spread3)).toBe(252);
    });

    test('Maximize HP', () => {
        const maxHP = new lossFuncs.MaxHPLoss();

        expect(maxHP.loss(spread1)).toBe(-20);
        expect(maxHP.loss(spread2)).toBe(-52);
        expect(maxHP.loss(spread3)).toBe(-252);
    });

    test('MinimizeEVs while Minimizing HP', () => {
        const minEVs = new lossFuncs.MinEVsLoss(new lossFuncs.MinHPLoss());

        expect(minEVs.loss(spread1)).toBe(224020);
        expect(minEVs.loss(spread2)).toBe(472052);
        expect(minEVs.loss(spread3)).toBe(508252);
    });

    test('MinimizeEVs while Maximizing HP', () => {
        const minEVs = new lossFuncs.MinEVsLoss(new lossFuncs.MaxHPLoss());

        expect(minEVs.loss(spread1)).toBe(223980);
        expect(minEVs.loss(spread2)).toBe(471948);
        expect(minEVs.loss(spread3)).toBe(507748);
    });

    test('BulkLoss with weight = 0', () => {
        const kyogre = new Pokemon(Generations.get(8), 'Kyogre', { level: 50 });
        const bulkLoss = new lossFuncs.BulkLoss(kyogre, 0);

        expect(bulkLoss.loss(spread1)).toBeCloseTo(0.400562, 4);
        expect(bulkLoss.loss(spread2)).toBeCloseTo(0.335048, 4);
        expect(bulkLoss.loss(spread3)).toBeCloseTo(0.371589, 4);
    });

    test('BulkLoss with weight = 1', () => {
        const groudon = new Pokemon(Generations.get(8), 'Groudon', { level: 100 });
        const bulkLoss = new lossFuncs.BulkLoss(groudon, 1);

        expect(bulkLoss.loss(spread1)).toBeCloseTo(0.369942, 4);
        expect(bulkLoss.loss(spread2)).toBeCloseTo(0.345154, 4);
        expect(bulkLoss.loss(spread3)).toBeCloseTo(0.282178, 4);
    });

    test('BulkLoss with weight = 0.5', () => {
        const rayquaza = new Pokemon(Generations.get(8), 'Rayquaza', { level: 75 });
        const bulkLoss = new lossFuncs.BulkLoss(rayquaza, .5);

        expect(bulkLoss.loss(spread1)).toBeCloseTo(0.373739, 4);
        expect(bulkLoss.loss(spread2)).toBeCloseTo(0.329400, 4);
        expect(bulkLoss.loss(spread3)).toBeCloseTo(0.317255, 4);
    });

    test('BulkLoss invalid weight', () => {
        expect(() => new lossFuncs.BulkLoss(new Pokemon(Generations.get(8), 'Kyogre'), 1.1)).toThrow(TypeError);
        expect(() => new lossFuncs.BulkLoss(new Pokemon(Generations.get(8), 'Kyogre'), -.1)).toThrow(TypeError);
    });
});
