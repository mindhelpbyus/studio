import { PrismaClient } from './prisma-mock';

let client: PrismaClient;

export function createClient(): PrismaClient {
  if (!client) {
    client = new PrismaClient();
  }
  return client;
}