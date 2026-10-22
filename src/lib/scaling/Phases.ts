import { Monster } from '@/types/Monster';
import { ARAXXOR_IDS, BORK_IDS, YAMA_IDS } from '@/lib/constants';

const applyMonsterPhases = (m: Monster): Monster => {
  if (BORK_IDS.includes(m.id)) {
    const smorksHp = m.inputs.smorksHp ?? 100;
    const flatArmour = m.inputs.phase === 'Stunned' ? 0 : 14 - 2 * Math.min(3, Math.floor(smorksHp / 25));
    return {
      ...m,
      defensive: {
        ...m.defensive,
        flat_armour: flatArmour,
      },
    };
  }

  if (!m.inputs.phase) {
    return m;
  }

  if (ARAXXOR_IDS.includes(m.id) && m.inputs.phase === 'Enraged') {
    return {
      ...m,
      skills: {
        ...m.skills,
        def: m.skills.def + 35,
        magic: m.skills.magic + 28,
        ranged: m.skills.ranged + 31,
      },
    };
  }

  // yama goes to 60 magic defence if the tank is using magic
  if (YAMA_IDS.includes(m.id) && m.version !== 'Enraged') {
    const mdef = m.inputs.phase === 'Tank using magic' ? 60 : -30;
    return {
      ...m,
      defensive: {
        ...m.defensive,
        magic: mdef,
      },
    };
  }

  return m;
};

export default applyMonsterPhases;
