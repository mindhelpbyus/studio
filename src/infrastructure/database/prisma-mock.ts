// Mock PrismaClient for development
export class PrismaClient {
  appointment = {
    findUnique: async (args: any) => null,
    findMany: async (args: any) => [],
    create: async (args: any) => args.data,
    update: async (args: any) => args.data,
    delete: async (args: any) => null,
    deleteMany: async (args: any) => ({ count: 0 })
  };
}