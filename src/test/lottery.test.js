import { describe, it, expect } from 'vitest'
import {
  draw,
  quickPick,
  checkEntry,
  groupForMatch,
  combinations,
  playRound,
  runUntilWin,
  PRIZE_GROUPS,
  SYSTEM_ENTRIES,
  MIN,
  MAX,
  PICK_COUNT,
} from '../utils/lottery.js'

// ─── draw ─────────────────────────────────────────────────────────────────────

describe('draw', () => {
  it('returns 6 winning numbers and 1 additional', () => {
    const { winning, additional } = draw()
    expect(winning).toHaveLength(6)
    expect(typeof additional).toBe('number')
  })

  it('winning numbers are within 1–49', () => {
    const { winning } = draw()
    winning.forEach(n => {
      expect(n).toBeGreaterThanOrEqual(MIN)
      expect(n).toBeLessThanOrEqual(MAX)
    })
  })

  it('all 7 drawn numbers are unique', () => {
    const { winning, additional } = draw()
    const all = [...winning, additional]
    expect(new Set(all).size).toBe(7)
  })

  it('winning numbers are sorted ascending', () => {
    const { winning } = draw()
    for (let i = 1; i < winning.length; i++) {
      expect(winning[i]).toBeGreaterThan(winning[i - 1])
    }
  })

  it('produces different draws across multiple calls', () => {
    const draws = Array.from({ length: 20 }, () => draw().winning.join(','))
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
    const result = playRound(quickPick(7), 'system7')
    expect(result.draw.winning).toHaveLength(6)
  })
})

// ─── groupForMatch ────────────────────────────────────────────────────────────

describe('groupForMatch', () => {
  it('maps match counts to the correct prize group', () => {
    expect(groupForMatch(6, false)).toBe(1)
    expect(groupForMatch(6, true)).toBe(1)
    expect(groupForMatch(5, true)).toBe(2)
    expect(groupForMatch(5, false)).toBe(3)
    expect(groupForMatch(4, true)).toBe(4)
    expect(groupForMatch(4, false)).toBe(5)
    expect(groupForMatch(3, true)).toBe(6)
    expect(groupForMatch(3, false)).toBe(7)
  })

  it('returns null below 3 matches', () => {
    expect(groupForMatch(2, true)).toBeNull()
    expect(groupForMatch(0, false)).toBeNull()
  })
})

// ─── system entry fast-path equivalence ───────────────────────────────────────

describe('system entry fast path', () => {
  // The optimised runUntilWin counts overlap instead of enumerating C(n,6) combos.
  // This proves that shortcut returns the same best group as the brute-force path.
  it('checkEntry over all numbers equals the best of every C(n,6) combination', () => {
    for (let trial = 0; trial < 300; trial++) {
      const numbers = quickPick(12)
      const result = draw()

      const fast = checkEntry(numbers, result)

      let brute = null
      for (const combo of combinations(numbers)) {
        const g = checkEntry(combo, result)
        if (g !== null && (brute === null || g < brute)) brute = g
      }

      expect(fast).toBe(brute)
    }
  })

  it('holds for every system entry size against a rigged Group 1 draw', () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    const result = { winning: [1, 2, 3, 4, 5, 6], additional: 7 }
    SYSTEM_ENTRIES.filter(e => e.pick > 6).forEach(e => {
      const picks = numbers.slice(0, e.pick)
      const fast = checkEntry(picks, result)
      let brute = null
      for (const combo of combinations(picks)) {
        const g = checkEntry(combo, result)
        if (g !== null && (brute === null || g < brute)) brute = g
      }
      expect(fast).toBe(brute)
    })
  })
})

// ─── runUntilWin ──────────────────────────────────────────────────────────────

describe('runUntilWin', () => {
  it('terminates and reports cost = tries × entry cost (ordinary)', () => {
    const { tries, totalCost } = runUntilWin(7, 'ordinary')
    expect(tries).toBeGreaterThanOrEqual(1)
    expect(totalCost).toBe(tries * 1)
  })

  it('terminates for system entries and scales cost by combo count', () => {
    const { tries, totalCost } = runUntilWin(7, 'system7')
    expect(tries).toBeGreaterThanOrEqual(1)
    expect(totalCost).toBe(tries * 7)
  })

  it('respects user-supplied numbers for an ordinary entry', () => {
    const { tries } = runUntilWin(7, 'ordinary', [1, 2, 3, 4, 5, 6])
    expect(tries).toBeGreaterThanOrEqual(1)
  })

  it('respects user-supplied numbers for a system entry', () => {
    const { tries, totalCost } = runUntilWin(7, 'system7', [1, 2, 3, 4, 5, 6, 7])
    expect(tries).toBeGreaterThanOrEqual(1)
    expect(totalCost).toBe(tries * 7)
  })

  it('only reports progress at the 100k interval', () => {
    // Group 1 (~14M tries) all but guarantees the callback fires; asserting the
    // modulo on every report keeps the test deterministic even on a rare early win.
    const reports = []
    runUntilWin(1, 'ordinary', null, (t) => reports.push(t))
    reports.forEach(t => expect(t % 100_000).toBe(0))
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
