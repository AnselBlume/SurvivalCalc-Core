import * as lossFuncs from 'utilities/loss-func';
import { Spread } from 'model';

describe('Loss Function Unit Tests', () => {
    const spread1 = new Spread(20, 76, 128);
    const spread2 = new Spread(52, 244, 176);
    const spread3 = new Spread(252, 4, 252);

    test('Minimize HP', () => {
        const minHP = new lossFuncs.MinimizeHP();

        expect(minHP.loss(spread1)).toBe(20);
        expect(minHP.loss(spread2)).toBe(52);
        expect(minHP.loss(spread3)).toBe(252);
    });

    test('Maximize HP', () => {
        const maxHP = new lossFuncs.MaximizeHP();

        expect(maxHP.loss(spread1)).toBe(-20);
        expect(maxHP.loss(spread2)).toBe(-52);
        expect(maxHP.loss(spread3)).toBe(-252);
    });

    test('MinimizeEVs while Minimizing HP', () => {
        const minEVs = new lossFuncs.MinimizeEVs(new lossFuncs.MinimizeHP());

        expect(minEVs.loss(spread1)).toBe(224020);
        expect(minEVs.loss(spread2)).toBe(472052);
        expect(minEVs.loss(spread3)).toBe(508252);
    });

    test('MinimizeEVs while Maximizing HP', () => {
        const minEVs = new lossFuncs.MinimizeEVs(new lossFuncs.MaximizeHP());

        expect(minEVs.loss(spread1)).toBe(223980);
        expect(minEVs.loss(spread2)).toBe(471948);
        expect(minEVs.loss(spread3)).toBe(507748);
    });
});
