export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="h-4 w-24 bg-gray-100 rounded mb-8 animate-pulse" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-4 w-32 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-20 w-36 bg-white border border-gray-100 rounded-2xl animate-pulse" />
          <div className="h-20 w-36 bg-white border border-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[2rem] p-8 h-[400px]">
            <div className="flex justify-between items-start mb-10">
              <div className="h-8 w-1/3 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-6 w-20 bg-gray-50 rounded-md animate-pulse" />
            </div>
            <div className="h-full w-full bg-gray-50/50 rounded-2xl animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
