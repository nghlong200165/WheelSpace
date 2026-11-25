import "server-only";
import { isValidObjectId, mongo, type Types } from "mongoose";
import { connectDb } from "../db";
import { Product, type ProductDoc } from "../models/Product";
import { storage } from "../integrations/storage";
import { ServiceError } from "./errors";
import {
  MAX_PRODUCT_IMAGES,
  type Condition,
  type ProductDTO,
  type ProductInput,
  type Rarity,
} from "@/lib/schemas/product";
import type { CatalogFilter } from "@/lib/schemas/catalog";

type LeanProduct = ProductDoc & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

function toDTO(doc: LeanProduct): ProductDTO {
  return {
    id: doc._id.toString(),
    code: doc.code,
    name: doc.name,
    brand: doc.brand ?? "",
    price: doc.price,
    rarity: doc.rarity as Rarity,
    condition: doc.condition as Condition,
    stock: doc.stock,
    conditionNote: doc.conditionNote ?? "",
    description: doc.description ?? "",
    images: [...(doc.images ?? [])],
    isVisible: doc.isVisible ?? true,
    isNewArrival: doc.isNewArrival ?? false,
    isFeatured: doc.isFeatured ?? false,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Reuse the spelling of an existing brand ("porsche" -> "Porsche") so the filter has no near-duplicates.
async function canonicalBrand(brand: string): Promise<string> {
  const existing = await Product.findOne({ brand: new RegExp(`^${escapeRegex(brand)}$`, "i") }, { brand: 1 }).lean<LeanProduct>();
  return existing?.brand || brand;
}

function isDuplicateKeyError(err: unknown): boolean {
  return err instanceof mongo.MongoServerError && err.code === 11000;
}

async function uploadAll(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  try {
    for (const file of files) urls.push(await storage().saveImage(file, "products"));
    return urls;
  } catch (err) {
    await deleteImages(urls);
    throw err;
  }
}

function deleteImages(urls: string[]): Promise<void> {
  return storage().deleteImages(urls);
}

export type AdminProductFilter = { q?: string; rarity?: Rarity; condition?: Condition };

export async function listProductsForAdmin(filter: AdminProductFilter = {}): Promise<ProductDTO[]> {
  await connectDb();
  const query: Record<string, unknown> = {};
  if (filter.q) {
    const pattern = new RegExp(escapeRegex(filter.q), "i");
    query.$or = [{ name: pattern }, { code: pattern }];
  }
  if (filter.rarity) query.rarity = filter.rarity;
  if (filter.condition) query.condition = filter.condition;

  const docs = await Product.find(query).sort({ createdAt: -1 }).lean<LeanProduct[]>();
  return docs.map(toDTO);
}

// Storefront: products flagged "Mới về"; falls back to the latest visible products if none are flagged.
export async function listNewArrivals(limit: number): Promise<ProductDTO[]> {
  await connectDb();
  let docs = await Product.find({ isVisible: true, isNewArrival: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<LeanProduct[]>();
  if (docs.length === 0) {
    docs = await Product.find({ isVisible: true }).sort({ createdAt: -1 }).limit(limit).lean<LeanProduct[]>();
  }
  return docs.map(toDTO);
}

// Storefront hero slider: products ticked "Hiện trên banner"; falls back to new arrivals.
// Only visible products that have at least one image.
export async function listBannerProducts(limit: number): Promise<ProductDTO[]> {
  await connectDb();
  const withImage = { isVisible: true, "images.0": { $exists: true } };
  let docs = await Product.find({ ...withImage, isFeatured: true })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean<LeanProduct[]>();
  if (docs.length === 0) {
    docs = await Product.find({ ...withImage, isNewArrival: true }).sort({ createdAt: -1 }).limit(limit).lean<LeanProduct[]>();
  }
  return docs.map(toDTO);
}

// Storefront: visible Chase / Limited products, in stock first.
export async function listRareProducts(limit: number): Promise<ProductDTO[]> {
  await connectDb();
  const docs = await Product.find({ isVisible: true, rarity: { $in: ["chase", "limited"] } })
    .sort({ stock: -1, createdAt: -1 })
    .limit(limit)
    .lean<LeanProduct[]>();
  return docs.map(toDTO);
}

// Storefront product list: visible products only, filtered / sorted / paginated.
export async function listProductsForStore(
  filter: CatalogFilter,
  pageSize: number,
): Promise<{ items: ProductDTO[]; total: number; page: number; pageCount: number }> {
  await connectDb();
  const query: Record<string, unknown> = { isVisible: true };
  if (filter.q) {
    const pattern = new RegExp(escapeRegex(filter.q), "i");
    query.$or = [{ name: pattern }, { code: pattern }];
  }
  if (filter.rarities.length) query.rarity = { $in: filter.rarities };
  if (filter.brand) query.brand = filter.brand;
  if (filter.conditions.length) query.condition = { $in: filter.conditions };
  // Both or neither stock boxes ticked = no stock filter.
  if (filter.stock.length === 1) query.stock = filter.stock[0] === "in" ? { $gt: 0 } : 0;

  const sort: Record<string, 1 | -1> =
    filter.sort === "price_asc"
      ? { price: 1, _id: 1 }
      : filter.sort === "price_desc"
        ? { price: -1, _id: -1 }
        : { createdAt: -1, _id: -1 };

  const total = await Product.countDocuments(query);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(filter.page, pageCount);
  const docs = await Product.find(query)
    .sort(sort)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean<LeanProduct[]>();
  return { items: docs.map(toDTO), total, page, pageCount };
}

// Brands for the storefront filter (visible products only) or the admin form suggestions (all).
export async function listBrands({ visibleOnly }: { visibleOnly: boolean }): Promise<string[]> {
  await connectDb();
  const brands: string[] = await Product.distinct("brand", visibleOnly ? { isVisible: true } : {});
  return brands.filter(Boolean).sort((a, b) => a.localeCompare(b, "vi"));
}

// Storefront: visible products for the given ids, in the same order (e.g. a wishlist).
export async function listVisibleProductsByIds(ids: string[]): Promise<ProductDTO[]> {
  const valid = ids.filter((id) => isValidObjectId(id));
  if (valid.length === 0) return [];
  await connectDb();
  const docs = await Product.find({ _id: { $in: valid }, isVisible: true }).lean<LeanProduct[]>();
  const byId = new Map(docs.map((d) => [d._id.toString(), d]));
  return valid.flatMap((id) => {
    const doc = byId.get(id);
    return doc ? [toDTO(doc)] : [];
  });
}

export async function getProductStats(): Promise<{ total: number; outOfStock: number; hidden: number }> {
  await connectDb();
  const [total, outOfStock, hidden] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ stock: 0 }),
    Product.countDocuments({ isVisible: false }),
  ]);
  return { total, outOfStock, hidden };
}

