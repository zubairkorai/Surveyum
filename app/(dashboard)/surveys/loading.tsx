export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 md:mb-12">
        <div className="space-y-2">
          <div className="h-10 w-48 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-4 w-64 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="h-12 w-40 bg-gray-200 rounded-2xl animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[2rem] p-8 h-[220px] relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-3 flex-1">
                <div className="h-6 w-3/4 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-50 rounded-md animate-pulse" />
              </div>
              <div className="h-8 w-8 bg-gray-50 rounded-full animate-pulse" />
            </div>
            <div className="mt-auto pt-8 border-t border-gray-50 flex gap-3">
              <div className="h-10 flex-1 bg-gray-50 rounded-xl animate-pulse" />
              <div className="h-10 w-12 bg-gray-50 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
