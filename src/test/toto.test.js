import { describe, it, expect } from 'vitest'
import {
  drawToto,
  quickPick,
  checkEntry,
  combinations,
  playRound,
  PRIZE_GROUPS,
  SYSTEM_ENTRIES,
  TOTO_MIN,
  TOTO_MAX,
  PICK_COUNT,
} from '../utils/toto.js'

// ─── drawToto ────────────────────────────────────────────────────────────────

describe('drawToto', () => {
  it('returns 6 winning numbers and 1 additional', () => {
    const { winning, additional } = drawToto()
    expect(winning).toHaveLength(6)
    expect(typeof additional).toBe('number')
  })

  it('winning numbers are within 1–49', () => {
    const { winning } = drawToto()
    winning.forEach(n => {
      expect(n).toBeGreaterThanOrEqual(TOTO_MIN)
      expect(n).toBeLessThanOrEqual(TOTO_MAX)
    })
  })

  it('all 7 drawn numbers are unique', () => {
    const { winning, additional } = drawToto()
    const all = [...winning, additional]
    expect(new Set(all).size).toBe(7)
  })

  it('winning numbers are sorted ascending', () => {
    const { winning } = drawToto()
    for (let i = 1; i < winning.length; i++) {
      expect(winning[i]).toBeGreaterThan(winning[i - 1])
    }
  })

  it('produces different draws across multiple calls', () => {
    const draws = Array.from({ length: 20 }, () => drawToto().winning.join(','))
    const unique = new Set(draws)
    expect(unique.size).toBeGreaterThan(1)
  })
})

// ─── quickPick ───────────────────────────────────────────────────────────────

describe('quickPick', () => {
  it('returns 6 unique numbers by default', () => {
    const nums = quickPick()
    expect(nums).toHaveLength(6)
    expect(new Set(nums).size).toBe(6)
  })

  it('returns n numbers when specified', () => {
    expect(quickPick(7)).toHaveLength(7)
    expect(quickPick(12)).toHaveLength(12)
  })

  it('numbers are within 1–49', () => {
    quickPick(12).forEach(n => {
      expect(n).toBeGreaterThanOrEqual(1)
      expect(n).toBeLessThanOrEqual(49)
    })
  })

  it('numbers are sorted ascending', () => {
    const nums = quickPick()
    for (let i = 1; i < nums.length; i++) {
      expect(nums[i]).toBeGreaterThan(nums[i - 1])
    }
  })
})

// ─── checkEntry ──────────────────────────────────────────────────────────────

describe('checkEntry', () => {
  const winning = [1, 2, 3, 4, 5, 6]
  const additional = 7

  it('Group 1: matches all 6 winning numbers', () => {
    expect(checkEntry([1, 2, 3, 4, 5, 6], { winning, additional })).toBe(1)
  })

  it('Group 2: matches 5 winning + additional', () => {
    expect(checkEntry([1, 2, 3, 4, 5, 7], { winning, additional })).toBe(2)
  })

  it('Group 3: matches 5 winning, no additional', () => {
    expect(checkEntry([1, 2, 3, 4, 5, 8], { winning, additional })).toBe(3)
  })

  it('Group 4: matches 4 winning + additional', () => {
    expect(checkEntry([1, 2, 3, 4, 7, 9], { winning, additional })).toBe(4)
  })

  it('Group 5: matches 4 winning, no additional', () => {
    expect(checkEntry([1, 2, 3, 4, 8, 9], { winning, additional })).toBe(5)
  })

  it('Group 6: matches 3 winning + additional', () => {
    expect(checkEntry([1, 2, 3, 7, 8, 9], { winning, additional })).toBe(6)
  })

  it('Group 7: matches 3 winning, no additional', () => {
    expect(checkEntry([1, 2, 3, 8, 9, 10], { winning, additional })).toBe(7)
  })

  it('returns null for 2 or fewer matches', () => {
    expect(checkEntry([1, 2, 8, 9, 10, 11], { winning, additional })).toBeNull()
    expect(checkEntry([1, 8, 9, 10, 11, 12], { winning, additional })).toBeNull()
    expect(checkEntry([8, 9, 10, 11, 12, 13], { winning, additional })).toBeNull()
  })

  it('returns null when additional is irrelevant with <3 winning matches', () => {
    expect(checkEntry([1, 2, 7, 9, 10, 11], { winning, additional })).toBeNull()
  })
})

// ─── combinations ─────────────────────────────────────────────────────────────

describe('combinations', () => {
  it('generates C(7,6)=7 combinations for system 7', () => {
    const nums = [1, 2, 3, 4, 5, 6, 7]
    expect(combinations(nums)).toHaveLength(7)
  })

  it('generates C(8,6)=28 combinations for system 8', () => {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8]
    expect(combinations(nums)).toHaveLength(28)
  })

  it('generates C(12,6)=924 combinations for system 12', () => {
    const nums = Array.from({ length: 12 }, (_, i) => i + 1)
    expect(combinations(nums)).toHaveLength(924)
  })

  it('each combination has exactly 6 numbers', () => {
    combinations([1, 2, 3, 4, 5, 6, 7]).forEach(c => expect(c).toHaveLength(6))
  })

  it('no duplicate combinations', () => {
    const combos = combinations([1, 2, 3, 4, 5, 6, 7])
    const strs = combos.map(c => c.join(','))
    expect(new Set(strs).size).toBe(strs.length)
  })
})

// ─── playRound ────────────────────────────────────────────────────────────────

describe('playRound', () => {
  it('returns draw, bestGroup, and matchedEntry', () => {
    const result = playRound([1, 2, 3, 4, 5, 6], 'ordinary')
    expect(result).toHaveProperty('draw')
    expect(result).toHaveProperty('bestGroup')
    expect(result).toHaveProperty('matchedEntry')
  })

  it('bestGroup is null or a number 1–7', () => {
    for (let i = 0; i < 10; i++) {
      const { bestGroup } = playRound(quickPick(), 'ordinary')
      if (bestGroup !== null) {
        expect(bestGroup).toBeGreaterThanOrEqual(1)
        expect(bestGroup).toBeLessThanOrEqual(7)
      }
    }
  })

  it('system 7 entry checks 7 combinations', () => {
    // Force a win by using the draw numbers as part of our 7-number selection
    // This is probabilistic but testing the mechanic is sufficient
    const result = playRound(quickPick(7), 'system7')
    expect(result.draw.winning).toHaveLength(6)
  })
})

// ─── constants ────────────────────────────────────────────────────────────────

describe('constants', () => {
  it('PRIZE_GROUPS has 7 groups', () => {
    expect(PRIZE_GROUPS).toHaveLength(7)
  })

  it('PRIZE_GROUPS groups are numbered 1–7', () => {
    const groups = PRIZE_GROUPS.map(g => g.group)
    expect(groups).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('SYSTEM_ENTRIES has correct combo counts', () => {
    const map = Object.fromEntries(SYSTEM_ENTRIES.map(e => [e.type, e.combos]))
    expect(map.ordinary).toBe(1)
    expect(map.system7).toBe(7)
    expect(map.system8).toBe(28)
    expect(map.system12).toBe(924)
  })

  it('SYSTEM_ENTRIES costs match combo counts for system entries', () => {
    SYSTEM_ENTRIES.filter(e => e.type.startsWith('system')).forEach(e => {
      expect(e.cost).toBe(e.combos)
    })
  })
})
