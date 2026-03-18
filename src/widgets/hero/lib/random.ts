export const randomFromSeed = (seed: number) => {
  const x = Math.sin(seed * 9999.1337) * 43758.5453;
  return x - Math.floor(x);
};

export const mapRange = (ratio: number, min: number, max: number) => min + (max - min) * ratio;
