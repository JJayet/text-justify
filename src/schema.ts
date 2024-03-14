import * as S from '@effect/schema/Schema'

const Email = S.string.pipe(S.pattern(/^(?!\.)(?!.*\.\.)([A-Z0-9_+-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i))

export class GetTokenError extends S.TaggedError<GetTokenError>()('GetTokenError', {
  reason: S.string,
}) {}

export const getTokenSchema = S.struct({
  email: Email,
})
