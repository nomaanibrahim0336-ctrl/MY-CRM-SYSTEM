import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: `file:${path.join(__dirname, "prisma/dev.db")}`,
    adapter: () => {
      const client = createClient({
        url: `file:${path.join(__dirname, "prisma/dev.db")}`,
      });
      return new PrismaLibSQL(client);
    },
  },
});