export async function getProductById(id: string): Promise<ProductDTO | null> {
  if (!isValidObjectId(id)) return null;
  await connectDb();
  const doc = await Product.findById(id).lean<LeanProduct>();
  return doc ? toDTO(doc) : null;
}

// input.images is ignored on create: a new product only has the uploaded files.
export async function createProduct(input: ProductInput, newImages: File[]): Promise<ProductDTO> {
  if (newImages.length > MAX_PRODUCT_IMAGES) {
    throw new ServiceError(`Tối đa ${MAX_PRODUCT_IMAGES} ảnh`, "images");
  }
  await connectDb();
  const uploaded = await uploadAll(newImages);
  try {
    const doc = await Product.create({ ...input, brand: await canonicalBrand(input.brand), images: uploaded });
    return toDTO(doc.toObject() as LeanProduct);
  } catch (err) {
    await deleteImages(uploaded);
    if (isDuplicateKeyError(err)) throw new ServiceError("Mã sản phẩm đã tồn tại", "code");
    throw err;
  }
}

// input.images = existing images to keep, in display order (first = cover). New files are appended.
export async function updateProduct(id: string, input: ProductInput, newImages: File[]): Promise<ProductDTO> {
  if (!isValidObjectId(id)) throw new ServiceError("Không tìm thấy sản phẩm");
  await connectDb();
  const existing = await Product.findById(id).lean<LeanProduct>();
  if (!existing) throw new ServiceError("Không tìm thấy sản phẩm");

  // Only keep images that really belong to this product.
  const kept = input.images.filter((url) => existing.images.includes(url));
  if (kept.length + newImages.length > MAX_PRODUCT_IMAGES) {
    throw new ServiceError(`Tối đa ${MAX_PRODUCT_IMAGES} ảnh`, "images");
  }

  const uploaded = await uploadAll(newImages);
  try {
    const doc = await Product.findByIdAndUpdate(
      id,
      { ...input, brand: await canonicalBrand(input.brand), images: [...kept, ...uploaded] },
      { returnDocument: "after", runValidators: true },
    ).lean<LeanProduct>();
    if (!doc) throw new ServiceError("Không tìm thấy sản phẩm");
    await deleteImages(existing.images.filter((url) => !kept.includes(url)));
    return toDTO(doc);
  } catch (err) {
    await deleteImages(uploaded);
    if (isDuplicateKeyError(err)) throw new ServiceError("Mã sản phẩm đã tồn tại", "code");
    throw err;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isValidObjectId(id)) throw new ServiceError("Không tìm thấy sản phẩm");
  await connectDb();
  const doc = await Product.findByIdAndDelete(id).lean<LeanProduct>();
  if (!doc) throw new ServiceError("Không tìm thấy sản phẩm");
  await deleteImages(doc.images);
}
