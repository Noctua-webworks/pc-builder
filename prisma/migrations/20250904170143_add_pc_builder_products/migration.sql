-- CreateTable
CREATE TABLE "PcBuilderProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopifyProductId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "category" TEXT
);
