interface AppSkeletonProps {
  overlay?: boolean;
  label?: string;
}

export default function AppSkeleton({
  overlay = false,
  label = 'Caricamento di BoardVerse',
}: AppSkeletonProps) {
  return (
    <main
      className={`bv-page ${overlay ? 'fixed inset-0 z-[9999] overflow-y-auto' : 'min-h-screen'}`}
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>

      <div aria-hidden="true">
        <div className="fixed inset-x-0 top-0 z-10 p-3 sm:p-5">
          <div className="bv-glass-strong mx-auto flex h-16 max-w-7xl items-center gap-3 rounded-[1.35rem] px-3">
            <div className="bv-skeleton-block h-10 w-10 rounded-xl" />
            <div className="bv-skeleton-block hidden h-4 w-28 rounded-full sm:block" />
            <div className="ml-auto hidden items-center gap-3 sm:flex">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bv-skeleton-block h-9 w-24 rounded-xl" />
              ))}
            </div>
            <div className="bv-skeleton-block ml-auto h-10 w-10 rounded-xl sm:ml-0" />
          </div>
        </div>

        <section className="bv-shell grid min-h-[78svh] items-center gap-10 pb-12 pt-28 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="bv-skeleton-block h-8 w-48 rounded-full" />
            <div className="mt-7 space-y-4">
              <div className="bv-skeleton-block h-16 w-[88%] max-w-xl rounded-2xl sm:h-20" />
              <div className="bv-skeleton-block h-16 w-[70%] max-w-md rounded-2xl sm:h-20" />
              <div className="bv-skeleton-block h-16 w-[82%] max-w-lg rounded-2xl sm:h-20" />
            </div>
            <div className="mt-8 space-y-3">
              <div className="bv-skeleton-block h-4 w-full max-w-xl rounded-full" />
              <div className="bv-skeleton-block h-4 w-[72%] max-w-md rounded-full" />
            </div>
            <div className="mt-8 flex gap-3">
              <div className="bv-skeleton-block h-12 w-44 rounded-2xl" />
              <div className="bv-skeleton-block h-12 w-36 rounded-2xl" />
            </div>
          </div>

          <div className="bv-glass mx-auto w-full max-w-[34rem] rounded-[2.5rem] p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="bv-skeleton-block h-3 w-24 rounded-full" />
                <div className="bv-skeleton-block h-6 w-36 rounded-lg" />
              </div>
              <div className="bv-skeleton-block h-8 w-20 rounded-full" />
            </div>
            <div className="bv-skeleton-block mx-auto mt-5 aspect-square w-[82%] rounded-[1.6rem]" />
            <div className="mt-4 flex justify-between gap-3">
              <div className="bv-skeleton-block h-12 w-36 rounded-2xl" />
              <div className="bv-skeleton-block h-12 w-12 rounded-2xl" />
            </div>
          </div>
        </section>

        <section className="bv-shell grid gap-4 pb-8 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bv-glass-soft rounded-[var(--bv-radius)] p-5">
              <div className="bv-skeleton-block h-12 w-12 rounded-2xl" />
              <div className="bv-skeleton-block mt-5 h-5 w-2/3 rounded-lg" />
              <div className="bv-skeleton-block mt-3 h-3 w-full rounded-full" />
              <div className="bv-skeleton-block mt-2 h-3 w-4/5 rounded-full" />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
