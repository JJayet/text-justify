import { PrismaClient, User } from '@prisma/client'
import { Context, Effect } from 'effect'
import { UnknownException } from 'effect/Cause'

interface UserRepository {
  createUser: (email: string, token: string) => Effect.Effect<User, UnknownException>
  getUserFromEmail: (email: string) => Effect.Effect<User, UnknownException>
  getWordsCount: (email: string) => Effect.Effect<number, UnknownException>
  updateWordsCount: (email: string, newWordsCount: number) => Effect.Effect<void, UnknownException>
  updateAllUserWordsCount: (newWordsCount: number) => Effect.Effect<void, UnknownException>
  getAllUsers: () => Effect.Effect<Omit<User, 'token'>[], UnknownException>
}

export const UserRepository = Context.GenericTag<UserRepository>('UserRepository')

const mockUser = {
  id: '0507f1b1-8a24-4a82-8a07-6c2444824855',
  email: 'test@email.com',
  token: 'test',
  wordsCount: 123,
}
export const mockUserRepository: UserRepository = {
  createUser: () => Effect.succeed(mockUser),
  getUserFromEmail: () => Effect.succeed(mockUser),
  getWordsCount: () => Effect.succeed(mockUser.wordsCount),
  updateWordsCount: () => Effect.unit,
  updateAllUserWordsCount: () => Effect.unit,
  getAllUsers: () => {
    const { token, ...mu } = mockUser
    return Effect.succeed([mu])
  },
}

export const dbUserRepository = (prisma: PrismaClient): UserRepository => ({
  createUser: (email, token) =>
    Effect.tryPromise(() =>
      prisma.user.create({
        data: {
          email,
          token,
        },
      })
    ),
  getUserFromEmail: (email) =>
    Effect.tryPromise(() =>
      prisma.user.findUnique({
        where: {
          email,
        },
      })
    ),
  getWordsCount: (email) =>
    Effect.tryPromise(() =>
      prisma.user
        .findUnique({
          select: {
            wordsCount: true,
          },
          where: {
            email,
          },
        })
        .then((_) => _?.wordsCount ?? 0)
    ),
  updateWordsCount: (email: string, newWordsCount: number) =>
    Effect.tryPromise(() =>
      prisma.user.update({
        where: {
          email,
        },
        data: {
          wordsCount: newWordsCount,
        },
      })
    ),
  updateAllUserWordsCount: (newWordsCount: number) =>
    Effect.tryPromise(() =>
      prisma.user.updateMany({
        data: {
          wordsCount: newWordsCount,
        },
      })
    ),
  getAllUsers: () =>
    Effect.tryPromise(() =>
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          wordsCount: true,
        },
      })
    ),
})

export const { createUser, getAllUsers, getUserFromEmail, getWordsCount, updateAllUserWordsCount, updateWordsCount } =
  Effect.serviceFunctions(UserRepository)
