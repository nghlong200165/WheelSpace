"use client";

import Link from "next/link";
import { startTransition, useActionState, type FormEvent } from "react";
import { registerAction } from "@/server/actions/account";
import { INITIAL_FORM_STATE } from "@/lib/form-state";
import { MIN_PASSWORD_LENGTH, type Identifier } from "@/lib/schemas/user";
import { FormMessage, TextField, buttonPrimary } from "@/components/ui/fields";

export function RegisterForm({ prefill, next }: { prefill: Identifier | null; next: string }) {
  const [state, formAction, pending] = useActionState(registerAction, INITIAL_FORM_STATE);
  const errors = state.fieldErrors ?? {};
  const alreadyRegistered = errors.phone?.includes("đã có tài khoản") || errors.email?.includes("đã có tài khoản");

  // Submit through a transition so React does not reset the form when validation fails.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />
      <TextField label="Họ và tên *" name="name" autoComplete="name" autoFocus error={errors.name} />
      <TextField
        label="Số điện thoại *"
        name="phone"
        type="tel"
        autoComplete="tel"
        defaultValue={prefill?.kind === "phone" ? prefill.value : ""}
        error={errors.phone}
        hint="Dùng để đăng nhập và liên hệ giao hàng."
      />
      <TextField
        label={prefill?.kind === "email" ? "Email *" : "Email (không bắt buộc)"}
        name="email"
        type="email"
        autoComplete="email"
        required={prefill?.kind === "email"}
        defaultValue={prefill?.kind === "email" ? prefill.value : ""}
        error={errors.email}
      />
      <TextField
        label="Mật khẩu *"
        name="password"
        type="password"
        autoComplete="new-password"
        error={errors.password}
        hint={`Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự.`}
      />
      <TextField label="Nhập lại mật khẩu *" name="confirmPassword" type="password" autoComplete="new-password" error={errors.confirmPassword} />

      <FormMessage message={state.message} />
      {alreadyRegistered && (
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-sm underline">
          Đến trang đăng nhập →
        </Link>
      )}

      <button type="submit" disabled={pending} className={`${buttonPrimary} min-h-13 tracking-[0.12em]`}>
        {pending ? "ĐANG TẠO TÀI KHOẢN…" : "ĐĂNG KÝ"}
      </button>
    </form>
  );
}
