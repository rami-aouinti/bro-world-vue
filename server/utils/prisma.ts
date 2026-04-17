import type { PrismaClient as PrismaClientType } from '@prisma/client'

let prismaPromise: Promise<PrismaClientType | null> | null = null

declare global {
  var __broWorldPrisma__: PrismaClientType | undefined
}

export async function getPrismaClient(): Promise<PrismaClientType | null> {
  if (globalThis.__broWorldPrisma__) {
    return globalThis.__broWorldPrisma__
  }

  if (!prismaPromise) {
    prismaPromise = (async () => {
      try {
        const prismaPkg = await import('@prisma/client')

        const prisma = new prismaPkg.PrismaClient({
          log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
        })

        if (process.env.NODE_ENV !== 'production') {
          globalThis.__broWorldPrisma__ = prisma
        }

        return prisma
      } catch {
        return null
      }
    })()
  }

  return prismaPromise
}
