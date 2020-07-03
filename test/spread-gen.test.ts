import { Spread } from 'model/spread';
import { Stat } from 'model/stat';
import { SpreadGenerator } from 'spread-gen';
import { Pokemon, Generations } from '@smogon/calc';

// Reduces the iterable with the && operation
// Used to verify all expected EVs are generated
function reduceAnd(iterable: Iterable<boolean>): boolean {
    return Array.from(iterable).reduce((x, y) => x && y);
}

describe('getAllSpreads Unit Tests', () => {
    test('Lvl 100 Lugia', () => {
        const lugia = new Pokemon(Generations.get(8), 'Lugia', { level: 100 });
        const spreadGen = new SpreadGenerator(lugia);
        const spreads = spreadGen.getAllSpreads();

        // Count the number of times it generates a spread
        let count = 0;

        // Keep track of the EVs encountered
        const hpVals = new Map();
        const defVals = new Map();
        const sDefVals = new Map();

        for (let i = 0; i <= 252; i += 4) { // Mark all EVs as unseen
            hpVals.set(i, false);
            defVals.set(i, false);
            sDefVals.set(i, false);
        }

        for (const spread of spreads) {
            hpVals.set(spread[Stat.HP], true);
            defVals.set(spread[Stat.DEF], true);
            sDefVals.set(spread[Stat.SDEF], true);

            count++;
        }

        expect(count).toBe(220480); // Verify number of spreads generated

        // Verify all values in {0, 4, ... , 252} were generated for hp, def, sDef
        expect(reduceAnd(hpVals.values())).toBe(true);
        expect(reduceAnd(defVals.values())).toBe(true);
        expect(reduceAnd(sDefVals.values())).toBe(true);
    });

    test('Lvl 100 Lugia with 212 maxEVs', () => {
        const lugia = new Pokemon(Generations.get(8), 'Lugia', { level: 100 });
        const spreadGen = new SpreadGenerator(lugia);
        const spreads = spreadGen.getAllSpreads(212);

        // Count the number of times it generates a spread
        let count = 0;

        // Keep track of the EVs encountered
        const hpVals = new Map();
        const defVals = new Map();
        const sDefVals = new Map();

        for (let i = 0; i <= 212; i += 4) { // Mark all EVs as unseen
            hpVals.set(i, false);
            defVals.set(i, false);
            sDefVals.set(i, false);
        }

        for (const spread of spreads) {
            hpVals.set(spread[Stat.HP], true);
            defVals.set(spread[Stat.DEF], true);
            sDefVals.set(spread[Stat.SDEF], true);

            count++;
        }

        expect(count).toBe(27720); // Verify number of spreads generated

        // Verify all values in {0, 4, ... , 212} were generated for hp, def, sDef
        expect(reduceAnd(hpVals.values())).toBe(true);
        expect(reduceAnd(defVals.values())).toBe(true);
        expect(reduceAnd(sDefVals.values())).toBe(true);
    });

    test('Lvl 50 Raikou', () => {
        const raikou = new Pokemon(Generations.get(8), 'Raikou', { level: 50 });
        const spreadGen = new SpreadGenerator(raikou);
        const spreads = spreadGen.getAllSpreads();

        // Count the number of times it generates a spread
        let count = 0;

        // Keep track of the EVs encountered
        const hpVals = new Map([[0, false]]);
        const defVals = new Map([[0, false]]);
        const sDefVals = new Map([[0, false]]);

        for (let i = 4; i <= 252; i += 8) { // Mark all EVs as unseen
            hpVals.set(i, false);
            defVals.set(i, false);
            sDefVals.set(i, false);
        }

        for (const spread of spreads) {
            hpVals.set(spread[Stat.HP], true);
            defVals.set(spread[Stat.DEF], true);
            sDefVals.set(spread[Stat.SDEF], true);

            count++;
        }

        expect(count).toBe(30481); // Verify number of spreads generated

        // Verify all values in {0, 4, 12, 20, ... , 252} were generated for hp, def, sDef
        expect(reduceAnd(hpVals.values())).toBe(true);
        expect(reduceAnd(defVals.values())).toBe(true);
        expect(reduceAnd(sDefVals.values())).toBe(true);
    });

        test('Lvl 50 Raikou with Even IVs', () => {
        const raikou = new Pokemon(Generations.get(8), 'Raikou', {
            level: 50,
            ivs: {
                [Stat.HP]: 2,
                [Stat.DEF]: 30,
                [Stat.SDEF]: 16
            }
        });
        const spreadGen = new SpreadGenerator(raikou);
        const spreads = spreadGen.getAllSpreads();

        // Count the number of times it generates a spread
        let count = 0;

        // Keep track of the EVs encountered
        const hpVals = new Map();
        const defVals = new Map();
        const sDefVals = new Map();

        for (let i = 0; i <= 248; i += 8) { // Mark all EVs as unseen
            hpVals.set(i, false);
            defVals.set(i, false);
            sDefVals.set(i, false);
        }

        for (const spread of spreads) {
            hpVals.set(spread[Stat.HP], true);
            defVals.set(spread[Stat.DEF], true);
            sDefVals.set(spread[Stat.SDEF], true);

            count++;
        }

        expect(count).toBe(27808); // Verify number of spreads generated

        // Verify all values in {0, 8, 16, 24, ... , 248} were generated for hp, def, sDef
        expect(reduceAnd(hpVals.values())).toBe(true);
        expect(reduceAnd(defVals.values())).toBe(true);
        expect(reduceAnd(sDefVals.values())).toBe(true);
    });

    test('Lvl 9 Piplup', () => {
        const piplup = new Pokemon(Generations.get(8), 'Piplup', { level: 9 });
        const spreadGen = new SpreadGenerator(piplup);
        const spreads = spreadGen.getAllSpreads();

        // Count the number of times it generates a spread
        let count = 0;

        // Keep track of the EVs encountered, marking them as unseen
        const hpVals = new Map([[0, false], [32, false], [76, false], [120, false],
                                [164, false], [208, false], [252, false]]);
        const defVals = new Map([[0, false], [32, false], [76, false], [120, false],
                                 [164, false], [208, false], [252, false]]);
        const sDefVals = new Map([[0, false], [8, false], [52, false], [96, false],
                                  [140, false], [184, false], [228, false]]);

        for (const spread of spreads) {
            hpVals.set(spread[Stat.HP], true);
            defVals.set(spread[Stat.DEF], true);
            sDefVals.set(spread[Stat.SDEF], true);

            count++;
        }

        expect(count).toBe(287); // Verify number of spreads generated

        // Verify all values listed in the maps were generated for hp, def, sDef
        expect(reduceAnd(hpVals.values())).toBe(true);
        expect(reduceAnd(defVals.values())).toBe(true);
        expect(reduceAnd(sDefVals.values())).toBe(true);
    });
});

