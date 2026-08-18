// src/components/Loading.jsx
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
      <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">
        Fetching community offers...
      </p>
    </div>
  );
}