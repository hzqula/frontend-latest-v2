// components/LineChartLecturerSeminars.tsx
"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CustomTooltipProps, Seminar } from "@/configs/types";
import {
  TrendingUp,
  TrendingDown,
  EqualApproximately,
  File,
  Folder,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LineChartLecturerSeminarsProps {
  seminars: Seminar[];
  role: "ADVISED" | "ASSESSED";
}

const LineChartLecturerSeminars: React.FC<LineChartLecturerSeminarsProps> = ({
  seminars,
  role,
}) => {
  const { user } = useAuth();

  // Memproses data seminar untuk 6 bulan terakhir
  const processSeminarData = (seminars: Seminar[]) => {
    const currentDate = new Date("2025-05-21T17:09:00Z"); // Tanggal saat ini
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      const month = date.toLocaleString("en-US", { month: "short" });
      const year = date.getFullYear();
      months.push({ month, year });
    }

    const data = months.map(({ month, year }) => {
      const monthIndex = new Date(`${year}-${month}`).getMonth() + 1;
      // Filter seminar berdasarkan peran (ADVISED atau ASSESSED)
      const filteredSeminars = seminars.filter((seminar) =>
        role === "ADVISED"
          ? seminar.advisors.some(
              (advisor) => advisor.lecturer?.nip === user?.profile.nip
            )
          : seminar.assessors.some(
              (assessor) => assessor.lecturer?.nip === user?.profile.nip
            )
      );
      // Jumlah seminar proposal
      const proposalCount = filteredSeminars.filter(
        (seminar) =>
          seminar.type === "PROPOSAL" &&
          new Date(seminar.createdAt).getMonth() + 1 === monthIndex &&
          new Date(seminar.createdAt).getFullYear() === year
      ).length;
      // Jumlah seminar hasil
      const resultCount = filteredSeminars.filter(
        (seminar) =>
          seminar.type === "HASIL" &&
          new Date(seminar.createdAt).getMonth() + 1 === monthIndex &&
          new Date(seminar.createdAt).getFullYear() === year
      ).length;

      return {
        month,
        proposal: proposalCount,
        result: resultCount,
      };
    });

    return data;
  };

  // Fungsi untuk menghitung persentase perubahan
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) {
      if (current === 0) return 0;
      return current > 0 ? 100 : -100;
    }
    return ((current - previous) / previous) * 100;
  };

  const data = processSeminarData(seminars);

  // Ambil data untuk bulan sebelumnya dan bulan ini
  const lastMonthData = data[data.length - 2] || {
    proposal: 0,
    result: 0,
  };
  const currentMonthData = data[data.length - 1] || {
    proposal: 0,
    result: 0,
  };

  const proposalChange = calculatePercentageChange(
    currentMonthData.proposal,
    lastMonthData.proposal
  );
  const resultChange = calculatePercentageChange(
    currentMonthData.result,
    lastMonthData.result
  );

  // Komponen untuk indikator perubahan
  const ChangeIndicator = ({
    change,
    type,
  }: {
    change: number;
    type: string;
  }) => {
    const isIncrease = change > 0;
    const absChange = Math.abs(change).toFixed(1);

    return (
      <div className="flex items-center gap-1 text-sm">
        <span
          className={`
            ${
              change !== 0
                ? isIncrease
                  ? "text-jewel-blue"
                  : "text-jewel-red"
                : "text-muted-foreground"
            } flex items-center justify-center text-xs md:text-sm
          `}
        >
          {type === "Seminar Proposal" ? (
            <div
              className={`flex items-center justify-center w-5 md:w-6 h-5 md:h-6 rounded-full mr-1 ${
                role === "ADVISED" ? "bg-pastel-blue" : "bg-pastel-green"
              }`}
            >
              <File
                className={`w-3 md:w-4 h-3 md:h-4 ${
                  role === "ADVISED" ? "text-jewel-blue" : "text-jewel-green"
                }`}
              />
            </div>
          ) : (
            <div
              className={`flex items-center justify-center w-5 md:w-6 h-5 md:h-6 rounded-full mr-1 ${
                role === "ADVISED" ? "bg-pastel-blue" : "bg-pastel-green"
              }`}
            >
              <Folder
                className={`w-3 md:w-4 h-3 md:h-4 ${
                  role === "ADVISED" ? "text-jewel-blue" : "text-jewel-green"
                }`}
              />
            </div>
          )}
          {absChange}%
        </span>
        {change !== 0 ? (
          isIncrease ? (
            <TrendingUp className="w-3 md:w-4 h-3 md:h-4 text-jewel-blue" />
          ) : (
            <TrendingDown className="w-3 md:w-4 h-3 md:h-4 text-jewel-red" />
          )
        ) : (
          <EqualApproximately className="w-3 md:w-4 h-3 md:h-4 text-muted-foreground" />
        )}
      </div>
    );
  };

  // Tooltip kustom untuk chart
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="shadow-sm border px-4 py-2 rounded-sm bg-background">
          <p className="text-sm text-muted-foreground">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-sm font-medium"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Tentukan warna berdasarkan peran
  const lineColor = role === "ADVISED" ? "#064359" : "#C50043";

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: -30,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="proposal"
            name="Seminar Proposal"
            stroke={lineColor}
            strokeWidth={1.5}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="result"
            name="Seminar Hasil"
            stroke={lineColor}
            strokeWidth={1.5}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 text-sm pb-4 justify-end">
        {data.length > 1 && (
          <>
            <ChangeIndicator change={proposalChange} type="Seminar Proposal" />
            <ChangeIndicator change={resultChange} type="Seminar Hasil" />
          </>
        )}
      </div>
    </div>
  );
};

export default LineChartLecturerSeminars;
