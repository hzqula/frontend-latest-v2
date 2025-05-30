import { useMemo, useState } from "react";
import { ArrowUpDown, CalendarClock } from "lucide-react";
import { Seminar } from "@/configs/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TableSeminarAssessmentDetailProps {
  seminar: Seminar;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
}

type SortableKeys = "finalScore" | "createdAt";

const TableSeminarAssessmentDetail: React.FC<
  TableSeminarAssessmentDetailProps
> = ({ seminar, formatDate, formatTime }) => {
  // State untuk konfigurasi sorting
  const [sortConfig, setSortConfig] = useState<{
    key: SortableKeys | "";
    direction: "ascending" | "descending" | null;
  }>({
    key: "",
    direction: null,
  });

  // Fungsi untuk mengatur sorting
  const requestSort = (key: SortableKeys) => {
    let direction: "ascending" | "descending" | null = "ascending";

    if (sortConfig.key === key) {
      if (sortConfig.direction === "ascending") {
        direction = "descending";
      } else if (sortConfig.direction === "descending") {
        direction = null;
      }
    }

    setSortConfig({ key, direction });
  };

  // Fungsi untuk menghitung rata-rata total nilai dari assessments yang ada
  const calculateAverageScore = () => {
    const totalScores = seminar.assessments
      ?.map((assessment) => assessment.finalScore)
      .filter((score) => score !== undefined && score !== null);
    const sum = totalScores?.reduce((acc, score) => acc + score, 0) || 0;
    const count = totalScores?.length || 1; // Hindari pembagian dengan 0
    return (sum / count).toFixed(2);
  };

  // Fungsi untuk menentukan apakah dosen adalah pembimbing atau penguji
  const getRole = (lecturerNIP: string) => {
    const isAdvisor = seminar.advisors.some(
      (advisor) => advisor.lecturer?.nip === lecturerNIP
    );
    return isAdvisor ? "Pembimbing" : "Penguji";
  };

  // Gabungkan semua dosen (pembimbing dan penguji) dan hapus duplikat
  const allLecturers = [
    ...seminar.advisors.map((advisor) => ({
      nip: advisor.lecturer?.nip,
      name: advisor.lecturer?.name,
    })),
    ...seminar.assessors.map((assessor) => ({
      nip: assessor.lecturer?.nip,
      name: assessor.lecturer?.name,
    })),
  ].reduce((unique, lecturer) => {
    if (!unique.find((l) => l.nip === lecturer.nip)) {
      unique.push(lecturer);
    }
    return unique;
  }, [] as { nip: string | undefined; name: string | undefined }[]);

  // Dapatkan penilaian berdasarkan NIP
  const assessmentsMap = seminar.assessments?.reduce(
    (map, assessment) => map.set(assessment.lecturerNIP, assessment),
    new Map<string, (typeof seminar.assessments)[0]>()
  );

  // Sortir dosen berdasarkan konfigurasi sorting
  const sortedLecturers = useMemo(() => {
    let sortedData = [...allLecturers];

    if (sortConfig.key && sortConfig.direction) {
      sortedData.sort((a, b) => {
        const assessmentA = assessmentsMap?.get(a.nip || "");
        const assessmentB = assessmentsMap?.get(b.nip || "");
        let aValue: number, bValue: number;

        if (sortConfig.key === "finalScore") {
          aValue = assessmentA?.finalScore ?? 0;
          bValue = assessmentB?.finalScore ?? 0;
        } else if (sortConfig.key === "createdAt") {
          aValue = assessmentA?.createdAt
            ? new Date(assessmentA.createdAt).getTime()
            : 0;
          bValue = assessmentB?.createdAt
            ? new Date(assessmentB.createdAt).getTime()
            : 0;
        } else {
          return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return sortedData;
  }, [allLecturers, sortConfig, assessmentsMap]);

  return (
    <>
      {/* Tampilan desktop (table) */}
      <div className="hidden md:block rounded-sm overflow-x-auto border border-border">
        <Table className="bg-background">
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="text-center">No.</TableHead>
              <TableHead>Dosen</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead>Presentasi (25%)</TableHead>
              <TableHead>Penguasaan (40%)</TableHead>
              <TableHead>Karakteristik (35%)</TableHead>
              <TableHead>Penulisan (35%)</TableHead>
              <TableHead
                onClick={() => requestSort("finalScore")}
                className="cursor-pointer"
              >
                Total Nilai <ArrowUpDown size={16} className="inline ml-1" />
              </TableHead>
              <TableHead
                onClick={() => requestSort("createdAt")}
                className="cursor-pointer"
              >
                Dinilai pada <ArrowUpDown size={16} className="inline ml-1" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLecturers.map((lecturer, index) => {
              const assessment = assessmentsMap?.get(lecturer.nip || "");
              return (
                <TableRow key={index}>
                  <TableCell className="text-center font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-env-darker">
                        {lecturer.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lecturer.nip}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getRole(lecturer.nip || "")}</TableCell>
                  <TableCell>
                    {assessment?.presentationScore ?? "-"}
                    {assessment?.presentationScore && (
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        ({(assessment.presentationScore * 0.25).toFixed(2)})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {assessment?.masteryScore ?? "-"}
                    {assessment?.masteryScore && (
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        ({(assessment.masteryScore * 0.4).toFixed(2)})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {assessment?.characteristicScore ?? "-"}
                    {assessment?.characteristicScore && (
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        ({(assessment.characteristicScore * 0.35).toFixed(2)})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {assessment?.writingScore ?? "-"}
                    {assessment?.writingScore && (
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        ({(assessment.writingScore * 0.35).toFixed(2)})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {assessment?.finalScore?.toFixed(2) ?? "-"}
                  </TableCell>
                  <TableCell>
                    {assessment?.createdAt ? (
                      <>
                        <div>{formatDate(assessment.createdAt)}</div>
                        <div className="text-muted-foreground">
                          Jam {formatTime(assessment.createdAt)} WIB
                        </div>
                      </>
                    ) : (
                      "Belum menilai"
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {/* Baris untuk rata-rata total nilai */}
            <TableRow>
              <TableCell colSpan={7} className="text-right font-bold">
                Rata-rata Total Nilai
              </TableCell>
              <TableCell className="font-bold">
                {calculateAverageScore()}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Tampilan mobile (card) */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {sortedLecturers.map((lecturer, index) => {
          const assessment = assessmentsMap?.get(lecturer.nip || "");
          const isAssessed = !!assessment?.createdAt;

          return (
            <Card
              key={index}
              className={`overflow-hidden gap-2 border-l-4 ${
                isAssessed ? "border-l-jewel-blue" : "border-l-jewel-red"
              } hover:shadow-md transition-all duration-200`}
            >
              <CardHeader className="pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <CardTitle className="text-xs font-medium line-clamp-2">
                      {lecturer.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {lecturer.nip}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-[10px] ${
                        getRole(lecturer.nip || "") === "Pembimbing"
                          ? "bg-pastel-green text-jewel-green"
                          : "bg-pastel-blue text-jewel-blue"
                      } border border-current`}
                    >
                      {getRole(lecturer.nip || "")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="text-sm">
                  <div className="mb-2">
                    <div className="flex gap-2">
                      <CalendarClock className="text-primary-600 w-3.5 h-3.5" />
                      {assessment?.createdAt ? (
                        <>
                          <span className="text-xs">
                            {formatDate(assessment.createdAt)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Jam {formatTime(assessment.createdAt)} WIB
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Belum menilai
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div>
                      <div className="flex w-5/6 justify-between">
                        <span className="text-xs text-muted-foreground">
                          Presentasi:
                        </span>{" "}
                        <span className="text-xs font-semibold text-primary">
                          {assessment?.presentationScore ?? "-"}
                          {assessment?.presentationScore && (
                            <span className="text-[10px] text-muted-foreground">
                              {" "}
                              (
                              {(assessment.presentationScore * 0.25).toFixed(2)}
                              )
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex w-5/6 justify-between">
                        <span className="text-xs text-muted-foreground">
                          Penguasaan:
                        </span>{" "}
                        <span className="text-xs font-semibold text-primary">
                          {assessment?.masteryScore ?? "-"}
                          {assessment?.masteryScore && (
                            <span className="text-[10px] text-muted-foreground">
                              {" "}
                              ({(assessment.masteryScore * 0.4).toFixed(2)})
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex w-5/6 justify-between mt-2">
                        <span className="text-xs font-semibold text-primary">
                          Total Nilai:
                        </span>{" "}
                        <span className="text-xs font-semibold text-primary">
                          {assessment?.finalScore?.toFixed(2) ?? "-"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex w-5/6 justify-between">
                        <span className="text-xs text-muted-foreground">
                          Karakteristik:
                        </span>{" "}
                        <span className="text-xs font-semibold text-primary">
                          {assessment?.characteristicScore ?? "-"}
                          {assessment?.characteristicScore && (
                            <span className="text-[10px] text-muted-foreground">
                              {" "}
                              (
                              {(assessment.characteristicScore * 0.35).toFixed(
                                2
                              )}
                              )
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex w-5/6 justify-between">
                        <span className="text-xs text-muted-foreground">
                          Penulisan:
                        </span>{" "}
                        <span className="text-xs font-semibold text-primary">
                          {assessment?.writingScore ?? "-"}
                          {assessment?.writingScore && (
                            <span className="text-[10px] text-muted-foreground">
                              {" "}
                              ({(assessment.writingScore * 0.35).toFixed(2)})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {/* Card untuk rata-rata total nilai */}
        <Card className="overflow-hidden gap-2 border-l-4 hover:shadow-md transition-all duration-200 border-l-env-base">
          <CardContent className="py-4 text-sm">
            <div className="font-bold text-right">
              Rata-rata Total Nilai: {calculateAverageScore()}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TableSeminarAssessmentDetail;
