export type Factor = [factor: number, divisor: number];
export type MinMax = [min: number, max: number];

export const lerp = (curr: number, srcStart: number, srcEnd: number, dstStart: number, dstEnd: number): number => {
  // todo replace usages with iLerp
  // does this need to be int-based?
  const srcRange = srcEnd - srcStart;
  const dstRange = dstEnd - dstStart;
  const currNorm = curr - srcStart;

  return Math.trunc(((currNorm * dstRange) / srcRange) + dstStart);
};

export const iSqrt = (x: number) => Math.trunc(Math.sqrt(x));
export const iLerp = (x1: number, x2: number, y1: number, y2: number, yc: number): number => x1 + Math.trunc((x2 - x1) * (yc - y1) / (y2 - y1));
export const addPercent = (x: number, pct: number): number => x + Math.trunc(x * pct / 100);

function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

function binomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  return factorial(n) / (factorial(k) * factorial(n - k));
}

export const binomialProbability = (n: number, k: number, p: number): number => binomialCoefficient(n, k) * p ** k * (1 - p) ** (n - k);
