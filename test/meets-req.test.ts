import { calculate, Generations, Pokemon, Move, Field } from '@smogon/calc';
import { AbilityName } from '@smogon/calc/dist/data/interface';
import { Attack, Stat } from 'model';
import { SurvivalRequirement, HPRequirement, Requirements } from 'model/requirements';
import { meetsSurvivalReq, meetsHPReq, meetsReqs } from 'meets-req';
import { getKOChance } from 'ko-chance';

describe('meetsReqs Unit Tests', () => {
    const field = new Field();

    // Consecutive attacks Conkeldurr survives
    const kangaskhan = new Pokemon(Generations.get(8), 'Kangaskhan-Mega', {
        level: 50,
        evs: {
            [Stat.ATK]: 252
        }
    });
    const ret = new Move(Generations.get(8), 'Return');

    const cresselia = new Pokemon(Generations.get(8), 'Cresselia', { level: 50 });
    const psyshock = new Move(Generations.get(8), 'Psyshock');

    // The attack Conkeldurr doesn't survive
    const latios = new Pokemon(Generations.get(8), 'Latios', {
        level: 50,
        item: 'Life Orb'
    });
    const psychic = new Move(Generations.get(8), 'Psychic');

    // HPRequirement
    const hpReq = new HPRequirement({ reduceLifeOrb: true });

    test('Lvl 50 228/68/0 Conkeldurr survives Kangaskhan Return and Cresselia Psyshock, has Life Orb Number ', () => {
        // 228 hpEVs is 209 HP, a Life Orb reduction number
        const conkeldurr = new Pokemon(Generations.get(8), 'Conkeldurr', {
            level: 50,
            evs: {
                [Stat.HP]: 228,
                [Stat.DEF]: 68
            }
        });

        const survivalReq = new SurvivalRequirement(.01, 100,
            new Attack(kangaskhan, conkeldurr, ret, field),
            new Attack(cresselia, conkeldurr, psyshock, field)
        );

        expect(meetsReqs(new Requirements(hpReq, survivalReq))).toBe(true);
    });

    test('Lvl 50 236/68/0 Conkeldurr survives Return and Psyshock but doesn\'t have a Life Orb number', () => {
        // 228 hpEVs is 209 HP, a Life Orb reduction number
        const conkeldurr = new Pokemon(Generations.get(8), 'Conkeldurr', {
            level: 50,
            evs: {
                [Stat.HP]: 236,
                [Stat.DEF]: 68
            }
        });

        const survivalReq = new SurvivalRequirement(.01, 100,
            new Attack(kangaskhan, conkeldurr, ret, field),
            new Attack(cresselia, conkeldurr, psyshock, field)
        );

        expect(meetsReqs(new Requirements(hpReq, survivalReq))).toBe(false);
    });

    test('Lvl 50 228/68/0 Conkeldurr survives Return and Psyshock, has a Life Orb Number, but doesn\'t survive Latios\' Life Orb Psyshock', () => {
        const conkeldurr = new Pokemon(Generations.get(8), 'Conkeldurr', {
            level: 50,
            evs: {
                [Stat.HP]: 228,
                [Stat.DEF]: 68
            }
        });

        const survivalReq1 = new SurvivalRequirement(.01, 100, // Meets this
            new Attack(kangaskhan, conkeldurr, ret, field),
            new Attack(cresselia, conkeldurr, psyshock, field)
        );

        const survivalReq2 = new SurvivalRequirement(.01, 100, // Doesn't meet this
            new Attack(latios, conkeldurr, psychic, field)
        );

        expect(meetsReqs(new Requirements(hpReq, survivalReq1, survivalReq2))).toBe(false);
    });

});

