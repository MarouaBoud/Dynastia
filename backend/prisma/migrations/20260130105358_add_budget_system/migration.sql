-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalIncome" DECIMAL(19,4) NOT NULL,
    "savingsPercent" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "billsPercent" DECIMAL(5,2) NOT NULL DEFAULT 50,
    "lifestylePercent" DECIMAL(5,2) NOT NULL DEFAULT 30,
    "savingsAmount" DECIMAL(19,4) NOT NULL,
    "billsAmount" DECIMAL(19,4) NOT NULL,
    "lifestyleAmount" DECIMAL(19,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incomes" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "budgetId" TEXT,
    "source" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "frequency" VARCHAR(50) NOT NULL DEFAULT 'monthly',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "frequency" VARCHAR(50) NOT NULL DEFAULT 'monthly',
    "dueDay" INTEGER NOT NULL,
    "nextDueDate" TIMESTAMP(3) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "isCreditCard" BOOLEAN NOT NULL DEFAULT false,
    "creditCardApr" DECIMAL(5,2),
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "lastPaidAt" TIMESTAMP(3),
    "consecutivePaidInFull" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sinking_funds" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "budgetId" TEXT,
    "name" VARCHAR(255) NOT NULL,
    "targetAmount" DECIMAL(19,4) NOT NULL,
    "currentAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sinking_funds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relatedId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "budgets_userId_year_month_idx" ON "budgets"("userId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_userId_month_year_key" ON "budgets"("userId", "month", "year");

-- CreateIndex
CREATE INDEX "incomes_userId_idx" ON "incomes"("userId");

-- CreateIndex
CREATE INDEX "bills_userId_nextDueDate_idx" ON "bills"("userId", "nextDueDate");

-- CreateIndex
CREATE INDEX "bills_userId_isCreditCard_idx" ON "bills"("userId", "isCreditCard");

-- CreateIndex
CREATE INDEX "sinking_funds_userId_isCompleted_idx" ON "sinking_funds"("userId", "isCompleted");

-- CreateIndex
CREATE INDEX "milestones_userId_type_idx" ON "milestones"("userId", "type");

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinking_funds" ADD CONSTRAINT "sinking_funds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinking_funds" ADD CONSTRAINT "sinking_funds_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
