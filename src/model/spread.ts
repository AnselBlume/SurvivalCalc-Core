import { Stat } from 'model/stat';

export class Spread {
    [Stat.HP]: number;
    [Stat.DEF]: number;
    [Stat.SDEF]: number;

    constructor(hpEVs = 0, defEVs = 0, sDefEVs = 0) {
        this[Stat.HP] = hpEVs;
        this[Stat.DEF] = defEVs;
        this[Stat.SDEF] = sDefEVs;
    }
}
