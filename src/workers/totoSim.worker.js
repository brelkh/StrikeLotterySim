import { runUntilWin } from '../utils/toto.js'

self.onmessage = ({ data }) => {
  const { targetGroup, entryType, userNumbers } = data
  const result = runUntilWin(targetGroup, entryType, userNumbers || null)
  self.postMessage(result)
}
