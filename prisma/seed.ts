import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  await prisma.post.update({
    where: { slug: "library-that-burned-too-bright" },
    data: {
      category: "history",
    }
  });
  await prisma.post.update({
    where: { slug: "books-that-change-how-you-think" },
    data: {
      category: "literature",
    },
  });
}

main()
  .then(() => {
    console.log("Seeding done 🌱");
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
