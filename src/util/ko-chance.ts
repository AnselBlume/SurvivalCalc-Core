/**
 * Computes the probability that multiple attacks represented by an array of
 * arrays of damage rolls will KO the defending Pokemon with the specified HP stat.
 * 
 * Assumes the damage rolls are in ascending order. 
 *
 * Based off of Honko's original KOChance algorithm.
 *
 * @param hpStat The defending Pokemon's HP stat
 * @param rollsArr Array of number[] where each number[] is the damage rolls of an attack
 * in ascending order.
 */
export function getKOChance(hpStat: number, ...rollsArr: number[][]): number {
  return koChanceHelper(hpStat, 0, ...rollsArr);
}

function koChanceHelper(hpStat: number, index: number, ...rollsArr: number[][]): number {
  if (index >= rollsArr.length) { // Gone through all attacks and haven't KO'd
    return 0;
  }

  const rolls: number[] = rollsArr[index];

  let probSum = 0;
  let prevRoll: number; // Variables to store the previous result so each roll is only computed once
  let prevKOChance: number;

  for (const [i, roll] of rolls.entries()) {
    if (roll >= hpStat) { // As rolls are increasing, remaining rolls also KO
      probSum += rolls.length - i;
      break;
    } else { // Roll does not KO; recurse to compute KO chance
      if (roll === prevRoll) { // Already computed this roll
        probSum += prevKOChance;
      } else {
        prevKOChance = koChanceHelper(hpStat - roll, index + 1, ...rollsArr); // Memoize result
        prevRoll = roll;
        probSum += prevKOChance;
      }
    }
  }

  return probSum / rolls.length;
}
