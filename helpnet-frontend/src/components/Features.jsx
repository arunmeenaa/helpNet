import { AlertTriangle, MapPin, Zap, Users } from "lucide-react";

export default function Features() {
  const features = [
    {
      id: 1,
      icon: AlertTriangle,
      title: "Emergency Requests",
      description: "Instantly post urgent help requests and notify your community.",
      iconColor: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-500/10",
    },
    {
      id: 2,
      icon: MapPin,
      title: "Local Help",
      description: "Connect with people nearby who are ready to help quickly.",
      iconColor: "text-blue-600 dark:text-cyan-400",
      iconBg: "bg-blue-100 dark:bg-cyan-500/10",
    },
    {
      id: 3,
      icon: Zap,
      title: "Fast Response",
      description: "Receive quick responses from helpers during urgent situations.",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-500/10",
    },
    {
      id: 4,
      icon: Users,
      title: "Trusted Community",
      description: "Build a safe and trusted local community of helpers.",
      iconColor: "text-teal-600 dark:text-teal-400",
      iconBg: "bg-teal-100 dark:bg-teal-500/10",
    },
  ];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Background Ambient Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-600/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-lighten pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-400/20 dark:bg-cyan-600/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-lighten pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
          <span className="px-4 py-1.5 text-sm font-bold tracking-widest text-blue-600 dark:text-cyan-400 uppercase bg-blue-100 dark:bg-cyan-900/30 rounded-full mb-6 inline-block">
            Why HelpNet?
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Everything you need to give and receive help efficiently. We built HelpNet to ensure no call for support goes unanswered.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div 
                key={feature.id}
                className="group relative bg-white dark:bg-gray-900/50 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 dark:hover:shadow-cyan-900/10 hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Icon Container */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300 ${feature.iconBg}`}>
                  <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}