"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import {
  ArrowUpDown,
  Calendar,
  User,
  MapPin,
  Info,
  Edit,
  CalendarFold,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Lecturer, Seminar } from "@/configs/types";
import { Link } from "react-router";

interface TableSeminarsScheduledProps {
  seminars: Seminar[];
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
  onReschedule: (seminar: Seminar) => void;
  token: string;
  lecturers: Lecturer[];
}
type SortableSeminarKeys = "time" | "student";

// TableSeminarsScheduled.tsx (versi diperbarui)
interface TableSeminarsScheduledProps {
  seminars: Seminar[];
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
  onReschedule: (seminar: Seminar) => void;
  token: string;
  lecturers: Lecturer[];
}

const TableSeminarsScheduled = ({
  seminars,
  formatDate,
  formatTime,
  onReschedule,
}: TableSeminarsScheduledProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortableSeminarKeys | "";
    direction: "ascending" | "descending" | null;
  }>({
    key: "",
    direction: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const totalPages = Math.ceil(sortedSeminars.length / itemsPerPage);
  const paginatedSeminars = sortedSeminars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSeminars.length > 0 ? (
              paginatedSeminars.map((seminar: Seminar, index: number) => {
                const startIndex = (currentPage - 1) * itemsPerPage;
                const detailPath =
                  seminar.type === "PROPOSAL"
                    ? `/seminar-proposal/detail/${seminar.id}`
                    : `/seminar-hasil/detail/${seminar.id}`;
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
                    <TableCell className="text-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Info size={12} className="mr-1" />
                        <Link to={detailPath}>Lihat</Link>
                      </Button>

                      <Button
                        size="sm"
                        className="bg-env-base"
                        onClick={() => onReschedule(seminar)}
                      >
                        <CalendarFold size={12} className="mr-1" />
                        Reschedule
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
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
            const detailPath =
              seminar.type === "PROPOSAL"
                ? `/seminar-proposal/detail/${seminar.id}`
                : `/seminar-hasil/detail/${seminar.id}`;
            return (
              <Card
                key={seminar.id}
                className="overflow-hidden gap-2 border-l-4 border-l-jewel-purple hover:shadow-md transition-all duration-200"
              >
                <CardHeader className="pb-0">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium line-clamp-2">
                      {seminar.title}
                    </CardTitle>
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
                  <Button variant="outline" size="sm" className="flex-1">
                    <Info size={12} className="mr-1" />
                    <Link to={detailPath}>Lihat</Link>
                    Lihat
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-env-base"
                    onClick={() => {
                      if (seminar.folderId) {
                        window.open(
                          `https://drive.google.com/drive/u/4/folders/${seminar.folderId}`,
                          "_blank"
                        );
                      } else {
                        toast.error("Link Google Drive tidak tersedia.");
                      }
                    }}
                  >
                    Folder
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onReschedule(seminar)}
                  >
                    <Edit size={12} className="mr-1" />
                    Reschedule
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

export default TableSeminarsScheduled;
