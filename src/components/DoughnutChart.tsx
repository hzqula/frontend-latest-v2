import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

interface DoughnutChartProps {
  initialData: { name: string; value: number; color: string; stroke: string }[];
}

const DoughnutChart = ({ initialData }: DoughnutChartProps) => {
  // Pastikan initialData tidak kosong
  const hasData = initialData && initialData.length > 0;

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-4 border-primary border-2 rounded-md">
          <p className="font-bold" style={{ color: data.payload.color }}>
            {data.name}
          </p>
          <p className="text-black-custom">{data.value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: "100%", height: "300px" }}>
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={initialData}
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="80%"
              paddingAngle={4}
              cornerRadius={4}
              dataKey="value"
            >
              {initialData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  stroke={entry.stroke}
                  fill={entry.color}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              className="text-sm"
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-primary">
          Tidak ada data untuk ditampilkan.
        </p>
      )}
    </div>
  );
};

export default DoughnutChart;
