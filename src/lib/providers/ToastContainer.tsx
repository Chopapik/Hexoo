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
          background: "#171717",
          color: "#fff",
          border: "1px solid #404040",
          fontSize: "14px",
          zIndex: 999999,
        },
        success: {
          iconTheme: {
            primary: "#C026D3",
            secondary: "white",
          },
        },
        error: {
          iconTheme: {
            primary: "#EF4444",
            secondary: "white",
          },
        },
      }}
    />
  );
}