describe('meetsHPReq Unit Tests', () => {
    test('Reduce Weather Damage', () => {
        const cresselia = new Pokemon(Generations.get(8), 'Cresselia', { level: 50 });
        const hpReq = new HPRequirement({ reduceWeather: true });

        expect(meetsHPReq(cresselia, hpReq)).toBe(false);

        cresselia.evs.hp = 220;
        expect(meetsHPReq(cresselia.clone(), hpReq)).toBe(true); // Need to clone to recalculate stats
    });

    test('Reduce Life Orb Recoil', () => {
        const conkeldurr = new Pokemon(Generations.get(8), 'Conkeldurr', { level: 50 });
        const hpReq = new HPRequirement({ reduceLifeOrb: true });

        expect(meetsHPReq(conkeldurr, hpReq)).toBe(false);

        conkeldurr.evs.hp = 228;
        expect(meetsHPReq(conkeldurr.clone(), hpReq)).toBe(true);
    });

    test('Sitrus Berry after Super Fang', () => {
        const cresselia = new Pokemon(Generations.get(8), 'Cresselia', { level: 50 });
        const hpReq = new HPRequirement({ sitrusSuperFang: true });

        expect(meetsHPReq(cresselia, hpReq)).toBe(false);

        cresselia.evs.hp = 244;
        expect(meetsHPReq(cresselia.clone(), hpReq)).toBe(true);
    });

    test('Four Substitutes', () => {
        const suicune = new Pokemon(Generations.get(8), 'Suicune'); // Level 100
        const hpReq = new HPRequirement({ fourSubs: true });

        expect(meetsHPReq(suicune, hpReq)).toBe(true);

        suicune.evs.hp = 252;
        expect(meetsHPReq(suicune.clone(), hpReq)).toBe(false);
    });

    test('Five Substitutes with Leftovers', () => {
        let suicune = new Pokemon(Generations.get(8), 'Suicune'); // Level 100
        const hpReq = new HPRequirement({ fiveSubs: true });

        const hpRemainders = new Set([1, 2, 3, 6, 7, 11]); // Remainders mod 16 necessary for 5 subs with leftovers

        // Go through all remainders mod 16
        for (let hpEVs = 172; hpEVs < 236; hpEVs += 4) { // HP stat with 172 hpEVs at level 100 is divisible by 16
            suicune.evs.hp = hpEVs;
            suicune = suicune.clone();
            expect(meetsHPReq(suicune, hpReq)).toBe(hpRemainders.has(suicune.maxHP() % 16));
        }
    });

        test('Empty HPReq', () => {
        const suicune = new Pokemon(Generations.get(8), 'Suicune'); // Level 100
        const hpReq = new HPRequirement();

        // Go through all remainders mod 16
        for (let hpEVs = 172; hpEVs < 236; hpEVs += 4) { // HP stat with 172 hpEVs at level 100 is divisible by 16
            suicune.evs.hp = hpEVs;
            expect(meetsHPReq(suicune.clone(), hpReq)).toBe(true);
        }
    });
});

