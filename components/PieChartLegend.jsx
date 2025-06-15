import { categoryColors } from "@/data/categories";

// Utility function to strip "(You)", "(Reimbursed)", etc.
export function normalizeCategory(name) {
  return name.replace(/\s*\(.*?\)\s*/g, "").trim();
}

export const PieChartLegend = ({ pieChartData, isDark }) => (
  <div className="legend-container flex flex-col space-y-1 ">
    {pieChartData.map((entry, i) => {
      const base = normalizeCategory(entry.name);
      const color = categoryColors[base] || "#7851a9"; // fallback color
      return (
        <div key={i} className="flex items-center space-x-2">
          <div
            style={{
              backgroundColor: color,
              width: 12,
              height: 12,
              borderRadius: "50%",
            }}
          />
          <span className={isDark ? "text-white" : "text-gray-800"}>
            {entry.name}
          </span>
        </div>
      );
    })}
  </div>
);
