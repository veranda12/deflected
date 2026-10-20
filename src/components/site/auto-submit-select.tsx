"use client";

import type { ComponentProps } from "react";

/** Native select that submits its form on change. Without JS the form's submit button still works. */
export function AutoSubmitSelect(props: ComponentProps<"select">) {
  return <select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />;
}
