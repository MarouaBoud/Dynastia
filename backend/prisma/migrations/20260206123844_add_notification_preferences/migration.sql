-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "moneyDateReminder" BOOLEAN NOT NULL DEFAULT true,
    "streakProtection" BOOLEAN NOT NULL DEFAULT true,
    "billReminders" BOOLEAN NOT NULL DEFAULT true,
    "milestoneAlerts" BOOLEAN NOT NULL DEFAULT true,
    "reminderDay" INTEGER NOT NULL DEFAULT 0,
    "reminderHour" INTEGER NOT NULL DEFAULT 10,
    "marketingUpdates" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
