-- CreateTable
CREATE TABLE "wedding_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "groomName" VARCHAR(150) NOT NULL,
    "groomNickname" VARCHAR(50) NOT NULL,
    "brideName" VARCHAR(150) NOT NULL,
    "brideNickname" VARCHAR(50) NOT NULL,
    "weddingDate" TIMESTAMP(3) NOT NULL,
    "venue" VARCHAR(200) NOT NULL,
    "city" VARCHAR(200) NOT NULL,
    "lineOaId" VARCHAR(100) NOT NULL,
    "lineOaUrl" VARCHAR(500) NOT NULL,
    "rsvpContactPhone" VARCHAR(30) NOT NULL,
    "mapsUrl" VARCHAR(500) NOT NULL,
    "rsvpDeadline" TIMESTAMP(3) NOT NULL,
    "promptpay" VARCHAR(30),
    "promptpayName" VARCHAR(150),
    "bankName" VARCHAR(100),
    "bankAccountNumber" VARCHAR(50),
    "bankAccountName" VARCHAR(150),
    "paymentQrUrl" VARCHAR(500),
    "timeline" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wedding_settings_pkey" PRIMARY KEY ("id")
);
