export function damerauLevenshteinSimilarity(first: string, second: string): number {
  const lengthFirst = first.length
  const lengthSecond = second.length

  if (lengthFirst === 0 && lengthSecond === 0) {
    return 1
  }

  if (lengthFirst === 0 || lengthSecond === 0) {
    return 0
  }

  let a = first
  let b = second
  let m = lengthFirst
  let n = lengthSecond
  if (m > n) {
    a = second
    b = first
    m = lengthSecond
    n = lengthFirst
  }

  let twoRowsBack: number[] = Array.from({ length: n + 1 }).fill(0) as number[]
  let previousRow: number[] = Array.from({ length: n + 1 }, (_, i) => i)
  let currRow: number[] = Array.from({ length: n + 1 }).fill(0) as number[]

  for (let i = 1; i <= m; i++) {
    currRow[0] = i

    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1

      let minEdit = Math.min(previousRow[j]! + 1, currRow[j - 1]! + 1, previousRow[j - 1]! + cost)

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        minEdit = Math.min(minEdit, twoRowsBack[j - 2]! + 1)
      }

      currRow[j] = minEdit
    }

    ;[twoRowsBack, previousRow, currRow] = [previousRow, currRow, twoRowsBack]
  }

  const maxLength = Math.max(lengthFirst, lengthSecond)
  const similarity = 1 - previousRow[n]! / maxLength

  return similarity
}
