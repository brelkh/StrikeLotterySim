// Singapore Toto rules:
// - Pick 6 numbers from 1–49
// - Draw produces 6 winning numbers + 1 additional number
// - Prize groups 1–7 based on matches

export const TOTO_MIN = 1
export const TOTO_MAX = 49
export const PICK_COUNT = 6

// Prize estimates based on typical 2025 Singapore Toto draws.
// Groups 1–4 are pari-mutuel (shared prize pool) so amounts vary; groups 5–7 are fixed.
export const PRIZE_GROUPS = [
  { group: 1, label: 'Group 1 (Jackpot)', description: 'Match 6',            minMatch: 6, needsAdditional: false, prizeEst: '~$1M+',    prizeNote: 'Jackpot (pari-mutuel, min. $1M)' },
  { group: 2, label: 'Group 2',           description: 'Match 5 + Additional', minMatch: 5, needsAdditional: true,  prizeEst: '~$250,000', prizeNote: 'Pari-mutuel, varies per draw' },
  { group: 3, label: 'Group 3',           description: 'Match 5',            minMatch: 5, needsAdditional: false, prizeEst: '~$5,000',   prizeNote: 'Pari-mutuel, varies per draw' },
  { group: 4, label: 'Group 4',           description: 'Match 4 + Additional', minMatch: 4, needsAdditional: true,  prizeEst: '~$500',     prizeNote: 'Pari-mutuel, varies per draw' },
  { group: 5, label: 'Group 5',           description: 'Match 4',            minMatch: 4, needsAdditional: false, prizeEst: '$50',       prizeNote: 'Fixed prize' },
  { group: 6, label: 'Group 6',           description: 'Match 3 + Additional', minMatch: 3, needsAdditional: true,  prizeEst: '$25',       prizeNote: 'Fixed prize' },
  { group: 7, label: 'Group 7',           description: 'Match 3',            minMatch: 3, needsAdditional: false, prizeEst: '$10',       prizeNote: 'Fixed prize' },
]

// Approximate odds per ordinary $1 bet
export const PRIZE_ODDS = {
  1: 13983816,
  2: 2330636,
  3: 55491,
  4: 9139,
  5: 733,
  6: 243,
  7: 61,
}

// System entry config: how many numbers to pick and how many combos it generates
export const SYSTEM_ENTRIES = [
  { type: 'ordinary', label: 'Ordinary',    pick: 6, combos: 1,   cost: 1 },
  { type: 'quickpick', label: 'Quick Pick', pick: 6, combos: 1,   cost: 1 },
  { type: 'system7',  label: 'System 7',   pick: 7, combos: 7,   cost: 7 },
  { type: 'system8',  label: 'System 8',   pick: 8, combos: 28,  cost: 28 },
  { type: 'system9',  label: 'System 9',   pick: 9, combos: 84,  cost: 84 },
  { type: 'system10', label: 'System 10',  pick: 10, combos: 210, cost: 210 },
  { type: 'system11', label: 'System 11',  pick: 11, combos: 462, cost: 462 },
  { type: 'system12', label: 'System 12',  pick: 12, combos: 924, cost: 924 },
]

/** Draw 6 winning + 1 additional from 1–49, all unique */
export function drawToto() {
  const pool = Array.from({ length: 49 }, (_, i) => i + 1)
  shuffle(pool)
  const winning = pool.slice(0, 6).sort((a, b) => a - b)
  const additional = pool[6]
  return { winning, additional }
}

/** Pick n unique random numbers from 1–49 */
export function quickPick(n = 6) {
  const pool = Array.from({ length: 49 }, (_, i) => i + 1)
  shuffle(pool)
  return pool.slice(0, n).sort((a, b) => a - b)
}

/**
 * Check a single 6-number entry against a draw result.
 * Returns the best prize group won (1–7), or null if no win.
 */
export function checkEntry(entry, { winning, additional }) {
  const winSet = new Set(winning)
  let matched = 0
  let hasAdditional = false

  for (const n of entry) {
    if (winSet.has(n)) matched++
    if (n === additional) hasAdditional = true
  }

  if (matched === 6) return 1
  if (matched === 5 && hasAdditional) return 2
  if (matched === 5) return 3
  if (matched === 4 && hasAdditional) return 4
  if (matched === 4) return 5
  if (matched === 3 && hasAdditional) return 6
  if (matched === 3) return 7
  return null
}

