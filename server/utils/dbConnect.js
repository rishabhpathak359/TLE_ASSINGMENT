import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
  prisma.$connect(); // Explicitly connect in production
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export const connectToDatabase = async () => {
  try {
    console.log("Connecting to the database...");
    await prisma.$connect();
    console.log("✅ Successfully connected to the database!");
  } catch (error) {
    console.error("❌ Error connecting to the database:", error.message);
    throw new Error("Unable to connect to the database");
  }
};

export default prisma;
