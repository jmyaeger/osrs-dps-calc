const MAX_BURN_STACKS = 5;
const BURN_INTERVAL = 4;
const CONVERGENCE_TOL = 1e-10;
const MAX_ITER = 20_000;

// Phase: number of ticks between the previous burn tick and the current attack tick
// Counts: x1, x2, ..., x10 where each xi is the number of burn stacks with i damage remaining
interface BurnState {
  phase: number;
  counts: number[];
}

// State space indices of the states reached when a burn doesn't or does proc at a given step
interface StateStep {
  noProcIndex: number;
  procIndex: number;
}

// Set of all possible burn states and their transition states
interface BurnStateSpace {
  states: BurnState[];
  steps: StateStep[];
}

interface BurnOptions {
  burnChance: number;
  hitsPerStack: number;
  burnStacksPerProc?: number;
  tol?: number;
  maxIter?: number;
}

const totalStacks = (counts: number[]): number => counts.reduce((a, b) => a + b, 0);

const addStacks = (hitsPerStack: number, stackCount: number, counts?: number[]): number[] => {
  if (counts === undefined) {
    counts = Array(hitsPerStack).fill(0);
  }
  const next = counts.slice();
  next[hitsPerStack - 1] += stackCount;
  return next;
};

const burnStacksAdded = (counts: number[], burnStacksPerProc: number): number => (
  Math.min(burnStacksPerProc, MAX_BURN_STACKS - totalStacks(counts))
);

const applyBurnTick = (counts: number[]): number[] => [...counts.slice(1), 0];

const zeroStackState = (phase: number, hitsPerStack: number): BurnState => ({ phase, counts: Array(hitsPerStack).fill(0) });

// Encode the burn state as a base-6 integer to use as a Map key
// e.g., (phase = 1, counts = 0, 0, 0, 0, 0, 0, 0, 0, 0, 1) => 20000000001 in base 6 (60466177 in decimal)
// This works because phase is in [0, 3] and counts are in [0, 5]
// Note that this scheme would need to be changed if the stack cap were ever changed
const stateToInt = (phase: number, counts: number[], hitsPerStack: number): number => {
  let key = phase;
  for (let i = 0; i < hitsPerStack; i++) {
    key = key * 6 + counts[i];
  }
  return key;
};

// Number of burn ticks that happened since the previous attack
const burnsSinceLast = (phase: number, attackSpeed: number): number => {
  const nextBurnOffset = phase === 0 ? 0 : BURN_INTERVAL - phase;
  if (nextBurnOffset >= attackSpeed) {
    return 0;
  }
  return Math.floor((attackSpeed - 1 - nextBurnOffset) / BURN_INTERVAL) + 1;
};

const applyBurnsSinceLast = (counts: number[], phase: number, attackSpeed: number, hitsPerStack: number): BurnState => {
  let current = counts;
  const nextPhase = (phase + attackSpeed) % BURN_INTERVAL;
  const burnCount = burnsSinceLast(phase, attackSpeed);
  for (let t = 0; t < burnCount; t++) {
    current = applyBurnTick(current);
    if (totalStacks(current) === 0) {
      return zeroStackState(nextPhase, hitsPerStack);
    }
  }
  return { phase: nextPhase, counts: current };
};

const nextState = (
  state: BurnState,
  procOccurs: boolean,
  attackSpeed: number,
  hitsPerStack: number,
  burnStacksPerProc: number,
): BurnState => {
  let counts = state.counts;
  if (procOccurs) {
    const stacksToAdd = burnStacksAdded(counts, burnStacksPerProc);
    if (stacksToAdd > 0) {
      counts = addStacks(hitsPerStack, stacksToAdd, counts);
    }
  }

  return applyBurnsSinceLast(counts, state.phase, attackSpeed, hitsPerStack);
};

const buildStateSpace = (attackSpeed: number, hitsPerStack: number, burnStacksPerProc: number): BurnStateSpace => {
  const states: BurnState[] = [];
  const steps: StateStep[] = [];
  const stateToIndex = new Map<number, number>();

  const getOrAddStateIndex = (state: BurnState): number => {
    const key = stateToInt(state.phase, state.counts, hitsPerStack);
    let index = stateToIndex.get(key);
    if (index === undefined) {
      // Add a new state space entry if this state hasn't been added yet
      index = states.length;
      stateToIndex.set(key, index);
      states.push(state);
      steps.push({ noProcIndex: 0, procIndex: 0 });
    }
    return index;
  };

  getOrAddStateIndex(zeroStackState(0, hitsPerStack));

  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    const noProcState = nextState(state, false, attackSpeed, hitsPerStack, burnStacksPerProc);
    const procState = nextState(state, true, attackSpeed, hitsPerStack, burnStacksPerProc);

    steps[i] = { noProcIndex: getOrAddStateIndex(noProcState), procIndex: getOrAddStateIndex(procState) };
  }

  return { states, steps };
};

const steadyStateBurnDist = (stateSpace: BurnStateSpace, procChance: number, tol = CONVERGENCE_TOL, maxIter = MAX_ITER): Float64Array => {
  const { steps } = stateSpace;
  let dist = new Float64Array(steps.length);
  dist[0] = 1;

  for (let iter = 1; iter <= maxIter; iter++) {
    const next = new Float64Array(steps.length);
    for (let i = 0; i < steps.length; i++) {
      const prob = dist[i];
      if (prob === 0) {
        continue;
      }

      const { noProcIndex, procIndex } = steps[i];
      if (noProcIndex === procIndex) {
        // If both outcomes lead to the same state, the branch probability does not affect the state distribution
        next[noProcIndex] += prob;
        continue;
      }

      next[noProcIndex] += prob * (1 - procChance);
      next[procIndex] += prob * procChance;
    }

    let diff = 0;
    for (let i = 0; i < next.length; i++) {
      // Lazy markov chain because the non-lazy version wasn't converging when procChance was very high
      next[i] = 0.5 * next[i] + 0.5 * dist[i];
      diff += Math.abs(next[i] - dist[i]);
    }

    dist = next;
    if (diff < tol) {
      return dist;
    }
  }
  return dist;
};

// eslint-disable-next-line import/prefer-default-export
export const getExpectedBurn = (
  hitChance: number,
  attackSpeed: number,
  opts: BurnOptions,
): number => {
  const {
    burnChance,
    hitsPerStack,
    burnStacksPerProc = 1,
    tol = CONVERGENCE_TOL,
    maxIter = MAX_ITER,
  } = opts;
  const procChance = hitChance * burnChance;
  const stateSpace = buildStateSpace(attackSpeed, hitsPerStack, burnStacksPerProc);
  const steadyStateDist = steadyStateBurnDist(stateSpace, procChance, tol, maxIter);

  // Determine the expected number of stacks available to be added when a burn procs (i.e.,
  // accounting for both the burn cap and the number of stacks added per proc)
  let expectedStacksAdded = 0;
  for (let i = 0; i < stateSpace.states.length; i++) {
    expectedStacksAdded += steadyStateDist[i] * burnStacksAdded(stateSpace.states[i].counts, burnStacksPerProc);
  }

  return hitsPerStack * procChance * expectedStacksAdded;
};
