/*
  Warnings:

  - The values [waiter,kitchen,cashier] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[user_id,establishment_id]` on the table `user_roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('admin_global', 'owner', 'user');
ALTER TABLE "user_roles" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropIndex
DROP INDEX "user_roles_user_id_establishment_id_role_key";

-- AlterTable
ALTER TABLE "user_roles" ADD COLUMN     "permissions" JSONB;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password" VARCHAR(255) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_establishment_id_key" ON "user_roles"("user_id", "establishment_id");
