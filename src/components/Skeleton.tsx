/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function CarCardSkeleton() {
  return (
    <div className="bg-[#161616] border border-[#262626] rounded-xl overflow-hidden animate-pulse">
      <div className="h-48 sm:h-56 bg-[#262626] w-full" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-[#262626] rounded w-3/4" />
            <div className="h-3 bg-[#262626] rounded w-1/2" />
          </div>
          <div className="h-4 w-4 rounded-full bg-[#262626]" />
        </div>
        
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 bg-[#262626] rounded-full" />
          <div className="h-6 w-16 bg-[#262626] rounded-full" />
          <div className="h-6 w-16 bg-[#262626] rounded-full" />
        </div>

        <div className="border-t border-[#262626] pt-4 flex items-end justify-between">
          <div className="space-y-1">
            <div className="h-6 w-20 bg-[#262626] rounded" />
            <div className="h-3 w-12 bg-[#262626] rounded" />
          </div>
          <div className="h-10 w-24 bg-[#262626] rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function DetailedCarSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="h-96 bg-[#161616] rounded-xl border border-[#262626]" />
          <div className="flex gap-4">
            <div className="h-20 w-32 bg-[#161616] rounded-md border border-[#262626]" />
            <div className="h-20 w-32 bg-[#161616] rounded-md border border-[#262626]" />
          </div>
        </div>
        <div className="lg:col-span-4 space-y-4">
          <div className="h-96 bg-[#161616] rounded-xl border border-[#262626]" />
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[#161616] border border-[#262626] p-6 rounded-xl space-y-3">
          <div className="h-3 bg-[#262626] rounded w-1/3" />
          <div className="h-8 bg-[#262626] rounded w-2/3" />
          <div className="h-3 bg-[#262626] rounded w-full" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-[#161616] rounded border border-[#262626]" />
      <div className="h-16 bg-[#161616] rounded border border-[#262626]" />
      <div className="h-16 bg-[#161616] rounded border border-[#262626]" />
      <div className="h-16 bg-[#161616] rounded border border-[#262626]" />
    </div>
  );
}