describe('meetsSurvivalReq Unit Tests', () => {
    const field: Field = new Field();

    // Test percent remaining
    test('percentRemaining: Cinderace Fire Punch vs. 252/188 Impish Ferrothorn meets (.01, 100) and fails (6, 100)', () => {
        const cinderace: Pokemon = new Pokemon(
            Generations.get(8),
            'Cinderace', {
                level: 50,
                evs: {
                    [Stat.ATK]: 252
                }
            }
        );

        const firePunch: Move = new Move(Generations.get(8), 'Fire Punch');

        const ferrothorn: Pokemon = new Pokemon(
            Generations.get(8),
            'Ferrothorn', {
                level: 50,
                nature: 'Impish',
                evs: {
                    [Stat.HP]: 252,
                    [Stat.DEF]: 188
                }
            }
        );

        const attack: Attack = new Attack(cinderace, ferrothorn, firePunch, field);
        let requirement = new SurvivalRequirement(.01, 100, attack);
        let result: boolean = meetsSurvivalReq(requirement);

        expect(result).toBe(true);

        requirement = new SurvivalRequirement(6, 100, attack);
        result = meetsSurvivalReq(requirement);

        expect(result).toBe(false);
    });

    // Test percent of the time
    test('percentTime: Cresselia Psyshock vs. Conkeldurr meets (50, 75) and fails (50, 81.25)', () => {
        const cresselia: Pokemon = new Pokemon(
            Generations.get(8),
            'Cresselia', {
                level: 50,
            }
        );

        const psyshock: Move = new Move(Generations.get(8), 'Psyshock');

        const conkeldurr: Pokemon = new Pokemon(
            Generations.get(8),
            'Conkeldurr', {
                level: 50,
            }
        );

        const attack: Attack = new Attack(cresselia, conkeldurr, psyshock, field);
        let requirement = new SurvivalRequirement(50, 75, attack);
        let result: boolean = meetsSurvivalReq(requirement);

        expect(result).toBe(true);

        requirement = new SurvivalRequirement(50, 81.25, attack);
        result = meetsSurvivalReq(requirement);

        expect(result).toBe(false);
    });

    // Test fixed-damage
    test('Fixed Damage: Mega Kangaskhan Seismic Toss vs. 0 HP EV Shuckle fails (.01, 100) with PB and meets without PB', () => {
        const kangaskhan: Pokemon = new Pokemon(
            Generations.get(8),
            'Kangaskhan-Mega', {
                level: 100
            }
        );

        const seismicToss: Move = new Move(Generations.get(8), 'Seismic Toss');

        const shuckle: Pokemon = new Pokemon(
            Generations.get(8),
            'Shuckle', {
                level: 100,
            }
        );

        const attack: Attack = new Attack(kangaskhan, shuckle, seismicToss, field);
        const requirement = new SurvivalRequirement(.01, 100, attack);
        let result: boolean = meetsSurvivalReq(requirement);

        expect(result).toBe(false);

        kangaskhan.ability = 'notAnAbility' as AbilityName; // If this is falsy (e.g. '') it gets replaced by the default ability in the constructor
        result = meetsSurvivalReq(requirement);

        expect(result).toBe(true);
    });

    // Test Parental Bond
    test('Parental Bond', () => {
        const kangaskhan: Pokemon = new Pokemon(
            Generations.get(8),
            'Kangaskhan-Mega', {
                level: 50,
                evs: {
                    [Stat.ATK]: 228
                }
            }
        );

        const doubleEdge: Move = new Move(Generations.get(8), 'Double-Edge');

        const gastrodon: Pokemon = new Pokemon(
            Generations.get(8),
            'Gastrodon', {
                level: 50,
            }
        );

        // Compute KO chance dynamically in case Parental Bond computation changes in the calculator
        const damageRolls: [number[], number[]] =
            calculate(Generations.get(8), kangaskhan, gastrodon, doubleEdge, field).damage as [number[], number[]];
        const koChance: number = getKOChance(186, ...damageRolls);

        // Set pctTime to the maximum possible
        const attack: Attack = new Attack(kangaskhan, gastrodon, doubleEdge, field);
        const requirement = new SurvivalRequirement(.01, (1 - koChance) * 100, attack); //
        let result: boolean = meetsSurvivalReq(requirement);

        expect(result).toBe(true);

        requirement.percentTime += .01; // Increase percentTime in order to fail the requirement
        result = meetsSurvivalReq(requirement);
        expect(result).toBe(false);
    });

    // Test three different attacks in sequence
    test('Three sequential attacks', () => {
        // Life Orb Timid Tapu Koko Thunderbolt in Electric Terrain
        const tapuKoko: Pokemon = new Pokemon(
            Generations.get(8),
            'Tapu Koko', {
                level: 100,
                evs: {
                    [Stat.SATK]: 252
                },
                item: 'Life Orb'
            }
        );
        const thunderbolt: Move = new Move(Generations.get(8), 'Thunderbolt');
        const electricTerrain: Field = new Field({
            terrain: 'Electric'
        });

        // Jolly Mega Salamence Double-Edge
        const salamence: Pokemon = new Pokemon(
            Generations.get(8),
            'Salamence Mega', {
                level: 100,
                evs: {
                    [Stat.ATK]: 252
                }
            }
        );
        const doubleEdge: Move = new Move(Generations.get(8), 'Double-Edge');

        // Impish Dynamaxed Ferrothorn Iron Head
        const ferrothorn: Pokemon = new Pokemon(
            Generations.get(8),
            'Ferrothorn', {
                level: 100
            }
        );
        const ironHead: Move = new Move(Generations.get(8), 'Iron Head', { useMax: true });

        // Bold 252/252/0 Cresselia
        const cresselia: Pokemon = new Pokemon(
            Generations.get(8),
            'Cresselia', {
                level: 100,
                nature: 'Bold',
                evs: {
                    [Stat.HP]: 252,
                    [Stat.DEF]: 252
                }
            }
        );

        const attacks: Attack[] = [
            new Attack(tapuKoko, cresselia, thunderbolt, electricTerrain),
            new Attack(salamence, cresselia, doubleEdge, field),
            new Attack(ferrothorn, cresselia, ironHead, field)
        ];

        const requirement = new SurvivalRequirement(.01, 52.246, ...attacks); // Max percentTime with .01% HP remaining
        let result = meetsSurvivalReq(requirement);

        expect(result).toBe(true);

        requirement.percentTime += .01; // Should no longer meet requirement
        result = meetsSurvivalReq(requirement);

        expect(result).toBe(false);
    });
});
