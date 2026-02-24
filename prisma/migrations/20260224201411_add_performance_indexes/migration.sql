-- AlterTable
ALTER TABLE "Village" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Category_type_idx" ON "Category"("type");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_userId_idx" ON "Listing"("userId");

-- CreateIndex
CREATE INDEX "Listing_categoryId_idx" ON "Listing"("categoryId");

-- CreateIndex
CREATE INDEX "Listing_isFeatured_promotionPriority_views_createdAt_idx" ON "Listing"("isFeatured", "promotionPriority", "views", "createdAt");

-- CreateIndex
CREATE INDEX "Listing_location_idx" ON "Listing"("location");

-- CreateIndex
CREATE INDEX "Listing_promotionStatus_idx" ON "Listing"("promotionStatus");

-- CreateIndex
CREATE INDEX "Listing_createdAt_idx" ON "Listing"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isVerified_idx" ON "User"("isVerified");

-- CreateIndex
CREATE INDEX "Village_district_idx" ON "Village"("district");

-- CreateIndex
CREATE INDEX "Village_isActive_order_name_idx" ON "Village"("isActive", "order", "name");
