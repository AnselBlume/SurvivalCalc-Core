import { calculate, Generations, Pokemon, Move, Field } from '@smogon/calc';
import { Requirement } from 'model/requirement';
import { Attack } from 'model/attack';
import { meetsReq } from 'meets-req';
import { getKOChance } from 'ko-chance';
import { AbilityName } from '@smogon/calc/dist/data/interface';

describe('meetsReq Unit Tests', () => {
    const field: Field = new Field();

    // Test percent remaining
    test('percentRemaining: Cinderace Fire Punch vs. 252/188 Impish Ferrothorn meets (.01, 100) and fails (6, 100)', () => {
        const cinderace: Pokemon = new Pokemon(
            Generations.get(8),
            'Cinderace', {
                level: 50,
                evs: {
                    atk: 252
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
                    hp: 252,
                    def: 188
                }
            }
        );

        const attack: Attack = new Attack(cinderace, ferrothorn, firePunch, field);
        let requirement: Requirement = new Requirement(.01, 100, attack);
        let result: boolean = meetsReq(requirement);

        expect(result).toBe(true);

        requirement = new Requirement(6, 100, attack);
        result = meetsReq(requirement);

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
        let requirement: Requirement = new Requirement(50, 75, attack);
        let result: boolean = meetsReq(requirement);

        expect(result).toBe(true);

        requirement = new Requirement(50, 81.25, attack);
        result = meetsReq(requirement);

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
        const requirement = new Requirement(.01, 100, attack);
        let result: boolean = meetsReq(requirement);

        expect(result).toBe(false);

        kangaskhan.ability = 'notAnAbility' as AbilityName; // If this is falsy (e.g. '') it gets replaced by the default ability in the constructor
        result = meetsReq(requirement);

        expect(result).toBe(true);
    });

    // Test Parental Bond
    test('Parental Bond', () => {
        const kangaskhan: Pokemon = new Pokemon(
            Generations.get(8),
            'Kangaskhan-Mega', {
                level: 50,
                evs: {
                    atk: 228
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
        const requirement = new Requirement(.01, (1 - koChance) * 100, attack); //
        let result: boolean = meetsReq(requirement);

        expect(result).toBe(true);

        requirement.percentTime += .01; // Increase percentTime in order to fail the requirement
        result = meetsReq(requirement);
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
                    spa: 252
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
                    atk: 252
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
                    hp: 252,
                    def: 252
                }
            }
        );

        const attacks: Attack[] = [
            new Attack(tapuKoko, cresselia, thunderbolt, electricTerrain),
            new Attack(salamence, cresselia, doubleEdge, field),
            new Attack(ferrothorn, cresselia, ironHead, field)
        ];

        const requirement = new Requirement(.01, 52.246, ...attacks); // Max percentTime with .01% HP remaining
        let result = meetsReq(requirement);

        expect(result).toBe(true);

        requirement.percentTime += .01; // Should no longer meet requirement
        result = meetsReq(requirement);

        expect(result).toBe(false);
    });
});
