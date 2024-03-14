import { Effect, pipe } from 'effect'
import * as S from '@effect/schema/Schema'

import { getWordsCount, updateWordsCount } from '../repository/user'
import { countWords, getJustifiedTextString } from '../logic/justifyText'

const wordsLimitPerDay = Number(process.env.DAILY_WORD_LIMIT ?? '80000')

class MaxLimitReached extends S.TaggedError<MaxLimitReached>()('MaxLimitReached', {}) {}

const updateUserWordsCount = (email: string, nbrWordsToAdd: number, nbrActualWords: number) =>
  pipe(
    updateWordsCount(email, nbrActualWords + nbrWordsToAdd),
    Effect.tap(() =>
      console.info(
        `Updated words (+${nbrWordsToAdd}) from user [${email}]: ` +
          (nbrActualWords + nbrWordsToAdd) +
          `/80,000 at ${Date()}`
      )
    )
  )

export const textJustifyHandler = (email: string, textToJustify: string) =>
  Effect.Do.pipe(
    Effect.let('justifiedText', () => getJustifiedTextString(textToJustify)),
    Effect.bind('nbrWordsToAdd', ({ justifiedText }) => countWords(justifiedText)),
    Effect.bind('nbrActualWords', () => getWordsCount(email)),
    Effect.let('newWordsCount', ({ nbrWordsToAdd, nbrActualWords }) => nbrWordsToAdd + nbrActualWords),
    Effect.flatMap(({ newWordsCount, nbrWordsToAdd, nbrActualWords, justifiedText }) =>
      Effect.if({
        onTrue: new MaxLimitReached(),
        onFalse: pipe(
          updateUserWordsCount(email, nbrWordsToAdd, nbrActualWords),
          Effect.map(() => justifiedText.toString())
        ),
      })(newWordsCount > wordsLimitPerDay)
    )
  )
