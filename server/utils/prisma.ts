import type { PrismaClient as PrismaClientType } from '@prisma/client'
import prismaPkg from '@prisma/client'

const { PrismaClient } = prismaPkg

declare global {
  // eslint-disable-next-line no-var
  var __broWorldPrisma__: PrismaClientType | undefined
}

export const prisma =
  globalThis.__broWorldPrisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__broWorldPrisma__ = prisma
}
