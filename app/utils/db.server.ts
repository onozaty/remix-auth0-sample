import { remember } from "@epic-web/remember";
import { PrismaClient } from "@prisma/client";

export const prisma = await remember("prisma", async () => {
  const client = new PrismaClient();
  await client.$connect();
  return client;
});
