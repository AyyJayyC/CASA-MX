export default function LoadingPropertyDetail() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="container max-w-7xl py-8 lg:py-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
            <div className="space-y-3 pt-4">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-4/6" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-40 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            <div className="h-12 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
