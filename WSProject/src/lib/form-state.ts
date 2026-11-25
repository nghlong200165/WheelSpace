// Result returned by Server Actions to forms using useActionState.
export type FormState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const INITIAL_FORM_STATE: FormState = {};
