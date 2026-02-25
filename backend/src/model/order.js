const prisma = require("../config/prisma");

let khqrSchemaReady = false;

const ensureKhqrSchema = async () => {
  if (khqrSchemaReady) return;

  // Keep this aligned with prisma/migrations/20260225143000_init_khqr_tables/migration.sql
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      CREATE TYPE "PaymentMethod" AS ENUM ('khqr', 'credit_card');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Order"
      ADD COLUMN IF NOT EXISTS "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
      ADD COLUMN IF NOT EXISTS "payment_method" "PaymentMethod" NOT NULL DEFAULT 'credit_card',
      ADD COLUMN IF NOT EXISTS "transaction_id" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "paid_at" TEXT,
      ADD COLUMN IF NOT EXISTS "qr_code" TEXT,
      ADD COLUMN IF NOT EXISTS "qr_md5" VARCHAR(32),
      ADD COLUMN IF NOT EXISTS "qr_expiration" BIGINT,
      ADD COLUMN IF NOT EXISTS "bakongHash" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "from_account_id" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "to_account_id" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "description" TEXT,
      ADD COLUMN IF NOT EXISTS "paid" BOOLEAN NOT NULL DEFAULT false;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Order_qr_md5_key" ON "Order"("qr_md5");
  `);

  khqrSchemaReady = true;
};

const OrderModel = {
  async createKhqrOrder(data) {
    try {
      return await prisma.order.create({
        data,
      });
    } catch (error) {
      const missingColumn =
        error?.code === "P2022" ||
        String(error?.message || "").includes("does not exist in the current database");

      if (!missingColumn) throw error;

      await ensureKhqrSchema();

      return prisma.order.create({
        data,
      });
    }
  },

  async findByUserIdAndQrMd5(userId, qrMd5) {
    return prisma.order.findFirst({
      where: {
        userId: String(userId),
        qrMd5,
      },
    });
  },

  async updateById(id, data) {
    return prisma.order.update({
      where: { id: String(id) },
      data,
    });
  },
};

module.exports = OrderModel;
