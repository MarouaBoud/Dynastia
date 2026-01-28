-- AlterTable
ALTER TABLE "users" ADD COLUMN     "country" VARCHAR(2) DEFAULT 'US',
ADD COLUMN     "currency" VARCHAR(3) DEFAULT 'USD';
