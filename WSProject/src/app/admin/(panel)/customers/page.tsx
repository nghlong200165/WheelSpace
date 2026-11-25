import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordButton } from "@/components/admin/ResetPasswordButton";
import { buttonSecondary } from "@/components/ui/fields";
import { requireAdmin } from "@/server/auth/session";
import { listCustomersForAdmin } from "@/server/services/users";

export const metadata: Metadata = { title: "Khách hàng" };

const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

export default async function AdminCustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const customers = await listCustomersForAdmin(q);

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-normal">Khách hàng</h1>
        <span className="text-[13px] text-muted">
          Khách quên mật khẩu nhắn tin cho shop → bấm &quot;Đặt lại mật khẩu&quot; → gửi mật khẩu tạm cho khách qua Messenger.
        </span>
      </div>

      <form className="flex flex-wrap gap-3" role="search">
        <label htmlFor="q" className="sr-only">
          Tìm khách hàng
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Tìm theo tên, số điện thoại hoặc email"
          className="h-11 flex-[1_1_320px] border border-line bg-surface px-3.5 text-sm"
        />
        <button type="submit" className={buttonSecondary}>
          Tìm
        </button>
        {q && (
          <Link href="/admin/customers" className="self-center text-[13px] underline">
            Xóa tìm kiếm
          </Link>
        )}
      </form>

      <div className="overflow-x-auto bg-surface">
        <table className="w-full min-w-200 border-collapse text-sm">
          <thead>
            <tr className="text-left text-[11px] tracking-[0.14em] text-muted">
              <th scope="col" className="border-b border-line px-5 py-4 font-medium">KHÁCH HÀNG</th>
              <th scope="col" className="border-b border-line px-3 py-4 font-medium">ĐĂNG NHẬP BẰNG</th>
              <th scope="col" className="border-b border-line px-3 py-4 font-medium">NGÀY TẠO</th>
              <th scope="col" className="border-b border-line px-3 py-4 font-medium">LẦN CUỐI</th>
              <th scope="col" className="border-b border-line px-5 py-4">
                <span className="sr-only">Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="border-b border-line-soft px-5 py-3.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-muted">{[c.phone, c.email].filter(Boolean).join(" · ")}</span>
                  </div>
                </td>
                <td className="border-b border-line-soft px-3 py-3.5">
                  {[c.hasPassword && "Mật khẩu", c.hasGoogle && "Google"].filter(Boolean).join(", ") || "—"}
                  {c.locked && <span className="ml-2 text-xs text-accent">(đang tạm khóa)</span>}
                </td>
                <td className="border-b border-line-soft px-3 py-3.5">{dateFormat.format(new Date(c.createdAt))}</td>
                <td className="border-b border-line-soft px-3 py-3.5">{c.lastLoginAt ? dateFormat.format(new Date(c.lastLoginAt)) : "—"}</td>
                <td className="border-b border-line-soft px-5 py-3.5 text-right">
                  <ResetPasswordButton id={c.id} name={c.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted">{q ? "Không tìm thấy khách hàng phù hợp." : "Chưa có khách hàng nào."}</p>
        )}
      </div>
    </>
  );
}
