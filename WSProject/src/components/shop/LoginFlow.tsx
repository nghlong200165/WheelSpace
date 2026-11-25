"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, type FormEvent } from "react";
import { loginStepAction, type LoginState } from "@/server/actions/account";
import { FormMessage, TextField, buttonPrimary } from "@/components/ui/fields";

const INITIAL: LoginState = { step: "identifier" };

// Two steps on one form: identifier first, then password (or a hint to use Google).
// Remounting with a new key ("Đổi") resets the action state back to step 1.
export function LoginFlow({ next, messengerUrl }: { next: string; messengerUrl: string }) {
  const [attempt, setAttempt] = useState(0);
  const [lastIdentifier, setLastIdentifier] = useState("");
  return (
    <LoginSteps
      key={attempt}
      next={next}
      messengerUrl={messengerUrl}
      defaultIdentifier={lastIdentifier}
      onChangeIdentifier={(value) => {
        setLastIdentifier(value);
        setAttempt((n) => n + 1);
      }}
    />
  );
}

function LoginSteps({
  next,
  messengerUrl,
  defaultIdentifier,
  onChangeIdentifier,
}: {
  next: string;
  messengerUrl: string;
  defaultIdentifier: string;
  onChangeIdentifier: (value: string) => void;
}) {
  const [state, formAction, pending] = useActionState(loginStepAction, INITIAL);
  const errors = state.fieldErrors ?? {};
  const onIdentifierStep = state.step === "identifier";

  // Submit through a transition so React does not reset the form after a failed attempt.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />

      {onIdentifierStep ? (
        <TextField
          label="Số điện thoại hoặc email"
          name="identifier"
          autoComplete="username"
          inputMode="email"
          autoFocus
          defaultValue={state.identifier ?? defaultIdentifier}
          error={errors.identifier}
        />
      ) : (
        <div className="flex items-center justify-between gap-3 border border-line bg-surface px-4 py-3">
          <input type="hidden" name="identifier" value={state.identifier} />
          <div className="flex min-w-0 flex-col">
            <span className="text-xs text-muted">Đăng nhập với</span>
            <span className="truncate text-sm font-medium">{state.identifier}</span>
          </div>
          <button
            type="button"
            onClick={() => onChangeIdentifier(state.identifier ?? "")}
            className="cursor-pointer text-[13px] underline"
          >
            Đổi
          </button>
        </div>
      )}

      {state.step === "password" && (
        <>
          <TextField
            label="Mật khẩu"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            error={errors.password}
          />
          {/* Username hint for password managers. */}
          <input type="text" autoComplete="username" value={state.identifier} readOnly hidden />
        </>
      )}

      {state.step === "google-only" && (
        <p className="border border-line bg-surface px-4 py-3 text-sm leading-relaxed">
          Tài khoản này đang đăng nhập bằng Google. Hãy bấm <strong className="font-medium">Tiếp tục với Google</strong> bên
          dưới, rồi đặt mật khẩu trong trang Tài khoản nếu muốn đăng nhập bằng mật khẩu.
        </p>
      )}

      {!errors.password && !errors.identifier && <FormMessage message={state.message} />}

      {state.step !== "google-only" && (
        <button type="submit" disabled={pending} className={`${buttonPrimary} min-h-13 tracking-[0.12em]`}>
          {pending ? "ĐANG XỬ LÝ…" : onIdentifierStep ? "TIẾP TỤC" : "ĐĂNG NHẬP"}
        </button>
      )}

      {state.step === "password" && (
        <p className="text-[13px] text-muted">
          Quên mật khẩu?{" "}
          {messengerUrl ? (
            <a href={messengerUrl} target="_blank" rel="noopener noreferrer" className="underline">
              Nhắn tin cho shop
            </a>
          ) : (
            "Liên hệ shop"
          )}{" "}
          để được đặt lại.
        </p>
      )}

      {onIdentifierStep && (
        <p className="text-[13px] text-muted">
          Chưa có tài khoản?{" "}
          <Link href={`/register?next=${encodeURIComponent(next)}`} className="underline">
            Đăng ký
          </Link>
        </p>
      )}
    </form>
  );
}