describe('getOneSidedSpreads Unit Tests', () => {
    test('Lvl 50 Raikou with def', () => {
        const raikou = new Pokemon(Generations.get(8), 'Raikou', { level: 50 });
        const spreadGen = new SpreadGenerator(raikou);
        const spreads = spreadGen.getOneSidedSpreads(Stat.DEF);

        // Count the number of times it generates a spread
        let count = 0;

        // Keep track of the EVs encountered
        const hpVals = new Map([[0, false]]);
        const defVals = new Map([[0, false]]);

        for (let i = 4; i <= 252; i += 8) { // Mark all EVs as unseen
            hpVals.set(i, false);
            defVals.set(i, false);
        }

        for (const spread of spreads) {
            hpVals.set(spread[Stat.HP], true);
            defVals.set(spread[Stat.DEF], true);

            count++;
        }

        expect(count).toBe(1089); // Verify number of spreads generated

        // Verify all values in {0, 4, 12, 20, ... , 252} were generated for hp, def
        expect(reduceAnd(hpVals.values())).toBe(true);
        expect(reduceAnd(defVals.values())).toBe(true);
    });

    test('Lvl 9 Piplup with def', () => {
        const piplup = new Pokemon(Generations.get(8), 'Piplup', { level: 9 });
        const spreadGen = new SpreadGenerator(piplup);
        const spreads = spreadGen.getOneSidedSpreads(Stat.DEF);

        // Count the number of times it generates a spread
        let count = 0;

        // Keep track of the EVs encountered, marking them as unseen
        const hpVals = new Map([[0, false], [32, false], [76, false], [120, false],
                                [164, false], [208, false], [252, false]]);
        const defVals = new Map([[0, false], [32, false], [76, false], [120, false],
                                 [164, false], [208, false], [252, false]]);

        for (const spread of spreads) {
            hpVals.set(spread[Stat.HP], true);
            defVals.set(spread[Stat.DEF], true);

            count++;
        }

        expect(count).toBe(49); // Verify number of spreads generated

        // Verify all values listed in the maps were generated for hp, def
        expect(reduceAnd(hpVals.values())).toBe(true);
        expect(reduceAnd(defVals.values())).toBe(true);
    });

    test('Lvl 9 Piplup with sDef', () => {
        const piplup = new Pokemon(Generations.get(8), 'Piplup', { level: 9 });
        const spreadGen = new SpreadGenerator(piplup);
        const spreads = spreadGen.getOneSidedSpreads(Stat.SDEF);

        // Count the number of times it generates a spread
        let count = 0;

        // Keep track of the EVs encountered, marking them as unseen
        const hpVals = new Map([[0, false], [32, false], [76, false], [120, false],
                                [164, false], [208, false], [252, false]]);
        const sDefVals = new Map([[0, false], [8, false], [52, false], [96, false],
                                  [140, false], [184, false], [228, false]]);

        for (const spread of spreads) {
            hpVals.set(spread[Stat.HP], true);
            sDefVals.set(spread[Stat.SDEF], true);

            count++;
        }

        expect(count).toBe(49); // Verify number of spreads generated

        // Verify all values listed in the maps were generated for hp, sDef
        expect(reduceAnd(hpVals.values())).toBe(true);
        expect(reduceAnd(sDefVals.values())).toBe(true);
    });
});

