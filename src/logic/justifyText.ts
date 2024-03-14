import { Effect } from 'effect'

const lineLenLimit = 80

export const countWords = (line: string) => Effect.succeed(line.split(/\s+/).length)

export const arrangeLinesByLength = (oldTable: string[]) => {
  const newTab: string[] = []

  for (const oldTableElem of oldTable) {
    const wordsTab: string[] = oldTableElem.split(' ')
    let newLine = ''
    let word = ''
    let countCharacters = 0
    for (let i = 0; i < wordsTab.length; i++) {
      word = wordsTab[i]
      countCharacters += word.length
      if (countCharacters > lineLenLimit) {
        newTab.push(newLine.substring(0, newLine.length - 1))
        newLine = ''
        countCharacters = word.length
      }
      if (i === wordsTab.length - 1) {
        newTab.push((newLine += word))
      }
      newLine += word + ' '
      countCharacters++
    }
  }
  return newTab
}

export const justifyLines = (lineTab: string[]) =>
  lineTab
    .map((line, index) => {
      let justifiedText = ''
      if (index !== 0) {
        justifiedText += '\n'
      }

      const wordsTab: string[] = line.split(/(\s+)/)
      const nbrWords = wordsTab.length
      let missingChar: number = lineLenLimit - line.length
      let i = 0

      while (missingChar > 0 && nbrWords > 1) {
        if (i === nbrWords - 1) {
          i = 0
        }
        wordsTab[i] += ' '
        missingChar--
        i += 2
      }
      const newLine: string = wordsTab.join('')
      justifiedText += newLine
      return justifiedText
    })
    .join('')

export const getJustifiedTextString = (text: string) => {
  if (text.length <= lineLenLimit) {
    return text
  }
  const lineSplitedTab = text.split('\n')
  return justifyLines(arrangeLinesByLength(lineSplitedTab))
}
