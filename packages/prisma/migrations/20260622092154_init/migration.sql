-- CreateTable
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "attending" BOOLEAN NOT NULL,
    "lineUserId" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishes" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "guests_attending_idx" ON "guests"("attending");

-- CreateIndex
CREATE INDEX "guests_createdAt_idx" ON "guests"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "wishes_guestId_key" ON "wishes"("guestId");

-- CreateIndex
CREATE INDEX "wishes_createdAt_idx" ON "wishes"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- AddForeignKey
ALTER TABLE "wishes" ADD CONSTRAINT "wishes_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
