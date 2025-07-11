"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton(props: any) {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} type="submit">
      {pending ? "Submitting..." : props.title}
    </button>
  );
}
