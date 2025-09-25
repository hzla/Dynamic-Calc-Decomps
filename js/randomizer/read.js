abilityWhitelist = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22,
    23, 24, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 39, 40, 41, 42, 43,
    44, 45, 46, 47, 48, 49, 50, 52, 53, 54, 55, 56, 57, 58, 60, 61, 62, 63, 64,
    65, 66, 67, 68, 69, 70, 71, 72, 73, 75, 76, 78, 79, 80, 82, 83, 84, 85, 86,
    87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 101, 102, 104, 105, 106,
    109, 110, 111, 112, 113, 114, 115, 116, 117, 119, 120, 123, 125, 126, 127,
    128, 129, 132, 133, 134, 135, 136, 137, 138, 139, 140, 142, 143, 144, 146,
    147, 148, 149, 150, 151, 152, 153, 154, 156, 157, 158, 159, 160, 162, 163,
    164, 165, 167, 168, 169, 170, 171, 172, 173, 174, 175, 177, 178, 179, 181,
    182, 183, 184, 185, 186, 187, 189, 190, 191, 192, 194, 195, 196, 198, 199,
    200, 201, 202, 204, 205, 206, 207, 212, 213, 214, 215, 216, 218, 219, 220,
    221, 222, 223, 224, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236,
    238, 239, 242, 243, 244, 245, 246, 247, 249, 251, 252, 253, 254, 255, 256,
    259, 260, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274,
    276, 277, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 291, 292, 293,
    295, 296, 297, 300, 305, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320,
    321, 322, 323, 324, 325, 327,
];

class Sfc32State {
  constructor(a, b, c, ctr) {
    this.a = a >>> 0; // Force to 32-bit unsigned
    this.b = b >>> 0;
    this.c = c >>> 0;
    this.ctr = ctr >>> 0;
  }

  nextStream(stream) {
    const result = (this.a + this.b + this.ctr) >>> 0;
    this.ctr = (this.ctr + stream) >>> 0;
    this.a = (this.b ^ (this.b >>> 9)) >>> 0;
    this.b = (this.c * 9) >>> 0;
    this.c = (result + ((this.c << 21) | (this.c >>> 11))) >>> 0;
    return result;
  }
}

const RANDOMIZER_STREAM = 17;
const RANDOMIZER_REASON_ABILITIES = 9;

function randomizerRandSeed(reason, data1, data2, trainerId) {
  const state = new Sfc32State(
    (trainerId + reason) >>> 0,
    (trainerId ^ data2) >>> 0,
    data1 >>> 0,
    RANDOMIZER_STREAM,
  );

  // Warm up the generator
  for (let i = 0; i < 10; i++) {
    state.nextStream(RANDOMIZER_STREAM);
  }

  return state;
}

function randomizerNextRange(state, range) {
  if (range < 2) return 0;
  if (range === 0xffffffff) return state.nextStream(RANDOMIZER_STREAM);

  // Find next power of two
  let nextPowerOfTwo = range;
  nextPowerOfTwo--;
  nextPowerOfTwo |= nextPowerOfTwo >>> 1;
  nextPowerOfTwo |= nextPowerOfTwo >>> 2;
  nextPowerOfTwo |= nextPowerOfTwo >>> 4;
  nextPowerOfTwo |= nextPowerOfTwo >>> 8;
  nextPowerOfTwo |= nextPowerOfTwo >>> 16;
  nextPowerOfTwo++;

  const mask = nextPowerOfTwo - 1;

  // Rejection sampling
  let result;
  do {
    result = state.nextStream(RANDOMIZER_STREAM) & mask;
  } while (result >= range);

  return result;
}

function randomizeAbility(species, abilityNum, trainerId) {

  // Generate seed
  const seed = ((species << 8) | abilityNum) >>> 0;

  // Initialize RNG
  const state = randomizerRandSeed(
    RANDOMIZER_REASON_ABILITIES,
    seed,
    species,
    trainerId,
  );

  // Pick random ability from whitelist
  const newAbility =
    abilityWhitelist[randomizerNextRange(state, abilityWhitelist.length)];

  // const isAvailable = isAbilityAvialable(species, abilityNum, isRandomiserActive);
 

  return newAbility;
}