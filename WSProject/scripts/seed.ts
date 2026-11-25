// Seeds the database with default settings and sample products.
//
//   npm run db:seed            # creates collections/indexes, adds data only if empty
//   npm run db:seed -- --reset # wipes products + orders first (local databases only)

import { connectDb } from "@/server/db";
import { env } from "@/server/env";
import { Order } from "@/server/models/Order";
import { Product } from "@/server/models/Product";
import { SETTINGS_KEY, Settings } from "@/server/models/Settings";
import { productInputSchema, type ProductInput } from "@/lib/schemas/product";
import { DEFAULT_SETTINGS } from "@/lib/schemas/settings";

type SampleProduct = Pick<ProductInput, "code" | "name" | "price" | "rarity" | "condition" | "stock"> &
  Partial<ProductInput>;

// Sample data only: names are real models, codes and prices are placeholders.
const SAMPLE_PRODUCTS: SampleProduct[] = [
  { code: "MGT-DEMO-01", name: "Nissan Skyline GT-R (R34) V-Spec", price: 350000, rarity: "chase", condition: "new", stock: 2, isNewArrival: true },
  { code: "MGT-DEMO-02", name: "Porsche 911 GT3 RS", price: 290000, rarity: "normal", condition: "new", stock: 5, isNewArrival: true },
  { code: "MGT-DEMO-03", name: "Honda NSX-R", price: 260000, rarity: "normal", condition: "like_new", stock: 1, isNewArrival: true, conditionNote: "Hộp móp nhẹ góc trên, blister nguyên." },
  { code: "MGT-DEMO-04", name: "Toyota GR Supra", price: 420000, rarity: "limited", condition: "new", stock: 1, isNewArrival: true },
  { code: "MGT-DEMO-05", name: "Lamborghini Countach LPI 800-4", price: 230000, rarity: "normal", condition: "used", stock: 1, conditionNote: "Đã mở hộp, xe trưng bày, không trầy." },
  { code: "MGT-DEMO-06", name: "Mazda RX-7 (FD3S)", price: 290000, rarity: "normal", condition: "new", stock: 0 },
  { code: "MGT-DEMO-07", name: "BMW M4 GT3", price: 450000, rarity: "limited", condition: "new", stock: 3 },
  { code: "MGT-DEMO-08", name: "Nissan GT-R Nismo", price: 380000, rarity: "chase", condition: "like_new", stock: 0 },
  { code: "MGT-DEMO-09", name: "Toyota AE86 Sprinter Trueno", price: 290000, rarity: "normal", condition: "new", stock: 4 },
  { code: "MGT-DEMO-10", name: "Mercedes-AMG GT3", price: 310000, rarity: "normal", condition: "new", stock: 2, isVisible: false },
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
  await Promise.all([Product.syncIndexes(), Order.syncIndexes(), Settings.syncIndexes()]);

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
