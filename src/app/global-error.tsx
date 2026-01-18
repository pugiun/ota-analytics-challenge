"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="size-6 text-red-600" />
              </div>
              <h1 className="text-xl font-semibold">Something went wrong</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                A critical error occurred. Please try refreshing the page.
              </p>
            </div>
            <div className="mt-4 rounded-md bg-muted p-3">
              <p className="text-sm font-mono text-muted-foreground break-all">
                {error.message || "Unknown error"}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button
                type="button"
                onClick={() => window.location.href = "/"}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Go Home
              </button>
              <button
                type="button"
                onClick={reset}
                className="flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <RefreshCw className="mr-2 size-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
