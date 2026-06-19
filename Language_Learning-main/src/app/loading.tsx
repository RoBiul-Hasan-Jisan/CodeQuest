import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
