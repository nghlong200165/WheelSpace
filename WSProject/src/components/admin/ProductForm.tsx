"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { saveProductAction } from "@/server/actions/products";
import { BRANDS } from "@/lib/brands";
import { INITIAL_FORM_STATE } from "@/lib/form-state";
import {
  CONDITIONS,
  CONDITION_LABELS,
  MAX_PRODUCT_IMAGES,
  RARITIES,
  RARITY_LABELS,
  type ProductDTO,
} from "@/lib/schemas/product";
import {
  CheckboxField,
  FormMessage,
  Panel,
  SelectField,
  TextAreaField,
  TextField,
  buttonPrimary,
  buttonSecondary,
} from "@/components/ui/fields";

const MAX_IMAGE_MB = 8;

const BRAND_OPTIONS = [{ value: "", label: "Chọn hãng xe" }, ...BRANDS.map((b) => ({ value: b, label: b }))];

export function ProductForm({ product }: { product?: ProductDTO }) {
  const [state, formAction, pending] = useActionState(saveProductAction, INITIAL_FORM_STATE);
  const errors = state.fieldErrors ?? {};

  // Existing images kept on the product, in display order (first = cover).
  const [kept, setKept] = useState<string[]>(product?.images ?? []);
  // Newly picked files, mirrored into the file input so they are submitted with the form.
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const previews = useMemo(() => newFiles.map((file) => URL.createObjectURL(file)), [newFiles]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const remaining = MAX_PRODUCT_IMAGES - kept.length;

  function syncFiles(files: File[]) {
    setNewFiles(files);
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    if (fileInput.current) fileInput.current.files = transfer.files;
  }

  function addFiles(picked: FileList | null) {
    syncFiles([...newFiles, ...Array.from(picked ?? [])].slice(0, Math.max(remaining, 0)));
  }

  function makeCover(url: string) {
    setKept((list) => [url, ...list.filter((u) => u !== url)]);
  }

  // Submit through a transition so React does not reset the form when validation fails.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="keepImages" value={JSON.stringify(kept)} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <Link href="/admin/products" className="text-[13px] text-muted">
            ← Sản phẩm
          </Link>
          <h1 className="text-[28px] font-normal">{product ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products" className={buttonSecondary}>
            Hủy
          </Link>
          <button type="submit" disabled={pending} className={buttonPrimary}>
            {pending ? "Đang lưu…" : "Lưu sản phẩm"}
          </button>
        </div>
      </div>

      <FormMessage ok={state.ok} message={state.message} />

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-6">
          <Panel title="THÔNG TIN">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
              <TextField label="Mã sản phẩm *" name="code" defaultValue={product?.code} placeholder="MGT00XXX" error={errors.code} />
              <TextField
                label="Giá (₫) *"
                name="price"
                inputMode="numeric"
                defaultValue={product?.price}
                placeholder="350000"
                error={errors.price}
              />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[2fr_1fr]">
              <TextField label="Tên sản phẩm *" name="name" defaultValue={product?.name} error={errors.name} />
              <SelectField
                label="Hãng xe *"
                name="brand"
                defaultValue={product?.brand ?? ""}
                options={BRAND_OPTIONS}
                error={errors.brand}
                hint="Thiếu hãng? Thêm vào src/lib/brands.ts"
              />
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-5">
              <SelectField
                label="Độ hiếm"
                name="rarity"
                defaultValue={product?.rarity ?? "normal"}
                options={RARITIES.map((r) => ({ value: r, label: RARITY_LABELS[r] }))}
                error={errors.rarity}
              />
              <SelectField
                label="Tình trạng"
                name="condition"
                defaultValue={product?.condition ?? "new"}
                options={CONDITIONS.map((c) => ({ value: c, label: CONDITION_LABELS[c] }))}
                error={errors.condition}
              />
              <TextField
                label="Số lượng tồn *"
                name="stock"
                type="number"
                min={0}
                defaultValue={product?.stock ?? 1}
                error={errors.stock}
              />
            </div>
            <TextAreaField
              label="Ghi chú tình trạng"
              name="conditionNote"
              rows={3}
              defaultValue={product?.conditionNote}
              placeholder="Ví dụ: hộp móp nhẹ góc trái, blister nguyên"
              error={errors.conditionNote}
            />
            <TextAreaField label="Mô tả" name="description" rows={4} defaultValue={product?.description} error={errors.description} />
          </Panel>

          <Panel title="ẢNH SẢN PHẨM">
            <label
              htmlFor="newImages"
              className={`flex flex-col items-center gap-2.5 border border-dashed border-[#b9b5ac] px-6 py-10 text-center ${
                remaining - newFiles.length > 0 ? "cursor-pointer hover:border-ink" : "pointer-events-none opacity-50"
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 16V4" />
                <path d="m7 9 5-5 5 5" />
                <path d="M4 16v4h16v-4" />
              </svg>
              <span className="text-sm">Bấm để chọn ảnh (chọn được nhiều ảnh)</span>
              <span className="text-xs text-muted">
                JPG, PNG, WEBP · tối đa {MAX_IMAGE_MB}MB/ảnh · tối đa {MAX_PRODUCT_IMAGES} ảnh · ảnh đầu tiên là ảnh đại diện
              </span>
            </label>
            <input
              ref={fileInput}
              id="newImages"
              name="newImages"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => addFiles(e.target.files)}
            />
            {errors.images && <span className="text-xs text-accent">{errors.images}</span>}

            {(kept.length > 0 || newFiles.length > 0) && (
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">
                {kept.map((url, i) => (
                  <li key={url} className="flex flex-col gap-2">
                    <div className="relative aspect-square bg-placeholder">
                      <Image src={url} alt={`Ảnh ${i + 1}`} fill sizes="160px" className="object-cover" />
                      {i === 0 && <CoverBadge />}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      {i > 0 && (
                        <button type="button" onClick={() => makeCover(url)} className="cursor-pointer underline">
                          Làm ảnh đại diện
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setKept((list) => list.filter((u) => u !== url))}
                        className="cursor-pointer text-accent underline"
                      >
                        Xóa
                      </button>
                    </div>
                  </li>
                ))}
                {newFiles.map((file, i) => (
                  <li key={previews[i]} className="flex flex-col gap-2">
                    <div className="relative aspect-square bg-placeholder">
                      {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not optimizable */}
                      <img src={previews[i]} alt={file.name} className="size-full object-cover" />
                      {kept.length === 0 && i === 0 && <CoverBadge />}
                      <span className="absolute top-2 right-2 bg-surface px-2 py-0.5 text-[10px] tracking-wider">MỚI</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => syncFiles(newFiles.filter((_, j) => j !== i))}
                      className="cursor-pointer self-start text-xs text-accent underline"
                    >
                      Bỏ chọn
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <aside className="flex w-full flex-col gap-4 bg-surface p-7 md:max-w-80 md:flex-[1_1_260px]">
          <h2 className="text-xs font-medium tracking-eyebrow">HIỂN THỊ</h2>
          <CheckboxField label="Hiện trên cửa hàng" name="isVisible" defaultChecked={product?.isVisible ?? true} />
          <CheckboxField label='Hiện ở mục "Mới về"' name="isNewArrival" defaultChecked={product?.isNewArrival ?? false} />
          <CheckboxField label="Hiện trên banner trang chủ" name="isFeatured" defaultChecked={product?.isFeatured ?? false} />
          <p className="text-xs leading-relaxed text-muted">
            Banner dùng ảnh đại diện (ảnh đầu tiên) và chỉ hiện khi sản phẩm có ảnh. Chưa tick mẫu nào thì banner tự lấy các mẫu
            &quot;Mới về&quot;.
          </p>
          <p className="text-xs leading-relaxed text-muted">
            Khi tồn kho về 0, trang sản phẩm tự đổi nút &quot;Mua&quot; thành &quot;Nhắn tin để order&quot;.
          </p>
        </aside>
      </div>
    </form>
  );
}

function CoverBadge() {
  return (
    <span className="absolute bottom-2 left-2 bg-ink px-2 py-0.5 text-[10px] tracking-wider text-white">ĐẠI DIỆN</span>
  );
}
