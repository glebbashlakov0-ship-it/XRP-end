-- CreateTable
CREATE TABLE "InfoRequest" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InfoRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InfoRequest_email_idx" ON "InfoRequest"("email");

-- CreateIndex
CREATE INDEX "InfoRequest_createdAt_idx" ON "InfoRequest"("createdAt");
