export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-start pt-32 px-8 space-y-20">
      {/* High-Fidelity Hero Story Skeleton */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-10 flex flex-col items-start">
          {/* Badge Skeleton */}
          <div className="h-8 w-32 bg-[#000080]/20 animate-pulse rounded-full border border-[#000080]/10" />
          
          <div className="space-y-5 w-full">
            {/* Title Skeleton */}
            <div className="h-16 w-full max-w-lg bg-[#000080]/20 animate-pulse rounded-3xl" />
            <div className="h-16 w-3/4 bg-[#000080]/20 animate-pulse rounded-3xl" />
          </div>

          {/* Subtitle Skeleton */}
          <div className="space-y-4 w-full">
            <div className="h-5 w-full max-w-lg bg-[#000080]/20 animate-pulse rounded-lg" />
            <div className="h-5 w-full max-w-md bg-[#000080]/20 animate-pulse rounded-lg" />
            <div className="h-5 w-2/3 bg-[#000080]/20 animate-pulse rounded-lg" />
          </div>
        </div>

        {/* 3D Visual/Image Placeholder */}
        <div className="hidden lg:block h-[500px] w-full bg-[#000080]/5 animate-pulse rounded-[40px] border border-white/5" />
      </div>

      {/* Team Section Skeleton */}
      <div className="w-full max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="h-12 w-64 bg-[#000080]/20 animate-pulse rounded-2xl" />
          <div className="h-5 w-96 bg-[#000080]/20 animate-pulse rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col items-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-[#000080]/20 animate-pulse" />
              <div className="h-6 w-32 bg-[#000080]/20 animate-pulse rounded-lg" />
              <div className="h-4 w-24 bg-[#000080]/10 animate-pulse rounded-lg" />
              <div className="space-y-2 w-full flex flex-col items-center">
                <div className="h-3 w-4/5 bg-[#000080]/10 animate-pulse rounded-full" />
                <div className="h-3 w-2/3 bg-[#000080]/10 animate-pulse rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
