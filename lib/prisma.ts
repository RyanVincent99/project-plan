// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// This is the updated part that fixes the error.
// It tells TypeScript that our NodeJS global object can have a prisma property.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma