import { Generations, Pokemon, Move, Field } from '@smogon/calc';
import { Requirements, HPRequirement, SurvivalRequirement } from 'model/requirements';
import { Stat, Attack } from 'model';
import { findMinEVs } from 'min-evs';

describe('minEVs Unit Tests', () => {
    test('LO Latios Draco Meteor vs. Haban Garchomp', () => {
        const latios = new Pokemon(Generations.get(8), 'Latios', {
            level: 50,
            evs: {
                [Stat.SATK]: 252
            },
            item: 'Life Orb'
        });
        const dracoMeteor = new Move(Generations.get(8), 'Draco Meteor');

        const garchomp = new Pokemon(Generations.get(8), 'Garchomp', { 
            level: 50,
            item: 'Haban Berry'
        });

        const reqs = new Requirements(new HPRequirement(), 
                                      new SurvivalRequirement(.01, 100, new Attack(latios, garchomp, dracoMeteor)));
        const spread = findMinEVs(reqs);

        expect(spread[Stat.HP]).toBe(4);
        expect(spread[Stat.DEF]).toBe(0);
        expect(spread[Stat.SDEF]).toBe(52);
    });

    test('Same defensive category', () => {
        const charizard = new Pokemon(Generations.get(8), 'Charizard-Mega-Y', {
            level: 50,
            nature: 'Modest',
            evs: {
                [Stat.SATK]: 252
            }
        });
        const heatWave = new Move(Generations.get(8), 'Heat Wave');

        const rotomW = new Pokemon(Generations.get(8), 'Rotom-Wash', {
            level: 50,
            evs: {
                [Stat.SATK]: 252
            }
        });
        const hydroPump = new Move(Generations.get(8), 'Hydro Pump');

        const salamence = new Pokemon(Generations.get(8), 'Salamence-Mega', {
            level: 50,
            evs: {
                [Stat.SATK]: 252
            }
        });
        const hyperVoice = new Move(Generations.get(8), 'Hyper Voice');

        const cresselia = new Pokemon(Generations.get(8), 'Cresselia', {
            level: 50,
            nature: 'Calm'
        });

        const attacks = [
            new Attack(charizard, cresselia, heatWave, new Field({ gameType: 'Doubles', weather: 'Sun' })),
            new Attack(rotomW, cresselia, hydroPump),
            new Attack(salamence, cresselia, hyperVoice, new Field({ gameType: 'Doubles' }))
        ];

        const reqs = new Requirements(new HPRequirement, new SurvivalRequirement(5.3, 75, ...attacks));
        const minEVs = findMinEVs(reqs);

        expect(minEVs[Stat.HP]).toBe(52); // Calculated using previous SurvivalCalc at pokeasc.appspot.com
        expect(minEVs[Stat.DEF]).toBe(0);
        expect(minEVs[Stat.SDEF]).toBe(132);
    });

    test('Different defensive category', () => {
        // Minimum EVs for Turtonator to survive Suicune's Scald followed by Kangaskhan's Return
        // These attacks/spreads are close enough to Turtonator's HP that we can search the space manually
        const suicune = new Pokemon(Generations.get(8), 'Suicune', { level: 50 });
        const scald = new Move(Generations.get(8), 'Scald');

        const kangaskhan = new Pokemon(Generations.get(8), 'Kangaskhan', {
            level: 50,
            nature: 'Adamant',
            evs: {
                [Stat.ATK]: 196
            },
            item: 'Silk Scarf'
        });
        const ret = new Move(Generations.get(8), 'Return');

        const turtonator = new Pokemon(Generations.get(8), 'Turtonator', { level: 50 });

        const attacks = [
            new Attack(suicune, turtonator, scald),
            new Attack(kangaskhan, turtonator, ret)
        ];
        const reqs = new Requirements(new HPRequirement(),
                                      new SurvivalRequirement(.01, 100, ...attacks));

        const spread = findMinEVs(reqs);

        expect(spread[Stat.HP]).toBe(28);
        expect(spread[Stat.DEF]).toBe(4);
        expect(spread[Stat.SDEF]).toBe(0);
    });

    test('With HPRequirement', () => {
        const tyranitar = new Pokemon(Generations.get(8), 'Tyranitar', {
            level: 50,
            nature: 'Adamant',
            evs: {
                [Stat.ATK]: 252
            },
            item: 'Iron Ball'
        });
        const fling = new Move(Generations.get(8), 'Fling');

        const cresselia = new Pokemon(Generations.get(8), 'Cresselia', { level: 50 });

        const reqs = new Requirements(new HPRequirement({ reduceWeather: true }),
                                      new SurvivalRequirement(.01, 100, new Attack(tyranitar, cresselia, fling)));

        const spread = findMinEVs(reqs);

        expect(spread[Stat.HP]).toBe(92);
        expect(spread[Stat.DEF]).toBe(252);
        expect(spread[Stat.SDEF]).toBe(0);
    });

    test('Multiple SurvivalRequirements', () => {
        const tyranitar = new Pokemon(Generations.get(8), 'Tyranitar', {
            level: 50,
            nature: 'Adamant',
            evs: {
                [Stat.ATK]: 252
            },
            item: 'Iron Ball'
        });
        const fling = new Move(Generations.get(8), 'Fling');

        const cresselia = new Pokemon(Generations.get(8), 'Cresselia', {
            level: 50,
            nature: 'Calm'
        });

        const hydreigon = new Pokemon(Generations.get(8), 'Hydreigon', {
            level: 50,
            nature: 'Modest',
            evs: {
                [Stat.SATK]: 180
            },
        });
        const darkPulse = new Move(Generations.get(8), 'Dark Pulse');

        const survivalReq1 = new SurvivalRequirement(.01, 100, new Attack(tyranitar, cresselia, fling));
        const survivalReq2 = new SurvivalRequirement(50.1, 100, new Attack(hydreigon, cresselia, darkPulse));

        const reqs = new Requirements(new HPRequirement(), survivalReq1, survivalReq2);
        const minEVs = findMinEVs(reqs);

        expect(minEVs[Stat.HP]).toBe(220);
        expect(minEVs[Stat.DEF]).toBe(156);
        expect(minEVs[Stat.SDEF]).toBe(108);
    });

    test('Cannot meet requirements', () => {
        const hydreigon = new Pokemon(Generations.get(8), 'Hydreigon', {
            level: 50,
            nature: 'Modest',
            evs: {
                [Stat.SATK]: 252
            },
            item: 'Choice Specs'
        });

        const darkPulse = new Move(Generations.get(8), 'Dark Pulse');

        const cresselia = new Pokemon(Generations.get(8), 'Cresselia', {
            level: 50,
            nature: 'Calm'
        });

        const reqs = new Requirements(new HPRequirement(), 
                                      new SurvivalRequirement(50.1, 100, new Attack(hydreigon, cresselia, darkPulse)));

        expect(() => findMinEVs(reqs)).toThrow(Error);

    });
});
