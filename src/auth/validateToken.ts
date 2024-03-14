import { Effect, pipe } from 'effect'
import * as jose from 'jose'

import { getUserFromEmail } from '../repository/user'

export const validateToken = (token: string) =>
  pipe(
    Effect.succeed(new TextEncoder().encode(process.env.JWT_SECRET ?? '')),
    Effect.flatMap((secret) =>
      pipe(
        Effect.tryPromise(() => jose.jwtVerify<{ email: string }>(token, secret)),
        Effect.flatMap(({ payload }) => getUserFromEmail(payload.email)),
        Effect.map((user) => user.email)
      )
    )
  )
