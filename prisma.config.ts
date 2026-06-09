import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: `file:${path.join(__dirname, "prisma/dev.db")}`,
    adapter: () => {
      return new PrismaLibSql({
        url: `file:${path.join(__dirname, "prisma/dev.db")}`,
      });
    },
  } as any,
});
