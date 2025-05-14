import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, User, MapPin, Info } from "lucide-react";
import { Seminar } from "@/configs/types";

type SortableSeminarKeys = "time" | "student";

interface TableSeminarsAssessmentProps {
  seminars: Seminar[];
  userNip: string;
  openDetailsModal: (seminar: Seminar) => void;
  handleAssessNavigation: (seminarId: number) => void;
}

const TableSeminarsAssessment = ({
  seminars,
  userNip,
  openDetailsModal,
  handleAssessNavigation,
}: TableSeminarsAssessmentProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortableSeminarKeys | "";
    direction: "ascending" | "descending" | null;
  }>({
    key: "",
    direction: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Format functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper functions
  const canAssessSeminar = (seminarTime: string) => {
    const currentDate = new Date();
    const seminarDate = new Date(seminarTime);
    return currentDate > seminarDate;
  };

  const hasBeenAssessed = (seminar: Seminar) => {
    if (!seminar.assessments || seminar.assessments.length === 0) {
      return false;
    }
    return seminar.assessments.some(
      (assessment) => assessment.lecturerNIP === userNip
    );
  };

  // Sorting logic
  const requestSort = (key: SortableSeminarKeys) => {
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

  // Apply sorting
  const sortedSeminars = useMemo(() => {
    let filteredData = [...seminars];

    if (sortConfig.key && sortConfig.direction) {
      filteredData.sort((a, b) => {
        let aValue: string | number, bValue: string | number;

        if (sortConfig.key === "time") {
          aValue = new Date(a.time).getTime();
          bValue = new Date(b.time).getTime();
        } else if (sortConfig.key === "student") {
          aValue = a.student?.name?.toLowerCase() || "";
          bValue = b.student?.name?.toLowerCase() || "";
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

    return filteredData;
  }, [seminars, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedSeminars.length / itemsPerPage);
  const paginatedSeminars = sortedSeminars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Function for pagination clicks
  const handlePageClick = (pageNumber: number, e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <div className="hidden md:block rounded-sm overflow-x-auto border border-border">
        <Table className="bg-background">
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="text-center">No.</TableHead>
              <TableHead>Judul Penelitian</TableHead>
              <TableHead
                onClick={() => requestSort("student")}
                className="cursor-pointer"
              >
                Mahasiswa <ArrowUpDown size={16} className="inline ml-1" />
              </TableHead>
              <TableHead
                onClick={() => requestSort("time")}
                className="cursor-pointer"
              >
                Jadwal <ArrowUpDown size={16} className="inline ml-1" />
              </TableHead>
              <TableHead>Tempat</TableHead>
              <TableHead className="text-center">Keterangan</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSeminars.length > 0 ? (
              paginatedSeminars.map((seminar: Seminar, index: number) => {
                const isAssessed = hasBeenAssessed(seminar);
                const startIndex = (currentPage - 1) * itemsPerPage;
                return (
                  <TableRow key={seminar.id}>
                    <TableCell className="text-center font-medium">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell className="font-medium max-w-96">
                      <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                        {seminar.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{seminar.student?.name || "N/A"}</div>
                      <div className="text-muted-foreground">
                        {seminar.student?.nim || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{formatDate(seminar.time)}</div>
                      <div className="text-muted-foreground">
                        Jam {formatTime(seminar.time)} WIB
                      </div>
                    </TableCell>
                    <TableCell>{seminar.room || "TBD"}</TableCell>
                    <TableCell className="text-center">
                      {isAssessed ? (
                        <Badge className="bg-jewel-blue text-pastel-blue border-pastel-blue border-2">
                          Sudah
                        </Badge>
                      ) : (
                        <Badge className="bg-jewel-red text-pastel-red border-pastel-red border-2">
                          Belum
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetailsModal(seminar)}
                      >
                        Lihat
                      </Button>
                      <Button
                        size="sm"
                        className={`${
                          canAssessSeminar(seminar.time)
                            ? " bg-env-base"
                            : "cursor-not-allowed"
                        }`}
                        disabled={!canAssessSeminar(seminar.time)}
                        onClick={() => handleAssessNavigation(seminar.id!)}
                      >
                        Nilai
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="p-4 text-center text-primary-600"
                >
                  Belum ada seminar yang tersedia.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {paginatedSeminars.length > 0 ? (
          paginatedSeminars.map((seminar: Seminar) => {
            const isAssessed = hasBeenAssessed(seminar);
            return (
              <Card
                key={seminar.id}
                className="overflow-hidden gap-2 border-l-4 hover:shadow-md transition-all duration-200"
                style={{ borderLeftColor: isAssessed ? "#3498db" : "#e74c3c" }}
              >
                <CardHeader className="pb-0">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium line-clamp-2">
                      {seminar.title}
                    </CardTitle>
                    {isAssessed ? (
                      <Badge className="bg-jewel-blue text-pastel-blue border-pastel-blue border-2">
                        Sudah
                      </Badge>
                    ) : (
                      <Badge className="bg-jewel-red text-pastel-red border-pastel-red border-2">
                        Belum
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-primary-600" />
                      <div>
                        <span className="text-xs">
                          {seminar.student?.name || "N/A"}
                        </span>
                        <span className="text-muted-foreground text-xs ml-2">
                          ({seminar.student?.nim || "N/A"})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={12} className="text-primary-600" />
                      <div>
                        <span className="text-xs">
                          {formatDate(seminar.time)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          Jam {formatTime(seminar.time)} WIB
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-primary-600" />
                      <span className="text-xs">{seminar.room || "TBD"}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDetailsModal(seminar)}
                  >
                    <Info size={12} className="mr-1" />
                    Lihat
                  </Button>
                  <Button
                    size="sm"
                    className={`flex-1 ${
                      canAssessSeminar(seminar.time)
                        ? "bg-env-base"
                        : "cursor-not-allowed"
                    }`}
                    disabled={!canAssessSeminar(seminar.time)}
                    onClick={() => handleAssessNavigation(seminar.id!)}
                  >
                    Nilai
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="p-4 text-center text-primary-600 bg-background rounded-md border">
            Belum ada seminar yang tersedia.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) =>
                  handlePageClick(currentPage > 1 ? currentPage - 1 : 1, e)
                }
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              const showPage =
                pageNumber === 1 ||
                pageNumber === totalPages ||
                Math.abs(pageNumber - currentPage) <= 1;

              if (
                !showPage &&
                ((pageNumber === 2 && currentPage > 3) ||
                  (pageNumber === totalPages - 1 &&
                    currentPage < totalPages - 2))
              ) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              if (showPage) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={(e) => handlePageClick(pageNumber, e)}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              }

              return null;
            })}

            <PaginationItem>
              <PaginationNext
                onClick={(e) =>
                  handlePageClick(
                    currentPage < totalPages ? currentPage + 1 : totalPages,
                    e
                  )
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
};

export default TableSeminarsAssessment;
