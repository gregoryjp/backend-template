-- CreateEnum
CREATE TYPE "LegalConsentType" AS ENUM ('TERMS', 'PRIVACY', 'MARKETING');

-- CreateTable
CREATE TABLE "legal_consents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "LegalConsentType" NOT NULL,
    "version" TEXT NOT NULL,
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "legal_consents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "legal_consents_user_id_idx" ON "legal_consents"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "legal_consents_user_id_type_version_key" ON "legal_consents"("user_id", "type", "version");

-- AddForeignKey
ALTER TABLE "legal_consents" ADD CONSTRAINT "legal_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
