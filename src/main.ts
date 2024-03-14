import { Effect, pipe } from 'effect'
import { Token, getTokenSchema } from './schema'
import { createUserAndGetToken } from './routes/token'
import { Api, RouterBuilder, ServerError } from 'effect-http'
import * as S from '@effect/schema/Schema'
import { textJustifyHandler } from './routes/justify'
import { NodeServer } from 'effect-http-node'
import { NodeRuntime } from '@effect/platform-node'
import { UserRepository, dbUserRepository } from './repository/user'
import { PrismaClient } from '@prisma/client'
import { validateToken } from './auth/validateToken'

const textPlainSchema = S.struct({ 'content-type': S.literal('text/plain') })

const api = Api.api({ title: 'Users API' }).pipe(
  Api.post('getToken', '/token', {
    response: Token,
    request: { body: getTokenSchema },
  }),
  Api.post(
    'justifyText',
    '/justify',
    {
      response: S.string,
      request: { body: S.string, headers: textPlainSchema },
    },
    {
      security: {
        jwtAuth: {
          type: 'http',
          options: {
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          schema: S.string,
        },
      },
    }
  )
)

const app = pipe(
  RouterBuilder.make(api),
  RouterBuilder.handle('getToken', ({ body: { email } }) => createUserAndGetToken(email)),
  RouterBuilder.handle('justifyText', ({ body }, security) =>
    pipe(
      validateToken(security.jwtAuth.token),
      Effect.flatMap((email) => textJustifyHandler(email, body)),
      Effect.catchTag('MaxLimitReached', () => ServerError.tooManyRequestsError('Max limit reached'))
    )
  ),
  RouterBuilder.build
)

app.pipe(
  NodeServer.listen({ port: 3000 }),
  Effect.provideService(UserRepository, dbUserRepository(new PrismaClient())),
  NodeRuntime.runMain
)
