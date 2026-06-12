export default function PricingLoading() {
  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-start pt-32 px-8 space-y-20">
      {/* High-Fidelity Countdown and Hero Card Skeleton */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center space-y-12 animate-pulse">
        {/* Countdown Clocks Skeleton */}
        <div className="flex gap-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white/5 border border-white/10 rounded-2xl" />
              <div className="h-3 w-10 bg-white/10 rounded-full mt-3" />
            </div>
          ))}
        </div>

        {/* Offer Details Box Skeleton */}
        <div className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-5 flex flex-col items-start">
            <div className="h-6 w-24 bg-[#3B82F6]/20 rounded-full" />
            <div className="h-8 w-64 bg-[#000080]/20 rounded-xl" />
            <div className="h-4 w-full max-w-lg bg-[#000080]/10 rounded-lg" />
            <div className="h-12 w-48 bg-[#000080]/20 rounded-full" />
          </div>
          <div className="w-60 h-32 bg-[#050505] border border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-3 shrink-0" />
        </div>
      </div>

      {/* Pricing Toggle Switcher Skeleton */}
      <div className="w-48 h-12 bg-white/5 border border-white/10 rounded-full animate-pulse mx-auto" />

      {/* Pricing Cards Grid Skeleton */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pb-24">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden flex flex-col h-[600px] animate-pulse">
            {/* Card Badge Header */}
            <div className="w-full bg-[#000080]/10 py-4" />
            
            <div className="p-8 flex flex-col flex-grow justify-between">
              {/* Title & Price */}
              <div className="space-y-4">
                <div className="h-8 w-24 bg-gray-200 rounded-lg" />
                <div className="h-12 w-48 bg-gray-300 rounded-xl" />
                <div className="h-4 w-16 bg-gray-200 rounded-full" />
              </div>

              {/* Features List */}
              <div className="space-y-4 flex-grow mt-12">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-gray-200 shrink-0" />
                    <div className="h-4 w-4/5 bg-gray-100 rounded-lg" />
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="w-full h-14 bg-gray-200 rounded-full mt-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
