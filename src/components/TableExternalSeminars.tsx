"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import {
  ArrowUpDown,
  Calendar,
  User,
  MapPin,
  Link2,
  Users,
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
import { Seminar } from "@/configs/types";
import { Badge } from "@/components/ui/badge";

interface TableExternalSeminarsProps {
  seminars: Seminar[];
  formatDate: (dateString: string | null) => string;
  formatTime: (dateString: string | null) => string;
  getStatusBadgeType: (status: string | null) => string;
  totalPages: number;
  currentPage: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

type SortableSeminarKeys = "title" | "student" | "time";

const TableExternalSeminars = ({
  seminars,
  formatDate,
  formatTime,
  getStatusBadgeType,
  totalPages,
  currentPage,
  perPage,
  onPageChange,
}: TableExternalSeminarsProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortableSeminarKeys | "";
    direction: "ascending" | "descending" | null;
  }>({
    key: "",
    direction: null,
  });

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
        if (sortConfig.key === "title") {
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
        } else if (sortConfig.key === "student") {
          aValue = a.student?.name?.toLowerCase() || "";
          bValue = b.student?.name?.toLowerCase() || "";
        } else if (sortConfig.key === "time") {
          aValue = a.time ? new Date(a.time).getTime() : 0;
          bValue = b.time ? new Date(b.time).getTime() : 0;
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

  const paginatedSeminars = sortedSeminars.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handlePageClick = (pageNumber: number, e: React.MouseEvent) => {
    e.preventDefault();
    onPageChange(pageNumber);
  };

  const copyAssessmentLink = (seminarId: number, token: string) => {
    const link = `http://localhost:3000/proposal/${seminarId}/assess?token=${token}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast.success("Link penilaian disalin ke clipboard!");
      })
      .catch(() => {
        toast.error("Gagal menyalin link penilaian.");
      });
  };

  return (
    <>
      <div className="hidden md:block rounded-sm overflow-x-auto border border-border">
        <Table className="bg-background">
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="text-center">No.</TableHead>
              <TableHead
                onClick={() => requestSort("title")}
                className="cursor-pointer"
              >
                Judul <ArrowUpDown size={16} className="inline ml-1" />
              </TableHead>
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
                Waktu <ArrowUpDown size={16} className="inline ml-1" />
              </TableHead>
              <TableHead>Tempat</TableHead>
              <TableHead>Pembimbing</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSeminars.length > 0 ? (
              paginatedSeminars.map((seminar: Seminar, index: number) => {
                const startIndex = (currentPage - 1) * perPage;
                const externalAdvisors = seminar.advisors.filter(
                  (advisor) => advisor.externalLecturer
                );
                return (
                  <TableRow key={seminar.id}>
                    <TableCell className="text-center font-medium">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell className="font-medium max-w-96">
                      <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                        {seminar.title.replace(/\n/g, " ")}
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
                    <TableCell>{seminar.room || "Belum ditentukan"}</TableCell>
                    <TableCell>
                      {externalAdvisors.map((advisor, idx) => (
                        <div key={idx}>{advisor.externalLecturer?.name}</div>
                      ))}
                    </TableCell>
                    <TableCell>
                      {externalAdvisors.map((advisor, idx) => (
                        <div key={idx}>{advisor.externalLecturer?.contact}</div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeType(seminar.status)}>
                        {seminar.status || "Belum Dimulai"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center space-x-2">
                      {seminar.assessmentLinks?.map((link, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyAssessmentLink(seminar.id, link.token)
                          }
                        >
                          <Link2 size={12} className="mr-1" />
                          Copy
                        </Button>
                      ))}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="p-4 text-center text-primary-600"
                >
                  Belum ada seminar dengan dosen eksternal.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {paginatedSeminars.length > 0 ? (
          paginatedSeminars.map((seminar: Seminar) => {
            const externalAdvisors = seminar.advisors.filter(
              (advisor) => advisor.externalLecturer
            );
            return (
              <Card
                key={seminar.id}
                className="overflow-hidden gap-2 border-l-4 border-l-jewel-purple hover:shadow-md transition-all duration-200"
              >
                <CardHeader className="pb-0">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium line-clamp-2">
                      {seminar.title.replace(/\n/g, " ")}
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
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={12} className="text-primary-600" />
                      <span className="text-xs">
                        {seminar.room || "Belum ditentukan"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users size={12} className="text-primary-600" />
                      <div>
                        {externalAdvisors.map((advisor, idx) => (
                          <span key={idx} className="text-xs">
                            {advisor.externalLecturer?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadgeType(seminar.status)}>
                        {seminar.status || "Belum Dimulai"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex flex-col gap-2">
                  {seminar.assessmentLinks?.map((link, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => copyAssessmentLink(seminar.id, link.token)}
                    >
                      <Link2 size={12} className="mr-1" />
                      Copy Link Penilaian
                    </Button>
                  ))}
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="p-4 text-center text-primary-600 bg-background rounded-md border">
            Belum ada seminar dengan dosen eksternal.
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

export default TableExternalSeminars;
