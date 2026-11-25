import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

// Shared form controls for the admin, styled after the wireframe.

const control =
  "w-full border border-line bg-surface px-3.5 text-sm text-ink outline-none transition-colors focus:border-ink aria-invalid:border-accent";

type FieldProps = { label: string; name: string; error?: string; hint?: ReactNode };

function FieldShell({ label, name, error, hint, children }: FieldProps & { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-[13px]">
        {label}
      </label>
      {children}
      {error ? (
        <span id={`${name}-error`} className="text-xs text-accent">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-muted">{hint}</span>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  name,
  error,
  hint,
  ...props
}: FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "name">) {
  return (
    <FieldShell label={label} name={name} error={error} hint={hint}>
      <input
        id={name}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${control} h-11`}
        {...props}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  name,
  error,
  hint,
  ...props
}: FieldProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  return (
    <FieldShell label={label} name={name} error={error} hint={hint}>
      <textarea
        id={name}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${control} resize-y py-3`}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  name,
  error,
  hint,
  options,
  ...props
}: FieldProps & { options: { value: string; label: string }[] } & Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    "name"
  >) {
  return (
    <FieldShell label={label} name={name} error={error} hint={hint}>
      <select id={name} name={name} aria-invalid={!!error} className={`${control} h-11 px-3`} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
      {label}
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-5 accent-ink" />
    </label>
  );
}

export function FormMessage({ ok, message }: { ok?: boolean; message?: string }) {
  if (!message) return null;
  return (
    <p
      role={ok ? "status" : "alert"}
      className={`border px-4 py-3 text-sm ${ok ? "border-success text-success" : "border-accent text-accent"}`}
    >
      {message}
    </p>
  );
}

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 bg-surface p-7">
      <h2 className="text-xs font-medium tracking-eyebrow">{title}</h2>
      {children}
    </section>
  );
}

export const buttonPrimary =
  "inline-flex min-h-11 items-center justify-center bg-ink px-5 text-[13px] tracking-wider text-white transition-opacity hover:text-white disabled:opacity-50";
export const buttonSecondary =
  "inline-flex min-h-11 items-center justify-center border border-line bg-surface px-5 text-[13px] text-ink hover:border-ink hover:text-ink";
