import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ScoreVisualizationProps {
  scores: {
    presentation: number;
    mastery: number;
    writing?: number;
    characteristic?: number;
  };
  isAdvisor: boolean;
}

interface ChartData {
  name: string;
  score: number;
  description: string;
}

const BarChartScoreVisualization: React.FC<ScoreVisualizationProps> = ({
  scores,
  isAdvisor,
}) => {
  const data: ChartData[] = [
    {
      name: "Penyajian Makalah / Presentasi",
      score: scores.presentation,
      description:
        "Kejelasan materi yang disampaikan, sikap, kejelasan vokal dan body language, interaksi dan komunikasi, tampilan/design materi presentasi",
    },
    {
      name: "Penguasaan Materi",
      score: scores.mastery,
      description:
        "Pemahaman materi, kemampuan menjawab pertanyaan, kedalaman pengetahuan",
    },
  ];

  if (isAdvisor) {
    data.push({
      name: "Karakteristik Mahasiswa",
      score: scores.characteristic || 0,
      description:
        "Inisiatif, ketekunan, adaptabilitas, respons terhadap umpan balik dan bimbingan",
    });
  } else {
    data.push({
      name: "Penulisan Makalah",
      score: scores.writing || 0,
      description:
        "Kualitas dokumen penelitian, kejelasan ide, kutipan dan referensi yang tepat",
    });
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#10b981"; // Hijau
    if (score >= 80) return "#2563eb"; // Biru
    if (score >= 70) return "#f59e0b"; // Kuning
    return "#dc2626"; // Merah
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-env-light rounded-lg shadow-md p-2 sm:p-3 max-w-[80vw] sm:max-w-xs">
          <p className="text-xs sm:text-sm font-semibold text-env-darker line-clamp-2">
            {label}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Nilai: {data.score}/100
          </p>
          {data.description && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-3">
              {data.description}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="h-[200px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
            className="text-xs sm:text-sm"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickCount={6}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: "#334155" }}
              width={100}
              tickFormatter={(value: string) =>
                value.length > 15 ? `${value.substring(0, 15)}...` : value
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="score"
              radius={[0, 4, 4, 0]}
              barSize={15}
              fill="#064359"
              stroke="#a0ced9"
              strokeWidth={1}
            >
              {data.map((entry, index) => (
                <Bar
                  key={`bar-${index}`}
                  dataKey="score"
                  fill={getScoreColor(entry.score)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartScoreVisualization;
