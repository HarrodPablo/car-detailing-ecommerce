export function SkeletonProductCard() {
  return (
    <div className="bg-[#111] border border-[#2D2D2D] rounded-xl overflow-hidden animate-pulse">
      <div className="w-full aspect-square bg-[#1a1a1a]" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-[#1a1a1a] rounded w-1/3" />
        <div className="h-5 bg-[#1a1a1a] rounded w-3/4" />
        <div className="h-3 bg-[#1a1a1a] rounded w-1/2" />
        <div className="h-6 bg-[#1a1a1a] rounded w-2/5 mt-1" />
        <div className="h-10 bg-[#1a1a1a] rounded w-full mt-2" />
      </div>
    </div>
  )
}

export function SkeletonComboCard() {
  return (
    <div className="bg-[#111] border border-[#2D2D2D] rounded-xl overflow-hidden animate-pulse">
      <div className="w-full aspect-square bg-[#1a1a1a]" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-[#1a1a1a] rounded w-2/3" />
        <div className="h-6 bg-[#1a1a1a] rounded w-1/3" />
        <div className="h-10 bg-[#1a1a1a] rounded w-full mt-2" />
      </div>
    </div>
  )
}

export function SkeletonHeroCard() {
  return (
    <div className="bg-[#111]/95 border border-[#2D2D2D] rounded-xl p-4 w-64 animate-pulse">
      <div className="h-3 bg-[#1a1a1a] rounded w-1/2 mb-2" />
      <div className="h-4 bg-[#1a1a1a] rounded w-3/4 mb-3" />
      <div className="flex items-center justify-between">
        <div className="h-6 bg-[#1a1a1a] rounded w-1/3" />
        <div className="h-8 bg-[#1a1a1a] rounded w-1/4" />
      </div>
    </div>
  )
}
