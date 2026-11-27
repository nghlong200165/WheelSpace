// Seeds the database with default settings, sample products and sample orders.
//
//   npm run db:seed            # creates collections/indexes, adds data only if empty
//   npm run db:seed -- --reset # wipes products + orders first (local databases only)

import { connectDb } from "@/server/db";
import { env } from "@/server/env";
import { Order } from "@/server/models/Order";
import { Product } from "@/server/models/Product";
import { SETTINGS_KEY, Settings } from "@/server/models/Settings";
import { User } from "@/server/models/User";
import { productInputSchema, type ProductInput } from "@/lib/schemas/product";
import { DEFAULT_SETTINGS } from "@/lib/schemas/settings";
import type { OrderStatus } from "@/lib/schemas/order";

type SampleProduct = Pick<ProductInput, "code" | "name" | "brand" | "price" | "rarity" | "condition" | "stock"> &
  Partial<ProductInput>;

// Sample data only: names are real models, codes and prices are placeholders.
const SAMPLE_PRODUCTS: SampleProduct[] = [
  { code: "MGT-DEMO-01", name: "Nissan Skyline GT-R (R34) V-Spec", brand: "Nissan", price: 350000, rarity: "chase", condition: "new", stock: 2, isNewArrival: true },
  { code: "MGT-DEMO-02", name: "Porsche 911 GT3 RS", brand: "Porsche", price: 290000, rarity: "normal", condition: "new", stock: 5, isNewArrival: true },
  { code: "MGT-DEMO-03", name: "Honda NSX-R", brand: "Honda", price: 260000, rarity: "normal", condition: "like_new", stock: 1, isNewArrival: true, conditionNote: "Hộp móp nhẹ góc trên, blister nguyên." },
  { code: "MGT-DEMO-04", name: "Toyota GR Supra", brand: "Toyota", price: 420000, rarity: "limited", condition: "new", stock: 1, isNewArrival: true },
  { code: "MGT-DEMO-05", name: "Lamborghini Countach LPI 800-4", brand: "Lamborghini", price: 230000, rarity: "normal", condition: "used", stock: 1, conditionNote: "Đã mở hộp, xe trưng bày, không trầy." },
  { code: "MGT-DEMO-06", name: "Mazda RX-7 (FD3S)", brand: "Mazda", price: 290000, rarity: "normal", condition: "new", stock: 0 },
  { code: "MGT-DEMO-07", name: "BMW M4 GT3", brand: "BMW", price: 450000, rarity: "limited", condition: "new", stock: 3 },
  { code: "MGT-DEMO-08", name: "Nissan GT-R Nismo", brand: "Nissan", price: 380000, rarity: "chase", condition: "like_new", stock: 0 },
  { code: "MGT-DEMO-09", name: "Toyota AE86 Sprinter Trueno", brand: "Toyota", price: 290000, rarity: "normal", condition: "new", stock: 4 },
  { code: "MGT-DEMO-10", name: "Mercedes-AMG GT3", brand: "Mercedes-AMG", price: 310000, rarity: "normal", condition: "new", stock: 2, isVisible: false },
];

function isLocalUri(uri: string): boolean {
  return /^mongodb:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(uri);
}

async function main() {
  const reset = process.argv.includes("--reset");
  const uri = env().MONGODB_URI;

  if (reset && !isLocalUri(uri)) {
    throw new Error("--reset is only allowed on a local database (localhost).");
  }

  const mongoose = await connectDb();
  console.log(`Connected to ${mongoose.connection.name}`);

  // Creates the collections and the indexes declared in the schemas.
  // syncIndexes also drops indexes that no longer match the schema.
  await Promise.all([Product.syncIndexes(), Order.syncIndexes(), Settings.syncIndexes(), User.syncIndexes()]);

  if (reset) {
    const [products, orders] = await Promise.all([Product.deleteMany({}), Order.deleteMany({})]);
    console.log(`Reset: removed ${products.deletedCount} products, ${orders.deletedCount} orders`);
  }

  const settings = await Settings.updateOne(
    { key: SETTINGS_KEY },
    { $setOnInsert: { key: SETTINGS_KEY, ...DEFAULT_SETTINGS } },
    { upsert: true },
  );
  console.log(settings.upsertedCount ? "Settings: created defaults" : "Settings: already exist, kept");

  const existing = await Product.countDocuments();
  if (existing > 0) {
    console.log(`Products: ${existing} already exist, skipped (use --reset to replace)`);
  } else {
    const docs = SAMPLE_PRODUCTS.map((p) => productInputSchema.parse(p));
    await Product.insertMany(docs);
    console.log(`Products: inserted ${docs.length} samples`);
  }

  await seedSampleOrders();
}

