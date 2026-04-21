"use client";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 text-slate-500">
      <AlertTriangle className="h-10 w-10 text-red-400" />
      <div className="text-center">
        <p className="font-semibold text-slate-800">Something went wrong</p>
        <p className="text-sm mt-1">{error.message || "An unexpected error occurred"}</p>
      </div>
      <button
        onClick={reset}
        className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
