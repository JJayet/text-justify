import * as Rpc from '@effect/rpc/Rpc'
import * as S from '@effect/schema/Schema'
import { pipe } from 'effect/Function'

export const UserId = pipe(S.number, S.int(), S.brand('UserId'))
export type UserId = S.Schema.Type<typeof UserId>

export class User extends S.Class<User>('User')({
  id: UserId,
  name: S.string,
}) {}

const Email = S.string.pipe(S.pattern(/^(?!\.)(?!.*\.\.)([A-Z0-9_+-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i))
export const Token = S.string.pipe(S.brand('Token'))
export type Token = S.Schema.Type<typeof Token>

export class GetTokenError extends S.TaggedError<GetTokenError>()('GetTokenError', {
  reason: S.string,
}) {}

export const getTokenSchema = S.struct({
  email: Email,
})
