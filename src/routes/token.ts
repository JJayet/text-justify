import { Effect, pipe } from 'effect'
import * as jose from 'jose'

import { GetTokenError, type Token } from '../schema'
import { createUser } from 'src/repository/user'

const getJwt = (email: string) =>
  pipe(
    Effect.succeed(new TextEncoder().encode(process.env.STUFF)),
    Effect.flatMap((secret) =>
      Effect.tryPromise({
        try: () =>
          new jose.SignJWT({ email })
            .setExpirationTime('8h')
            .setProtectedHeader({
              alg: 'HS256',
              typ: 'JWT',
            })
            .sign(secret),
        catch: () => new GetTokenError({ reason: 'error creating token' }),
      })
    ),
    Effect.map((jwt) => jwt as Token)
  )

export const createUserAndGetToken = (email: string) =>
  pipe(
    getJwt(email),
    Effect.tap((token) => createUser(email, token))
  )
