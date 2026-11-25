"use client";

import { useActionState } from "react";
import { resetCustomerPasswordAction, type ResetPasswordState } from "@/server/actions/customers";

const INITIAL: ResetPasswordState = {};

export function ResetPasswordButton({ id, name }: { id: string; name: string }) {
  const [state, formAction, pending] = useActionState(resetCustomerPasswordAction, INITIAL);

  if (state.tempPassword) {
    return (
      <div className="flex flex-col items-end gap-1 text-right">
        <span className="text-xs text-muted">Mật khẩu tạm (chỉ hiện 1 lần):</span>
        <code className="bg-ground px-2 py-1 text-sm font-medium tracking-wider select-all">{state.tempPassword}</code>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`Đặt lại mật khẩu cho "${name}"?\nKhách sẽ bị đăng xuất khỏi mọi thiết bị và phải dùng mật khẩu tạm.`)) {
          e.preventDefault();
        }
      }}
      className="flex flex-col items-end gap-1"
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className="cursor-pointer text-[13px] underline disabled:opacity-50">
        {pending ? "Đang đặt lại…" : "Đặt lại mật khẩu"}
      </button>
      {state.message && <span className="text-xs text-accent">{state.message}</span>}
    </form>
  );
}
