import { Generations, Pokemon, Move } from '@smogon/calc';
import { Stat, Attack } from 'model';
import { HPRequirement, SurvivalRequirement, Requirements } from 'model/requirements';
import { findBestEVs } from 'best-evs';
import { BulkLoss } from 'utilities';

describe('getBestEVs Unit Tests', () => {
        const hydreigon = new Pokemon(Generations.get(8), 'Hydreigon', {
            level: 50,
            nature: 'Modest',
            evs: {
                [Stat.SATK]: 252
            }
        });
        const darkPulse = new Move(Generations.get(8), 'Dark Pulse');

        const tyranitar = new Pokemon(Generations.get(8), 'Tyranitar', {
            level: 50,
            evs: {
                [Stat.ATK]: 252
            }
        });
        const crunch = new Move(Generations.get(8), 'Crunch');

    test('Minimize attack damage on opposite defensive side', () => {
        const cresselia = new Pokemon(Generations.get(8), 'Cresselia', { level: 50 });

        const reqs = new Requirements(new HPRequirement(),
                                      new SurvivalRequirement(37.51, 100, new Attack(tyranitar, cresselia, crunch)));
        const spread = findBestEVs(reqs, [new Attack(hydreigon, cresselia, darkPulse)], 292);

        expect(spread[Stat.HP]).toBe(204); // Computed with previous calc version
        expect(spread[Stat.DEF]).toBe(44);
        expect(spread[Stat.SDEF]).toBe(44);
    });

    test('Minimize attack damage on same defensive side', () => {
        const gengar = new Pokemon(Generations.get(8), 'Gengar', {
            level: 50,
            evs: {
                [Stat.SATK]: 252
            }
        });
        const shadowBall = new Move(Generations.get(8), 'Shadow Ball');

        const cresselia = new Pokemon(Generations.get(8), 'Cresselia', {
            level: 50,
            nature: 'Calm'
        });

        const reqs = new Requirements(new HPRequirement(),
                                      new SurvivalRequirement(50.01, 100, new Attack(gengar, cresselia, shadowBall)));
        const spread = findBestEVs(reqs, [new Attack(hydreigon, cresselia, darkPulse)], 364);

        expect(spread[Stat.HP]).toBe(180);
        expect(spread[Stat.DEF]).toBe(4);
        expect(spread[Stat.SDEF]).toBe(180);
    });

    test('Minimize BulkLoss with Always Survivable Attack', () => {
        const waterGun = new Move(Generations.get(8), 'Water Gun');

        const cresselia = new Pokemon(Generations.get(8), 'Cresselia', {
            level: 50,
            nature: 'Bold'
        });

        const reqs = new Requirements(new HPRequirement(),
                                      new SurvivalRequirement(.01, 100, new Attack(hydreigon, cresselia, waterGun)));
        const bulkLoss = new BulkLoss(cresselia, .5);

        const spread = findBestEVs(reqs, bulkLoss, 413);

        expect(spread[Stat.HP]).toBe(252); // Should be the argmin of BulkLoss
        expect(spread[Stat.DEF]).toBe(76);
        expect(spread[Stat.SDEF]).toBe(84);
    });

    test('Minimize BulkLoss on Opposite Defensive Side', () => {
        const cresselia = new Pokemon(Generations.get(8), 'Cresselia', { level: 50 });

        const reqs = new Requirements(new HPRequirement(),
                                      new SurvivalRequirement(37.51, 100, new Attack(hydreigon, cresselia, darkPulse)));
        const bulkLoss = new BulkLoss(cresselia, 0); // Maximize defense

        const spread = findBestEVs(reqs, bulkLoss, 300);

        expect(spread[Stat.HP]).toBe(204); // Compared with previous calculator's bestEVs
        expect(spread[Stat.DEF]).toBe(84);
        expect(spread[Stat.SDEF]).toBe(12);
    });

    test('With HPRequirement', () => {
        const cresselia = new Pokemon(Generations.get(8), 'Cresselia', { level: 50 });

        const reqs = new Requirements(new HPRequirement( { reduceWeather: true }),
                                      new SurvivalRequirement(37.51, 100, new Attack(hydreigon, cresselia, darkPulse)));
        const spread = findBestEVs(reqs, [new Attack(tyranitar, cresselia, crunch)], 407);

        expect(spread[Stat.HP]).toBe(220); // Calculated with previous calculator's bestEVs
        expect(spread[Stat.DEF]).toBe(172);
        expect(spread[Stat.SDEF]).toBe(12);
    });

    test('Cannot meet requirements', () => {
        const cresselia = new Pokemon(Generations.get(8), 'Cresselia', { level: 50 });

        const reqs = new Requirements(new HPRequirement(),
                                      new SurvivalRequirement(50, 100, new Attack(hydreigon, cresselia, darkPulse)));

        expect(() => findBestEVs(reqs, new BulkLoss(cresselia, .5), 700)).toThrow(Error);
    });
});
