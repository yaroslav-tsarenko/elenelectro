"use client";

import { Toaster } from "sonner";
import { useTheme } from "./ThemeProvider";

export function ToastProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      richColors
      closeButton
      duration={3000}
    />
  );
}
