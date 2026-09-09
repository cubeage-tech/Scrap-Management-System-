import dotenv from "dotenv";
import prisma from "../src/core/lib/prisma.js";

dotenv.config();

const DEFAULT_CATEGORIES = [
  { name: "Steel" },
  { name: "Copper" },
  { name: "Aluminium" },
  { name: "Plastic" },
  { name: "Electronic Waste" },
  { name: "Rubber" },
  { name: "Paper" },
  { name: "Textile" },
  { name: "Ferrous" },
  { name: "Non-Ferrous" },
  { name: "Machinery" }
];

async function seedCategories() {
  console.log("Seeding standard scrap categories into database...");

  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { name: { equals: cat.name, mode: "insensitive" } }
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          isActive: true
        }
      });
      console.log(`  + Created category: ${cat.name}`);
    } else {
      console.log(`  . Category already exists: ${cat.name}`);
    }
  }

  console.log("Categories seeded successfully!");
}

seedCategories()
  .catch((err) => {
    console.error("Failed to seed categories:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

