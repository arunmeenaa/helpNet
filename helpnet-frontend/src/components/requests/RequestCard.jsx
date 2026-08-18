import React from "react";

export default function RequestCard({ 
  title, 
  location, 
  priority, 
  time = "Just now", // Added optional prop for realism
  name = "Neighbor"  // Added optional prop for realism
}) {

  // Dynamic styling based on the priority level
  const getPriorityStyles = (level) => {
    const lowerLevel = level?.toLowerCase();
    if (lowerLevel === "high" || lowerLevel === "urgent") {
      return "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
    }
    if (lowerLevel === "medium") {
      return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
    }
    return "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
  };

  return (
    <div className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 dark:hover:shadow-cyan-900/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      
      {/* Header: User Info & Priority */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar Placeholder */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-blue-600 dark:text-cyan-400 font-bold text-sm">
            {name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
          </div>
        </div>

        {/* Dynamic Priority Badge */}
        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getPriorityStyles(priority)}`}>
          {priority}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
          {title}
        </h3>

        {/* Location with SVG Icon */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
          <svg className="w-4 h-4 text-blue-500 dark:text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{location}</span>
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full mt-6 py-2.5 rounded-xl font-bold text-sm bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-gray-800 dark:text-cyan-400 dark:hover:bg-cyan-500 dark:hover:text-gray-950 transition-all duration-300">
        I Can Help
      </button>

    </div>
  );
}