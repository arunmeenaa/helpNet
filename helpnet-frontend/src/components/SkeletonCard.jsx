const SkeletonCard = () => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex justify-between items-start mb-5 animate-pulse">
        <div className="flex items-center gap-3">
          {/* Circular icon placeholder */}
          <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
          <div className="space-y-2">
            {/* Author name placeholder */}
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
            {/* Category placeholder */}
            <div className="h-2 w-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>

      <div className="flex-grow mb-6 space-y-3 animate-pulse">
        {/* Title placeholders */}
        <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-800 rounded"></div>
        
        <div className="pt-4 space-y-2">
          {/* Location & Time placeholders */}
          <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 rounded"></div>
          <div className="h-3 w-1/3 bg-gray-100 dark:bg-gray-800 rounded"></div>
        </div>
      </div>

      {/* Button placeholder */}
      <div className="w-full h-12 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
    </div>
  );
};

export default SkeletonCard;