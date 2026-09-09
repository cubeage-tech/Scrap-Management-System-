import {
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const StatCards = ({ data = [], getIconForType }) => {
  return (
    <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((stat, index) => {
        const iconConfig = getIconForType(stat.type);

        return (
          <div
            key={stat.id || index}
            className="relative overflow-hidden p-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-shadow group md:p-5 hover:shadow-md"
          >
            {/* Header */}
            <div className="relative z-10 flex items-start justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                {stat.title}
              </h3>

              <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg ${iconConfig.bg}`}
              >
                {iconConfig.icon}
              </div>
            </div>

            {/* Value + Change */}
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <p className="mb-1 text-xl font-bold text-gray-900 md:text-2xl">
                  {stat.value}
                </p>

                {stat.change && (
                  <p
                    className={`text-xs font-semibold ${
                      stat.isPositive
                        ? "text-emerald-500"
                        : "text-red-500"
                    }`}
                  >
                    {stat.change}
                  </p>
                )}
              </div>

              {/* Sparkline */}
              {stat.sparkline?.length > 0 && (
                <div className="w-16 h-8 transition-opacity opacity-70 md:w-20 md:h-10 group-hover:opacity-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stat.sparkline}>
                      <Line
                        type="monotone"
                        dataKey="val"
                        stroke={stat.color || "#3b82f6"}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;