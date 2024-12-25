-- CreateEnum
CREATE TYPE "RoleFastify" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "UserFastify" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "RoleFastify" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFastify_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostFastify" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostFastify_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserFastify_email_key" ON "UserFastify"("email");

-- AddForeignKey
ALTER TABLE "PostFastify" ADD CONSTRAINT "PostFastify_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserFastify"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
