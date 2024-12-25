-- DropForeignKey
ALTER TABLE "PostFastify" DROP CONSTRAINT "PostFastify_userId_fkey";

-- AddForeignKey
ALTER TABLE "PostFastify" ADD CONSTRAINT "PostFastify_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserFastify"("id") ON DELETE CASCADE ON UPDATE CASCADE;
