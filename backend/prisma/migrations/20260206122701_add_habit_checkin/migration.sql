-- CreateTable
CREATE TABLE "habit_check_ins" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'money_date',
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habit_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "habit_check_ins_userId_type_date_idx" ON "habit_check_ins"("userId", "type", "date");

-- CreateIndex
CREATE UNIQUE INDEX "habit_check_ins_userId_date_type_key" ON "habit_check_ins"("userId", "date", "type");

-- AddForeignKey
ALTER TABLE "habit_check_ins" ADD CONSTRAINT "habit_check_ins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
