-- CreateTable
CREATE TABLE "ApiCacheEntry" (
    "key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiCacheEntry_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "ApiCacheEntry_expiresAt_idx" ON "ApiCacheEntry"("expiresAt");
