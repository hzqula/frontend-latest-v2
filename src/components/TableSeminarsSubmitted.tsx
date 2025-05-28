"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Calendar, CalendarRange, Info, User } from "lucide-react";
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
import { Seminar } from "@/configs/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TableSeminarsSubmittedProps {
  seminars: Seminar[];
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
  onSchedule: (seminar: Seminar) => void;
  onViewDetails: (seminar: Seminar) => void;
}

type SortableSeminarKeys = "student" | "createdAt";

const TableSeminarsSubmitted = ({
  seminars,
  formatDate,
  formatTime,
  onSchedule,
  onViewDetails,
}: TableSeminarsSubmittedProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortableSeminarKeys | "";
    direction: "ascending" | "descending" | null;
  }>({
    key: "",
    direction: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

        if (sortConfig.key === "student") {
          aValue = a.student?.name?.toLowerCase() || "";
          bValue = b.student?.name?.toLowerCase() || "";
        } else if (sortConfig.key === "createdAt") {
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
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
              <TableHead className="max-w-8">Judul Penelitian</TableHead>
              <TableHead
                onClick={() => requestSort("student")}
                className="cursor-pointer"
              >
                Mahasiswa <ArrowUpDown size={16} className="inline ml-1" />
              </TableHead>
              <TableHead
                onClick={() => requestSort("createdAt")}
                className="cursor-pointer"
              >
                Diajukan Pada <ArrowUpDown size={16} className="inline ml-1" />
              </TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSeminars.length > 0 ? (
              paginatedSeminars.map((seminar: Seminar, index: number) => {
                const startIndex = (currentPage - 1) * itemsPerPage;
                return (
                  <TableRow key={seminar.id} className="border-b border-border">
                    <TableCell className="text-center font-medium">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell className="font-medium max-w-[32rem]">
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
                      <div>{formatDate(seminar.createdAt)}</div>
                      <div className="text-muted-foreground">
                        {formatTime(seminar.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(seminar)}
                      >
                        <Info size={12} className="mr-1" />
                        Lihat
                      </Button>
                      <Button
                        size="sm"
                        className="bg-env-base"
                        onClick={() => onSchedule(seminar)}
                      >
                        <CalendarRange size={12} className="mr-1" />
                        Jadwalkan
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="p-4 text-center text-primary-600"
                >
                  Belum ada pengajuan seminar
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {paginatedSeminars.length > 0 ? (
          paginatedSeminars.map((seminar: Seminar) => (
            <Card
              key={seminar.id}
              className="overflow-hidden gap-2 border-l-4 border-l-jewel-blue hover:shadow-md transition-all duration-200"
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
                        {formatDate(seminar.createdAt)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        Jam {formatTime(seminar.createdAt)} WIB
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onViewDetails(seminar)}
                >
                  <Info size={12} className="mr-1" />
                  Lihat
                </Button>
              </CardFooter>
            </Card>
          ))
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

export default TableSeminarsSubmitted;
