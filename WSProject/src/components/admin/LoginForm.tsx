"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/server/actions/auth";
import { INITIAL_FORM_STATE } from "@/lib/form-state";
import { FormMessage, TextField, buttonPrimary } from "@/components/ui/fields";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL_FORM_STATE);
  const next = useSearchParams().get("next") ?? "";

  // Submit through a transition so React does not clear the email after a failed attempt.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <input type="hidden" name="next" value={next} />
      <TextField label="Email" name="email" type="email" autoComplete="username" required error={state.fieldErrors?.email} />
      <TextField
        label="Mật khẩu"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      <FormMessage message={state.message} />
      <button type="submit" disabled={pending} className={`${buttonPrimary} min-h-13`}>
        {pending ? "ĐANG ĐĂNG NHẬP…" : "ĐĂNG NHẬP"}
      </button>
    </form>
  );
}
