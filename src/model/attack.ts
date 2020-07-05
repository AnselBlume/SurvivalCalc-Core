import { Pokemon, Move, Field } from '@smogon/calc';

/**
 * Class representing a Pokemon's attack against another
 */
export class Attack {
	attacker: Pokemon;
	defender: Pokemon;
	move: Move;
	field: Field;

	constructor(attacker: Pokemon, defender: Pokemon, move: Move, field?: Field) {
		this.attacker = attacker;
		this.defender = defender;
		this.move = move;
		this.field = field;
	}
}
