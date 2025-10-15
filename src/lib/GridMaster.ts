import { StaticImageData } from 'next/image';
import melee_1 from '@/public/img/gridmaster/melee_1.png';
import melee_2 from '@/public/img/gridmaster/melee_2.png';
import melee_3 from '@/public/img/gridmaster/melee_3.png';
import melee_4 from '@/public/img/gridmaster/melee_4.png';
import melee_5 from '@/public/img/gridmaster/melee_5.png';
import melee_6 from '@/public/img/gridmaster/melee_6.png';
import ranged_1 from '@/public/img/gridmaster/ranged_1.png';
import ranged_2 from '@/public/img/gridmaster/ranged_2.png';
import ranged_3 from '@/public/img/gridmaster/ranged_3.png';
import ranged_4 from '@/public/img/gridmaster/ranged_4.png';
import ranged_5 from '@/public/img/gridmaster/ranged_5.png';
import ranged_6 from '@/public/img/gridmaster/ranged_6.png';
import magic_1 from '@/public/img/gridmaster/magic_1.png';
import magic_2 from '@/public/img/gridmaster/magic_2.png';
import magic_3 from '@/public/img/gridmaster/magic_3.png';
import magic_4 from '@/public/img/gridmaster/magic_4.png';
import magic_5 from '@/public/img/gridmaster/magic_5.png';
import magic_6 from '@/public/img/gridmaster/magic_6.png';

export enum MeleeMastery {
  NONE = 0,
  MELEE_1,
  MELEE_2,
  MELEE_3,
  MELEE_4,
  MELEE_5,
  MELEE_6,
}

export enum RangedMastery {
  NONE = 0,
  RANGED_1,
  RANGED_2,
  RANGED_3,
  RANGED_4,
  RANGED_5,
  RANGED_6,
}

export enum MagicMastery {
  NONE = 0,
  MAGIC_1,
  MAGIC_2,
  MAGIC_3,
  MAGIC_4,
  MAGIC_5,
  MAGIC_6,
}

export interface GridMasterState {
  melee: MeleeMastery;
  ranged: RangedMastery;
  magic: MagicMastery;

  minimumPotential?: boolean;
  exposure?: boolean;

  /** for {@link MagicMastery.MAGIC_2} */
  ticksDelayed: number;

  /** for {@link RangedMastery.RANGED_2}. not shown in ui anymore but still stateful in calculations */
  attackCount: number;
}

export type MasteryStyle = keyof Pick<GridMasterState, 'melee' | 'ranged' | 'magic'>;

export const defaultGridMasterState = (): GridMasterState => ({
  melee: MeleeMastery.NONE,
  ranged: RangedMastery.NONE,
  magic: MagicMastery.NONE,
  minimumPotential: false,
  exposure: false,
  ticksDelayed: 0,
  attackCount: 2, // average, -1 relative to ui so this is 3/5
});

export interface MasteryUiData<S extends MasteryStyle> {
  masteryStyle: S;
  mastery: GridMasterState[S];
  name: string;
  image: StaticImageData;
}

export const MELEE_MASTERIES: MasteryUiData<'melee'>[] = [
  {
    name: 'Melee I',
    mastery: MeleeMastery.MELEE_1,
    masteryStyle: 'melee',
    image: melee_1,
  },
  {
    name: 'Melee II',
    mastery: MeleeMastery.MELEE_2,
    masteryStyle: 'melee',
    image: melee_2,
  },
  {
    name: 'Melee III',
    mastery: MeleeMastery.MELEE_3,
    masteryStyle: 'melee',
    image: melee_3,
  },
  {
    name: 'Melee IV',
    mastery: MeleeMastery.MELEE_4,
    masteryStyle: 'melee',
    image: melee_4,
  },
  {
    name: 'Melee V',
    mastery: MeleeMastery.MELEE_5,
    masteryStyle: 'melee',
    image: melee_5,
  },
  {
    name: 'Melee VI',
    mastery: MeleeMastery.MELEE_6,
    masteryStyle: 'melee',
    image: melee_6,
  },
];

export const RANGED_MASTERIES: MasteryUiData<'ranged'>[] = [
  {
    name: 'Ranged I',
    mastery: RangedMastery.RANGED_1,
    masteryStyle: 'ranged',
    image: ranged_1,
  },
  {
    name: 'Ranged II',
    mastery: RangedMastery.RANGED_2,
    masteryStyle: 'ranged',
    image: ranged_2,
  },
  {
    name: 'Ranged III',
    mastery: RangedMastery.RANGED_3,
    masteryStyle: 'ranged',
    image: ranged_3,
  },
  {
    name: 'Ranged IV',
    mastery: RangedMastery.RANGED_4,
    masteryStyle: 'ranged',
    image: ranged_4,
  },
  {
    name: 'Ranged V',
    mastery: RangedMastery.RANGED_5,
    masteryStyle: 'ranged',
    image: ranged_5,
  },
  {
    name: 'Ranged VI',
    mastery: RangedMastery.RANGED_6,
    masteryStyle: 'ranged',
    image: ranged_6,
  },
];

export const MAGIC_MASTERIES: MasteryUiData<'magic'>[] = [
  {
    name: 'Magic I',
    mastery: MagicMastery.MAGIC_1,
    masteryStyle: 'magic',
    image: magic_1,
  },
  {
    name: 'Magic II',
    mastery: MagicMastery.MAGIC_2,
    masteryStyle: 'magic',
    image: magic_2,
  },
  {
    name: 'Magic III',
    mastery: MagicMastery.MAGIC_3,
    masteryStyle: 'magic',
    image: magic_3,
  },
  {
    name: 'Magic IV',
    mastery: MagicMastery.MAGIC_4,
    masteryStyle: 'magic',
    image: magic_4,
  },
  {
    name: 'Magic V',
    mastery: MagicMastery.MAGIC_5,
    masteryStyle: 'magic',
    image: magic_5,
  },
  {
    name: 'Magic VI',
    mastery: MagicMastery.MAGIC_6,
    masteryStyle: 'magic',
    image: magic_6,
  },
];
