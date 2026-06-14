"use client";

import { Toaster } from "react-hot-toast";

export default function ToastContainer() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      containerStyle={{
        zIndex: 999999,
      }}
      toastOptions={{
        style: {
          background: "var(--color-surface-card-background-default)",
          color: "var(--color-foreground-primary-default)",
          border: "1px solid var(--color-surface-card-border-default)",
          fontSize: "14px",
          zIndex: 999999,
        },
        success: {
          iconTheme: {
            primary: "var(--color-accent-fuchsia-background-default)",
            secondary: "var(--color-foreground-primary-default)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--color-validation-error-icon)",
            secondary: "var(--color-foreground-primary-default)",
          },
        },
      }}
    />
  );
}
