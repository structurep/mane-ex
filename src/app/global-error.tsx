"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Inter, system-ui, sans-serif",
          backgroundColor: "#FAFAF8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "1rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              color: "#EDE9E0",
              margin: 0,
            }}
          >
            Error
          </p>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#1A1A1A",
              marginTop: "1rem",
            }}
          >
            Something went wrong
          </h1>
          <p style={{ color: "#6B7280", marginTop: "0.5rem" }}>
            A critical error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#1A1A1A",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