describe('getMaximalSpreads Unit Tests', () => {
    test('Lvl 100 Ho-Oh with 555 totalEVs', () => {
        const hoOh = new Pokemon(Generations.get(8), 'Ho-Oh', { level: 100 });
        const spreadGen = new SpreadGenerator(hoOh);
        const spreads = spreadGen.getMaximalSpreads(555);

        let count = 0;
        const hpVals = new Map([[0, false]]);
        const defVals = new Map([[0, false]]);
        const sDefVals = new Map(); // Will never generate 252/252/0, but will generate 252/252/4

        for (let i = 4; i <= 252; i += 4) {
            hpVals.set(i, false);
            defVals.set(i, false);
            sDefVals.set(i, false);
        }

        for (const spread of spreads) {
            hpVals.set(spread[Stat.HP], true);
            defVals.set(spread[Stat.DEF], true);
            sDefVals.set(spread[Stat.SDEF], true);
            count++;
        }

        expect(count).toBe(4096);

        expect(reduceAnd(hpVals.values())).toBe(true);
        expect(reduceAnd(defVals.values())).toBe(true);
        expect(reduceAnd(sDefVals.values())).toBe(true);
    });

    test('Lvl 100 Ho-Oh with -7 totalEVs', () => {
        const hoOh = new Pokemon(Generations.get(8), 'Ho-Oh', { level: 100 });
        const spreadGen = new SpreadGenerator(hoOh);
        const spreads = spreadGen.getMaximalSpreads(-7);

        let count = 0;

        for (const spread of spreads) {
            expect(spread[Stat.HP]).toBe(0);
            expect(spread[Stat.DEF]).toBe(0);
            expect(spread[Stat.SDEF]).toBe(0);
            count++;
        }

        expect(count).toBe(1); // 0, 0, 0
    });

    test('Lvl 50 Regirock with 27 totalEVs', () => {
        const regirock = new Pokemon(Generations.get(8), 'Regirock', { level: 50 });
        const spreadGen = new SpreadGenerator(regirock);
        const spreads = spreadGen.getMaximalSpreads(27);

        let count = 0;
        const hpVals = new Map([[0, false]]);
        const defVals = new Map([[0, false]]);
        const sDefVals = new Map([[3, false], [7, false], [11, false],
                                  [15, false], [19, false], [23, false], [27, false]]);

        for (let i = 4; i <= 20; i += 8) {
            hpVals.set(i, false);
            defVals.set(i, false);
        }

        for (const spread of spreads) {
            hpVals.set(spread[Stat.HP], true);
            defVals.set(spread[Stat.DEF], true);
            sDefVals.set(spread[Stat.SDEF], true);
            count += 1;
        }

        expect(count).toBe(13);

        expect(reduceAnd(hpVals.values())).toBe(true);
        expect(reduceAnd(defVals.values())).toBe(true);
        expect(reduceAnd(sDefVals.values())).toBe(true);
    });

    test('Lvl 50 Regice with 264 totalEVs', () => {
        const regice = new Pokemon(Generations.get(8), 'Regice', { level: 50 });
        const spreadGen = new SpreadGenerator(regice);
        const spreads = spreadGen.getMaximalSpreads(264);

        let count = 0;
        const hpVals = new Map([[0, false]]);
        const defVals = new Map([[0, false]]);
        const sDefVals = new Map([[0, false]]);

        for (let i = 4; i <= 255; i += 8) {
            hpVals.set(i, false);
            defVals.set(i, false);
            sDefVals.set(i, false);
        }

        sDefVals.delete(4); // 4 sDef will not be reached

        for (const spread of spreads) {
            hpVals.set(spread[Stat.HP], true);
            defVals.set(spread[Stat.DEF], true);
            sDefVals.set(spread[Stat.SDEF], true);
            count += 1;
        }

        expect(count).toBe(624);

        expect(reduceAnd(hpVals.values())).toBe(true);
        expect(reduceAnd(defVals.values())).toBe(true);
        expect(reduceAnd(sDefVals.values())).toBe(true);
    });
});

