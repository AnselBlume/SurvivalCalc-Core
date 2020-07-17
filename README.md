# SurvivalCalc-Core
[This is the repository](https://github.com/AnselBlume/SurvivalCalc-Core)  for the SurvivalCalc's computation engine. 

The **Pokemon Attack Survival Calculator (SurvivalCalc)** is a tool created for the competitive Pokémon community. It is designed to compute the optimal distribution of defensive [EVs](https://bulbapedia.bulbagarden.net/wiki/Effort_values) while surviving specific attacks. Refer [here](https://www.smogon.com/forums/threads/attack-survival-calculator.3498650/) for an introduction to the original SurvivalCalc, and see below for links to the current SurvivalCalc implementations on the web:

- [SurvivalCalc v2.0](https://survivalcalc.trainertower.com/) (Hosted by TrainerTower)
- [SurvivalCalc v2.0](pokeasc.appspot.com) (With Pokemon and move data; identical in functionality to the TT variant)
- [SurvivalCalc v1.0](survivalcalc.appspot.com) (The original, abstracted version)

For information on how to use these calculators, see the notes below the calculators on their respective webpages.

## Usage
The SurvivalCalc-Core exposes two primary functions: **findMinEVs** and **findBestEVs**. Both rely on the following APIs:

- **SurvivalCalc-Core**
  - Requirements: specifies SurvivalRequirements and an HPRequirement the EV spread should meet
    - SurvivalRequirement: specifies what Attacks a defending Pokemon is to survive with a percentage of HP remaining a percentage of the time
    - HPRequirement: specifies passive damage reducing HP numbers the defending Pokemon should have (e.g. reduce weather damage, burn damage)
  - Attack: specifies an attacking Pokémon, defending Pokémon, the Move used, and any Field conditions
- **[@smogon/calc](https://github.com/smogon/damage-calc): Smogon's Damage Calculator API**
  - Pokemon: representation of a Pokémon
  - Move: representation of a Pokémon's move
  - Field: representation of the field on which an attack occurs

The @smogon/calc components listed above are re-exported in [src/index.ts](https://github.com/AnselBlume/SurvivalCalc-Core/blob/master/src/index.ts) for the user's convenience.

A sample webpack.config.js is also included. Simply change the _entry_ attribute to the desired entrypoint.

### Requirements
The Requirements object specifies what requirements should be met by the EV spread. There are two kinds of requirements that can be met: **SurvivalRequirements** and **HPRequirements**.

#### SurvivalRequirement
This object specifies what the defending Pokémon should survive, the percentage of HP remaining the defending Pokémon should have, and the percentage of the time it should have the specified percentage of HP remaining.

Suppose we wish our Assault Vest Conkeldurr to survive Togekiss' Air Slash followed by Dragapult's Dragon Darts at level 50. We wish for our Conkeldurr to survive the series of attacks with .01% of its HP remaining, 100% of the time. We would use
``` typescript
// Construct attackers, defenders, and moves
const togekiss = new Pokemon(8, 'Togekiss', {
    level: 50,
    evs: {
        [Stat.SATK]: 252
    }
});
const airSlash = new Move(8, 'Air Slash');

const dragapult = new Pokemon(8, 'Dragapult', {
    level: 50,
    evs: {
        [Stat.ATK]: 252
    }
});
const dragonDarts = new Move(8, 'Dragon Darts');

const conkeldurr = new Pokemon(8, 'Conkeldurr', {
    level: 50,
    item: 'Assault Vest'
});

// Construct Attack objects
const attack1 = new Attack(togekiss, conkeldurr, airSlash);
const attack2 = new Attack(dragapult, conkeldurr, dragonDarts);

// Specify the SurvivalRequirement
// Repeat attack2 as there are two hits of the 50 BP Dragon Darts
const survivalReq = new SurvivalRequirement(.01, 100, attack1, attack2, attack2);
```

#### HPRequirement
This object specifies any passive damage reduction numbers the defending Pokémon's HP stat should satisfy. For example, to minimize Life Orb recoil the HP stat should equal 10n - 1. To specify this, we would use 
```typescript
const hpReq = new HPRequirement({ reduceLifeOrb: true });
```
See [src/model/requirements.ts](https://github.com/AnselBlume/SurvivalCalc-Core/blob/master/src/model/requirements.ts) for the full specification. At the current time, it is recommended to select up to one special HP number, as choosing more than one may restrict the set of possibilities. Future work may involve allowing for combinations of special HP numbers (e.g. Sitrus Berry after Super Fang and Reduce Life Orb Recoil ==> 10n - 2).

#### Requirements
The Requirements object simply bundles the HPRequirement and any number of SurvivalRequirements together. Continuing our above examples, we would have
``` typescript
const reqs = new Requirements(hpReq, survivalReq);
```

### findMinEVs
The **findMinEVs** function finds the best EV spread which meets the specified requirements while using the minimum number of total EVs. The function signature is
```
findMinEVs(reqs: Requirements): Spread
```

To continue our example with Conkeldurr, we would simply call
``` typescript
const minSpread: Spread = findMinEVs(reqs);

console.log(minSpread['hp']); // 228
console.log(minSpread['def']); // 28
console.log(minSpread['sd']); // 164
```

As another full example, suppose we wish to find the minimum number of EVs necessary for Haban Berry Garchomp to survive Latios' Life Orb Draco Meteor at level 50. We would use
```typescript
import {
    Pokemon, Move,
    SurvivalRequirement, HPRequirement, Requirements,
    Attack, Spread, Stat,
    findMinEVs
} from 'index;

// Construct the Attack object
const latios = new Pokemon(8, 'Latios', {
    level: 50,
    evs: {
        [Stat.SATK]: 252
    },
    item: 'Life Orb'
});
const draco = new Move(8, 'Draco Meteor');

const garchomp = new Pokemon(8, 'Garchomp', {
    level: 50,
    item: 'Haban Berry'
});

const attack = new Attack(latios, garchomp, draco);

// Requirements: no special HP numbers,
// survive with .01% of HP remaining 100% of the time
const reqs = new Requirements(new HPRequirement(),
                              new SurvivalRequirement(.01, 100, attack));
// Find the minimal spread
const minSpread = findMinEVs(reqs);
console.log(minSpread[Stat.HP]); // 4
console.log(minSpread[Stat.DEF]); // 0
console.log(minSpread[Stat.SDEF]); // 52
```
### findBestEVs
The **findBestEVs** function finds the best EV spread which meets the specified requirements while using up to a specified number of EVs. The function signature is
``` typescript
findBestEVs(reqs: Requirements, optimizer: Attack[] | BulkLoss, maxEVs: number): Spread
```
where _reqs_ is the set of Requirements to be met, _optimizer_ determines how EV spreads which meet the requirements are selected (described below), and _maxEVs_ is the number of EVs available for use.

Assuming the allowed number of EVs is greater than the minimum number necessary to meet the requirements, there are likely many possible spreads which meet the requirements. Therefore, an additional optimizer argument is required which determines which EV spread to select out of those which meet the requirements. The optimizer comes in two forms: an **Attack[]**, or a **BulkLoss**.

#### Attack[]
If an array of Attacks is specified, findBestEVs will find the spread which meets the requirements and minimizes the damage from the Attack array. 

For example, suppose we want our Amoonguss to survive a Mega Metagross' Zen Headbutt, but we want to minimize the damage dealt by Cresselia's Psychic. We would use Metagross' Zen Headbutt in our SurvivalRequirement, but supply as our optimizer
``` typescript
const toMinimize = [new Attack(cresselia, amoonguss, psychic)];
```

Finding the spread which minimizes damage is computed by the following rules in descending order of importance
1.  Maximizing the number of hits required to KO (maximizing X in an XHKO)
2. Minimizing the chance to get XHKO'd
3. Minimizing the percentage of damage dealt

#### BulkLoss
If an instance of [BulkLoss](https://github.com/AnselBlume/SurvivalCalc-Core/blob/e5e13d836d3e08acf90adfa8f2d2663c6db3628c/src/utilities/loss-func.ts#L50) is specified, findBestEVs will find the spread which meets the requirements and maximizes general bulk (as opposed to damage from a specific series of attacks).

The BulkLoss class computes how "bad" a spread is when trying to maximize bulk. It takes as arguments the defending Pokémon and a weight argument in [0, 1] which determines how much attention is paid to  Defense and Special Defense. A weight of 0 maximizes defensive bulk, while a weight of 1 maximizes special defensive bulk. A weight of .5 balances the bulk evenly.

Continuing with our previous example, if we want our Amoonguss to survive Mega Metagross' Zen Headbutt but try to balance our defensive and special defensive bulk, our optimizer would be
``` typescript
const toMinimize = new BulkLoss(amoonguss, .5);
```
If we want to throw all of our remaining bulk into Special Defense after surviving the Zen Headbutt, we would use
``` typescript
const toMinimize = new BulkLoss(amoonguss, 1);
```
Finally, if we want to ensure that our Amoonguss survives the Zen Headbutt and maximize our Defense, we would use
``` typescript
const toMinimize = new BulkLoss(amoonguss, 0);
```

## Credits
All iterations of the SurvivalCalc were created by [Stats](https://www.smogon.com/forums/members/stats.170688/).

The SurvivalCalc would not be possible without [Honko's Damage Calculator](https://calc.pokemonshowdown.com/) and [its npm package](https://www.npmjs.com/package/@smogon/calc). Many thanks to its developers and maintainers.

The theory behind distributing EVs for defenses as implemented in this calculator was developed collaboratively with [DaWoblefet](https://www.smogon.com/forums/members/dawoblefet.300799/). DaWoblefet's ingenuity and support have been invaluable throughout the years.

The following list enumerates some resources that were helpful to the author.
- [252 Times Better than 252/252: Advanced EV Spreads - Jio](http://nuggetbridge.com/articles/stepping-it-up-small-ways-to-improve-your-game/)
- [A Beginner's Guide to Distributing EVs - umbarsc](https://www.smogon.com/dp/articles/ev_distribution)
- [How to Maximize Your Defenses - X-Act](https://www.smogon.com/dp/articles/maximizing_defenses)
- [Bulking Up: A Guide to Defensive EV Spreads - Stats](http://nuggetbridge.com/articles/bulking-guide-defensive-ev-spreads/)
- [Stepping It Up: Small Ways to Improve Your Game - DaWoblefet](http://nuggetbridge.com/articles/stepping-it-up-small-ways-to-improve-your-game/)