/**
 * Generate all C(n,6) combinations from an array of numbers.
 * Used for system entries.
 */
export function combinations(arr) {
  const result = []
  const n = arr.length
  for (let a = 0; a < n - 5; a++)
    for (let b = a + 1; b < n - 4; b++)
      for (let c = b + 1; c < n - 3; c++)
        for (let d = c + 1; d < n - 2; d++)
          for (let e = d + 1; e < n - 1; e++)
            for (let f = e + 1; f < n; f++)
              result.push([arr[a], arr[b], arr[c], arr[d], arr[e], arr[f]])
  return result
}

/**
 * Play one round with the given numbers and entry type.
 * Returns { draw, bestGroup, matchedEntry } where bestGroup is 1–7 or null.
 */
export function playRound(numbers, entryType) {
  const draw = drawToto()
  const entries = entryType === 'ordinary' || entryType === 'quickpick'
    ? [numbers]
    : combinations(numbers)

  let bestGroup = null
  let matchedEntry = null
  for (const entry of entries) {
    const group = checkEntry(entry, draw)
    if (group !== null && (bestGroup === null || group < bestGroup)) {
      bestGroup = group
      matchedEntry = entry
    }
  }
  return { draw, bestGroup, matchedEntry }
}

/**
 * Simulate draws until achieving at least `targetGroup` (lower = better).
 * Returns { tries, totalCost }.
 * onProgress(tries) is called every PROGRESS_INTERVAL iterations if provided.
 */
export function runUntilWin(targetGroup, entryType = 'ordinary', userNumbers = null, onProgress = null) {
  const config = SYSTEM_ENTRIES.find(e => e.type === entryType) || SYSTEM_ENTRIES[0]
  let tries = 0
  let totalCost = 0
  const PROGRESS_INTERVAL = 100_000

  // Optimised hot path for ordinary/quick-pick with no user numbers:
  // reuse two arrays and use partial Fisher-Yates (k swaps instead of 48)
  // to avoid per-iteration heap allocation that tanks perf at ~14M iterations.
  const isSimple = (entryType === 'ordinary' || entryType === 'quickpick') && !userNumbers
  if (isSimple) {
    const drawPool   = Array.from({ length: 49 }, (_, i) => i + 1)
    const ticketPool = Array.from({ length: 49 }, (_, i) => i + 1)

    while (true) {
      // Partial Fisher-Yates: select 7 for the draw (6 winning + 1 additional)
      for (let i = 0; i < 7; i++) {
        const j = i + ((Math.random() * (49 - i)) | 0)
        const t = drawPool[i]; drawPool[i] = drawPool[j]; drawPool[j] = t
      }
      // Partial Fisher-Yates: select 6 for the random ticket
      for (let i = 0; i < 6; i++) {
        const j = i + ((Math.random() * (49 - i)) | 0)
        const t = ticketPool[i]; ticketPool[i] = ticketPool[j]; ticketPool[j] = t
      }

      const additional = drawPool[6]
      let matched = 0
      let hasAdditional = false
      for (let i = 0; i < 6; i++) {
        const n = ticketPool[i]
        if (n === additional) hasAdditional = true
        for (let j = 0; j < 6; j++) {
          if (drawPool[j] === n) { matched++; break }
        }
      }

      let bestGroup = null
      if (matched === 6)                      bestGroup = 1
      else if (matched === 5 && hasAdditional) bestGroup = 2
      else if (matched === 5)                  bestGroup = 3
      else if (matched === 4 && hasAdditional) bestGroup = 4
      else if (matched === 4)                  bestGroup = 5
      else if (matched === 3 && hasAdditional) bestGroup = 6
      else if (matched === 3)                  bestGroup = 7

      tries++
      totalCost += config.cost
      if (onProgress && tries % PROGRESS_INTERVAL === 0) onProgress(tries)
      if (bestGroup !== null && bestGroup <= targetGroup) break
    }
  } else {
    // General path for system entries or user-supplied numbers
    while (true) {
      const numbers = userNumbers || quickPick(config.pick)
      const { bestGroup } = playRound(numbers, entryType)
      tries++
      totalCost += config.cost
      if (onProgress && tries % PROGRESS_INTERVAL === 0) onProgress(tries)
      if (bestGroup !== null && bestGroup <= targetGroup) break
    }
  }

  return { tries, totalCost }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
}
