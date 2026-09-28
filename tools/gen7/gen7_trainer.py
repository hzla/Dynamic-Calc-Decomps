"""USUM v1.2 trainer generation, traced from the user's update executable.

Virtual addresses (code.bin offset = VA - 0x100000):
  0x432318 trainer Pokemon constructor
  0x4323cc seed = species + level; 0x4323d8 advance trainer_class times
  0x432400 next random word; 0x4325a0 automatic ability = bit 16
  0x432450 copies the nature byte into the creation parameters
  0x320ec0 only nature 0xffff triggers random selection (not a trainer byte)
"""
MASK = 0xFFFFFFFF


class TinyMT32:
    def __init__(self, seed):
        self.s = [seed & MASK, 0x8F7011EE, 0xFC78FF1F, 0x3793FDFF]
        for i in range(1, 8):
            prev = self.s[(i - 1) & 3]
            self.s[i & 3] ^= (i + 1812433253 * (prev ^ (prev >> 30))) & MASK
        if not ((self.s[0] & 0x7FFFFFFF) or self.s[1] or self.s[2] or self.s[3]):
            self.s = list(b'TINY')
        for _ in range(8):
            self.advance()

    def advance(self):
        a, b, c, y = self.s
        x = (a & 0x7FFFFFFF) ^ b ^ c
        x = (x ^ (x << 1)) & MASK
        y = (y ^ (y >> 1) ^ x) & MASK
        self.s = [b, c, (x ^ (y << 10)) & MASK, y]
        if y & 1:
            self.s[1] ^= 0x8F7011EE
            self.s[2] ^= 0xFC78FF1F

    def next(self):
        self.advance()
        t = (self.s[0] + (self.s[2] >> 8)) & MASK
        return self.s[3] ^ t ^ (0x3793FDFF if t & 1 else 0)


def trainer_random(species, level, trainer_class):
    rng = TinyMT32(species + level)
    for _ in range(trainer_class):
        rng.next()
    return rng.next()


def ability_slot(species, level, trainer_class, flag):
    return flag if flag else 1 + ((trainer_random(species, level, trainer_class) >> 16) & 1)


def effective_evs(raw):
    # Constructor invokes the capped EV setter in HP/Atk/Def/SpA/SpD/Spe order.
    remaining, evs = 510, []
    for value in raw:
        v = min(value, 252, remaining)
        evs.append(v)
        remaining -= v
    return evs
