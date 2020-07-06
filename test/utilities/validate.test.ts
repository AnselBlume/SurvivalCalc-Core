import { validateInput } from 'utilities';
import { Generations, Pokemon, Move } from '@smogon/calc';
import { Requirements, HPRequirement, SurvivalRequirement } from 'model/requirements';
import { Attack } from 'model';

/**
 * Helper function returning a function that calls validateInput on reqs.
 * 
 * @param reqs The Requirements which the returned function will call validateInput on.
 */
function getCallValidate(reqs: Requirements) {
    return () => validateInput(reqs);
}

// Shared Pokemon and attacks
const rotomW = new Pokemon(Generations.get(8), 'Rotom-Wash');
const cresselia = new Pokemon(Generations.get(8), 'Cresselia');

const thunderbolt = new Move(Generations.get(8), 'Thunderbolt');
const willOWisp = new Move(Generations.get(8), 'Will-o-Wisp');

describe('noEmptyRequirements Unit Tests', () => {
    test('Falsy HPRequirement', () => {
        const reqs = new Requirements(undefined, new SurvivalRequirement(.01, 100));

        expect(getCallValidate(reqs)).toThrow(TypeError);
    });

    test('No SurvivalRequirement', () => {
        const reqs = new Requirements(new HPRequirement());

        expect(getCallValidate(reqs)).toThrow(TypeError);
    });

    test('Valid Inputs', () => {
        const attacks = [new Attack(rotomW, cresselia, thunderbolt)];
        const reqs = new Requirements(new HPRequirement(), new SurvivalRequirement(.01, 100, ...attacks));

        expect(getCallValidate(reqs)).not.toThrow(TypeError);
    });
});

describe('noStatusMoves Unit Tests', () => {
    test('Status move included', () => {
        const attacks = [
            new Attack(rotomW, cresselia, thunderbolt),
            new Attack(rotomW, cresselia, willOWisp)
        ];

        const reqs = new Requirements(new HPRequirement(), new SurvivalRequirement(.01, 100, ...attacks));

        expect(getCallValidate(reqs)).toThrow(TypeError);
    });

    test('No status moves', () => {
        const attacks = [
            new Attack(rotomW, cresselia, thunderbolt),
        ];

        const reqs = new Requirements(new HPRequirement(), new SurvivalRequirement(.01, 100, ...attacks));

        expect(getCallValidate(reqs)).not.toThrow(TypeError);
    });
});

describe('sameDefenderBaseSpecies Unit Tests', () => {
    const darmanitan = new Pokemon(Generations.get(8), 'Darmanitan');
    const darmanitanZen = new Pokemon(Generations.get(8), 'Darmanitan-Zen');
    const darmanitanGalar = new Pokemon(Generations.get(8), 'Darmanitan-Galar');
    const darmanitanGalarZen = new Pokemon(Generations.get(8), 'Darmanitan-Galar-Zen');

    const kangaskhan = new Pokemon(Generations.get(8), 'Kangaskhan');
    const megaKangaskhan = new Pokemon(Generations.get(8), 'Kangaskhan-Mega');

    const ret = new Move(Generations.get(8), 'Return');

    test('Same Species', () => {
        const attacks = [
            new Attack(darmanitan, kangaskhan, ret),
            new Attack(darmanitanZen, kangaskhan, ret)
        ];

        const reqs = new Requirements(new HPRequirement(), new SurvivalRequirement(.01, 100, ...attacks));

        expect(getCallValidate(reqs)).not.toThrow(TypeError);
    });

    test('Mega Evolution', () => {
        const attacks = [
            new Attack(darmanitanZen, megaKangaskhan, ret),
            new Attack(darmanitan, kangaskhan, ret)
        ];

        const reqs = new Requirements(new HPRequirement(), new SurvivalRequirement(.01, 100, ...attacks));

        expect(getCallValidate(reqs)).not.toThrow(TypeError);
    });

    test('Darmanitan Forms', () => {
        const attacks = [
            new Attack(kangaskhan, darmanitan, ret),
            new Attack(kangaskhan, darmanitanZen, ret),
            new Attack(kangaskhan, darmanitanGalar, ret),
            new Attack(kangaskhan, darmanitanGalarZen, ret)
        ];

        const reqs = new Requirements(new HPRequirement(), new SurvivalRequirement(.01, 100, ...attacks));

        expect(getCallValidate(reqs)).not.toThrow(TypeError);
    });

    test('Different Species', () => {
        const attacks = [
            new Attack(kangaskhan, kangaskhan, ret),
            new Attack(kangaskhan, darmanitan, ret)
        ];

        const reqs = new Requirements(new HPRequirement(), new SurvivalRequirement(.01, 100, ...attacks));

        expect(getCallValidate(reqs)).toThrow(TypeError);
    });
});