describe('removeExtraEVs Unit Tests', () => {
    test('217/162/111 Lvl 19 Snorunt', () => {
        const snorunt = new Pokemon(Generations.get(8), 'Snorunt', { level: 19});
        const spread = new Spread(217, 162, 111);
        const spreadGen = new SpreadGenerator(snorunt);
        spreadGen.removeExtraEVs(spread);

        expect(spread[Stat.HP]).toBe(216);
        expect(spread[Stat.DEF]).toBe(152);
        expect(spread[Stat.SDEF]).toBe(108);
    });

    test('0/0/0 Lvl 19 Snorunt', () => {
        const snorunt = new Pokemon(Generations.get(8), 'Snorunt', { level: 19});
        const spread = new Spread();
        const spreadGen = new SpreadGenerator(snorunt);
        spreadGen.removeExtraEVs(spread);

        expect(spread[Stat.HP]).toBe(0);
        expect(spread[Stat.DEF]).toBe(0);
        expect(spread[Stat.SDEF]).toBe(0);
    });

    test('126/164/71 Lvl 28 Zeraora', () => {
        const zeraora = new Pokemon(Generations.get(8), 'Zeraora', { level: 28 });
        const spread = new Spread(126, 164, 71);
        const spreadGen = new SpreadGenerator(zeraora);
        spreadGen.removeExtraEVs(spread);

        expect(spread[Stat.HP]).toBe(116);
        expect(spread[Stat.DEF]).toBe(164);
        expect(spread[Stat.SDEF]).toBe(68);
    });

    test('252/252/4 Lvl 72 Hydreigon', () => {
        const hydreigon = new Pokemon(Generations.get(8), 'Hydreigon', { level: 72 });
        const spread = new Spread(252, 252, 4);
        const spreadGen = new SpreadGenerator(hydreigon);
        spreadGen.removeExtraEVs(spread);

        expect(spread[Stat.HP]).toBe(252);
        expect(spread[Stat.DEF]).toBe(252);
        expect(spread[Stat.SDEF]).toBe(4);
    });
});