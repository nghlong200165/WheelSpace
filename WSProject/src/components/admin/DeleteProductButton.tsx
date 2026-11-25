"use client";

import { deleteProductAction } from "@/server/actions/products";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteProductAction}
      onSubmit={(e) => {
        if (!confirm(`Xóa vĩnh viễn "${name}" và toàn bộ ảnh?\nNếu chỉ muốn tạm ngừng bán, hãy bỏ chọn "Hiện trên cửa hàng".`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="cursor-pointer text-[13px] text-accent underline">
        Xóa sản phẩm
      </button>
    </form>
  );
}
