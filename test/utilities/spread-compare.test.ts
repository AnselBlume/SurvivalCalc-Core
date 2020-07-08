import * as lossFuncs from 'utilities/loss-func';
import { Spread, Stat, Attack } from 'model';
import { SpreadComparator } from 'utilities/spread-compare';
import { Pokemon, Generations, Move, Field } from '@smogon/calc';

/**
 * Helper function to verify the bestSpread property of the comparator.
 */
function expectBestSpreadToBe(comparator: SpreadComparator, hpEVs: number, defEVs: number, sDefEVs: number) {
    const bestSpread = comparator.bestSpread;

    expect(bestSpread[Stat.HP]).toBe(hpEVs);
    expect(bestSpread[Stat.DEF]).toBe(defEVs);
    expect(bestSpread[Stat.SDEF]).toBe(sDefEVs);
}

describe('SpreadComparator with Loss Function Unit Tests', () => {
    const spreads = [
        new Spread(20, 76, 128),
        new Spread(52, 244, 176),
        new Spread(252, 4, 252),

        // Equal EV Totals
        new Spread(12, 4, 20),
        new Spread(36, 0, 0),
        new Spread(24, 8, 4)
    ];

    test('Minimize HP', () => {
        const comparator = new SpreadComparator(new lossFuncs.MinHPLoss());
        spreads.forEach(spread => comparator.ingestSpread(spread));

        expectBestSpreadToBe(comparator, 12, 4, 20);
    });

    test('Maximize HP', () => {
        const comparator = new SpreadComparator(new lossFuncs.MaxHPLoss());
        spreads.forEach(spread => comparator.ingestSpread(spread));

        expectBestSpreadToBe(comparator, 252, 4, 252);
    });

    test('MinimizeEVs', () => {
        // While minimizing HP
        let comparator = new SpreadComparator(new lossFuncs.MinEVsLoss(new lossFuncs.MinHPLoss()));
        spreads.forEach(spread => comparator.ingestSpread(spread));

        expectBestSpreadToBe(comparator, 12, 4, 20);

        // While maximizing HP
        comparator = new SpreadComparator(new lossFuncs.MinEVsLoss(new lossFuncs.MaxHPLoss()));
        spreads.forEach(spread => comparator.ingestSpread(spread));

        expectBestSpreadToBe(comparator, 36, 0, 0);
    });

    test('ingestSpread return values', () => {
        const comparator = new SpreadComparator(new lossFuncs.MinHPLoss());

        expect(comparator.ingestSpread(new Spread(100, 0, 0))).toBe(true);
        expect(comparator.ingestSpread(new Spread(252, 0, 0))).toBe(false);
        expect(comparator.ingestSpread(new Spread(0, 0, 0))).toBe(true);
    });
});

