import { getKOChance } from 'ko-chance'; // Needs modulePaths: ['src'] to compile without explicit file path

describe('getKOChance Unit Tests', () => {
    const precision = 10;

    test('KO chance of 0', () => {
        const rollsArr = [[143, 146, 147, 150, 150, 151, 153, 155, 157, 158, 161, 162, 165, 166, 168, 170]];
        const hpStat = 171;
        const expectedResult = 0;
        const result = getKOChance(hpStat, ...rollsArr);

        expect(result).toBe(expectedResult);
    });

    test('KO chance of 1', () => {
        const rollsArr = [[143, 146, 147, 150, 150, 151, 153, 155, 157, 158, 161, 162, 165, 166, 168, 170]];
        const hpStat = 143;
        const expectedResult = 1;
        const result = getKOChance(hpStat, ...rollsArr);

        expect(result).toBe(expectedResult);
    });

    test('Fractional KO chance for one array', () => {
        const rollsArr = [[143, 146, 147, 150, 150, 151, 153, 155, 157, 158, 161, 162, 165, 166, 168, 170]];
        const hpStat = 160;
        const expectedResult = 0.375;
        const result = getKOChance(hpStat, ...rollsArr);

        expect(result).toBeCloseTo(expectedResult, precision);
    });

    test('KO chance for two of the same arrays', () => {
        const rollsArr = [[93, 93, 95, 95, 97, 98, 98, 101, 101, 102, 105, 105, 106, 106, 108, 110],
                          [93, 93, 95, 95, 97, 98, 98, 101, 101, 102, 105, 105, 106, 106, 108, 110]];
        const hpStat = 195;
        const expectedResult = 0.80859375;
        const result = getKOChance(hpStat, ...rollsArr);

        expect(result).toBeCloseTo(expectedResult, precision);
    });

    test('KO chance for three different arrays', () => {
        const rollsArr = [[83, 86, 86, 87, 90, 90, 91, 91, 93, 93, 95, 95, 97, 97, 98, 101],
                          [66, 66, 66, 66, 68, 68, 68, 68, 72, 72, 72, 72, 74, 74, 74, 78],
                          [58, 60, 60, 61, 61, 63, 63, 64, 64, 66, 66, 67, 67, 69, 69, 70],
                          [110, 110, 114, 114, 116, 116, 120, 120, 120, 122, 122, 126, 126, 128, 128, 132]];
        const hpStat = 363;
        const expectedResult = 0.0489654541015625;
        const result = getKOChance(hpStat, ...rollsArr);

        expect(result).toBeCloseTo(expectedResult, precision);
    });

    test('KO chance for two different length arrays', () => {
        const rollsArr = [[1, 3, 7, 13],
                          [1, 2]];
        const hpStat = 9;
        const expectedResult = 0.375;
        const result = getKOChance(hpStat, ...rollsArr);

        expect(result).toBeCloseTo(expectedResult, precision);
        
    });
});