// Sample orders for trying the order lookup before checkout exists: one per status, all with the
// same phone. Added only when missing; real orders are never touched.
const SAMPLE_PHONE = "0901234567";
const SAMPLE_ORDERS: {
  code: string;
  items: [productCode: string, quantity: number][];
  paymentMethod: "cod" | "payos";
  paymentStatus: "unpaid" | "paid";
  // Hours ago each status was reached, in order; the last one is the current status.
  history: [status: OrderStatus, hoursAgo: number][];
}[] = [
  { code: "WS-DEMO-01", items: [["MGT-DEMO-01", 1]], paymentMethod: "cod", paymentStatus: "unpaid", history: [["pending", 2]] },
  {
    code: "WS-DEMO-02",
    items: [["MGT-DEMO-02", 1], ["MGT-DEMO-09", 1]],
    paymentMethod: "payos",
    paymentStatus: "paid",
    history: [["pending", 26], ["confirmed", 20]],
  },
  {
    code: "WS-DEMO-03",
    items: [["MGT-DEMO-07", 1]],
    paymentMethod: "cod",
    paymentStatus: "unpaid",
    history: [["pending", 72], ["confirmed", 60], ["shipping", 24]],
  },
  {
    code: "WS-DEMO-04",
    items: [["MGT-DEMO-04", 1]],
    paymentMethod: "payos",
    paymentStatus: "paid",
    history: [["pending", 144], ["confirmed", 140], ["shipping", 96], ["completed", 48]],
  },
  {
    code: "WS-DEMO-05",
    items: [["MGT-DEMO-09", 2]],
    paymentMethod: "cod",
    paymentStatus: "unpaid",
    history: [["pending", 96], ["confirmed", 91], ["cancelled", 84]],
  },
];

async function seedSampleOrders() {
  const shippingFee = DEFAULT_SETTINGS.shippingFee;
  let added = 0;
  for (const sample of SAMPLE_ORDERS) {
    if (await Order.exists({ code: sample.code })) continue;
    const products = await Product.find({ code: { $in: sample.items.map(([code]) => code) } }).lean();
    const items = sample.items.flatMap(([code, quantity]) => {
      const p = products.find((x) => x.code === code);
      return p ? [{ product: p._id, code: p.code, name: p.name, price: p.price, quantity, image: p.images?.[0] ?? null }] : [];
    });
    if (items.length === 0) continue;

    const at = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3_600_000);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = new Order({
      code: sample.code,
      customer: {
        name: "Khách Demo",
        phone: SAMPLE_PHONE,
        province: "TP. Hồ Chí Minh",
        ward: "Phường Bến Nghé",
        address: "12 Lê Lợi",
      },
      items,
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      paymentMethod: sample.paymentMethod,
      paymentStatus: sample.paymentStatus,
      status: sample.history.at(-1)![0],
      statusHistory: sample.history.map(([status, hoursAgo]) => ({ status, at: at(hoursAgo) })),
      createdAt: at(sample.history[0][1]),
      updatedAt: at(sample.history.at(-1)![1]),
    });
    // Keep the back-dated createdAt/updatedAt instead of "now".
    await order.save({ timestamps: false });
    added++;
  }
  console.log(
    added
      ? `Orders: added ${added} samples (codes WS-DEMO-01..05, phone ${SAMPLE_PHONE})`
      : "Orders: samples already exist, kept",
  );
}

main()
  .then(async () => {
    const mongoose = await connectDb();
    await mongoose.disconnect();
  })
  .catch(async (err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
    const mongoose = await connectDb().catch(() => null);
    await mongoose?.disconnect();
  });