describe('SpreadComparator with Attack Series Unit Tests', () => {
    const tyranitar = new Pokemon(Generations.get(8), 'Tyranitar', {
        level: 50,
        evs: {
            [Stat.ATK]: 252
        }
    });
    const crunch = new Move(Generations.get(8), 'Crunch');

    const cresselia = new Pokemon(Generations.get(8), 'Cresselia', { level: 50, nature: 'Bold' });

    const attacks = [new Attack(tyranitar, cresselia, crunch, new Field())];

    test('hitsToKO: lower XHKO first', () => {
        const comparator = new SpreadComparator(attacks);

        const spread2HKO = new Spread(0, 0, 0);
        const spread3HKO = new Spread(252, 252, 0);

        // Ingest first spread
        comparator.ingestSpread(spread2HKO);

        expectBestSpreadToBe(comparator, 0, 0, 0);
        expect(comparator.bestHitsToKO).toBe(2);

        // Ingest better spread
        comparator.ingestSpread(spread3HKO);

        expectBestSpreadToBe(comparator, 252, 252, 0);
        expect(comparator.bestHitsToKO).toBe(3);
    });

    test('hitsToKO: higher XHKO first', () => {
        const comparator = new SpreadComparator(attacks);

        const spread2HKO = new Spread(0, 0, 0);
        const spread3HKO = new Spread(252, 252, 0);

        // Ingest first spread
        comparator.ingestSpread(spread3HKO);
        expectBestSpreadToBe(comparator, 252, 252, 0);

        // Ingest worse spread
        comparator.ingestSpread(spread2HKO);
        expectBestSpreadToBe(comparator, 252, 252, 0);
    });

    test('xhkoChance: lower XHKO chance first', () => {
        const comparator = new SpreadComparator(attacks);

        const lowerXHKOChance = new Spread(0, 252, 0);
        const higherXHKOChance = new Spread(252, 0, 0);

        // Ingest first spread
        comparator.ingestSpread(lowerXHKOChance);

        expectBestSpreadToBe(comparator, 0, 252, 0);
        expect(comparator.bestXHKOChance).toBeCloseTo(.52);

        // Ingest worse spread
        comparator.ingestSpread(higherXHKOChance);

        expectBestSpreadToBe(comparator, 0, 252, 0);
        expect(comparator.bestXHKOChance).toBeCloseTo(.52);
    });

    test('xhkoChance: higher XHKO chance first', () => {
        const comparator = new SpreadComparator(attacks);

        const lowerXHKOChance = new Spread(0, 252, 0);
        const higherXHKOChance = new Spread(252, 0, 0);

        // Ingest first spread
        comparator.ingestSpread(higherXHKOChance);

        expectBestSpreadToBe(comparator, 252, 0, 0);
        expect(comparator.bestXHKOChance).toBeCloseTo(.92);

        // Ingest better spread
        comparator.ingestSpread(lowerXHKOChance);

        expectBestSpreadToBe(comparator, 0, 252, 0);
        expect(comparator.bestXHKOChance).toBeCloseTo(.52);
    });

    test('dmgPercent: lower damage percent first', () => {
        const comparator = new SpreadComparator(attacks);

        const lowerDmgPercent = new Spread(100, 0, 0);
        const higherDmgPercent = new Spread(0, 0, 0);

        // Ingest first spread
        comparator.ingestSpread(lowerDmgPercent);

        expectBestSpreadToBe(comparator, 100, 0, 0);
        expect(Math.floor(comparator.bestDmgPercent)).toBe(63);

        // Ingest worse spread
        comparator.ingestSpread(higherDmgPercent);

        expectBestSpreadToBe(comparator, 100, 0, 0);
        expect(Math.floor(comparator.bestDmgPercent)).toBe(63);
    });

    test('dmgPercent: higher damage percent first', () => {
        const comparator = new SpreadComparator(attacks);

        const lowerDmgPercent = new Spread(100, 0, 0);
        const higherDmgPercent = new Spread(0, 0, 0);

        // Ingest first spread
        comparator.ingestSpread(higherDmgPercent);

        expectBestSpreadToBe(comparator, 0, 0, 0);
        expect(Math.floor(comparator.bestDmgPercent)).toBe(67);

        // Ingest better spread
        comparator.ingestSpread(lowerDmgPercent);

        expectBestSpreadToBe(comparator, 100, 0, 0);
        expect(Math.floor(comparator.bestDmgPercent)).toBe(63);
    });

    test('Equivalent spreads does not change bestSpread', () => {
        const comparator = new SpreadComparator(attacks);
        const spread1 = new Spread();
        const spread2 = new Spread(); // Equivalent spread, different object

        // Ingest first spread
        comparator.ingestSpread(spread1);
        expectBestSpreadToBe(comparator, 0, 0, 0);

        // Ingest equivalent spread
        comparator.ingestSpread(spread2);
        expectBestSpreadToBe(comparator, 0, 0, 0);
    });

    test('applySpread over multiple Attacks', () => {
        const multipleAttacks = [
            new Attack(tyranitar, cresselia, crunch, new Field()),
            new Attack(tyranitar, cresselia, crunch, new Field()),
            new Attack(tyranitar, cresselia, crunch, new Field())
        ];

        const comparator = new SpreadComparator(multipleAttacks);
        comparator.ingestSpread(new Spread(1, 2, 3));

        for (const attack of multipleAttacks) {
            expect(attack.defender.evs[Stat.HP]).toBe(1);
            expect(attack.defender.evs[Stat.DEF]).toBe(2);
            expect(attack.defender.evs[Stat.SDEF]).toBe(3);
        }
    });

    test('ingestSpread return values', () => {
        const comparator = new SpreadComparator(attacks);

        expect(comparator.ingestSpread(new Spread(100, 100, 0))).toBe(true);
        expect(comparator.ingestSpread(new Spread(0, 0, 0))).toBe(false);
        expect(comparator.ingestSpread(new Spread(252, 252, 0))).toBe(true);
    });
});
