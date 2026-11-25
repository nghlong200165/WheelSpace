"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { changePasswordAction } from "@/server/actions/account";
import { INITIAL_FORM_STATE } from "@/lib/form-state";
import { MIN_PASSWORD_LENGTH } from "@/lib/schemas/user";
import { FormMessage, TextField, buttonPrimary } from "@/components/ui/fields";

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, formAction, pending] = useActionState(changePasswordAction, INITIAL_FORM_STATE);
  const errors = state.fieldErrors ?? {};

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      await formAction(formData);
      // Passwords never stay in the fields after a submit, whatever the outcome.
      form.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {hasPassword && (
        <TextField
          label="Mật khẩu hiện tại"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          error={errors.currentPassword}
        />
      )}
      <TextField
        label="Mật khẩu mới"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        error={errors.newPassword}
        hint={`Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự. Các thiết bị khác sẽ bị đăng xuất.`}
      />
      <TextField label="Nhập lại mật khẩu mới" name="confirmPassword" type="password" autoComplete="new-password" error={errors.confirmPassword} />
      <FormMessage ok={state.ok} message={state.message} />
      <button type="submit" disabled={pending} className={`${buttonPrimary} self-start`}>
        {pending ? "Đang lưu…" : hasPassword ? "Đổi mật khẩu" : "Đặt mật khẩu"}
      </button>
    </form>
  );
}
