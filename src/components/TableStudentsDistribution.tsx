"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Student } from "@/configs/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Contact,
  ListOrdered,
  Copy,
  CopyCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface TableStudentsDistributionProps {
  data: Student[];
}

const TableStudentsDistribution: React.FC<TableStudentsDistributionProps> = ({
  data,
}) => {
  const [searchStudent, setSearchStudent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);
  const [copied, setCopied] = useState<string | null>(null); // Keep as string | null

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    return data.filter(
      (student) =>
        student.name?.toLowerCase().includes(searchStudent.toLowerCase()) ||
        student.nim?.toLowerCase().includes(searchStudent.toLowerCase()) ||
        (typeof student.semester === "number" &&
          student.semester.toString().includes(searchStudent))
    );
  }, [data, searchStudent]);

  // Handle copy with check for undefined phoneNumber
  const handleCopy = (phoneNumber: string | undefined, id: number | string | null) => {
    if (phoneNumber) {
      navigator.clipboard.writeText(phoneNumber);
      setCopied(id?.toString() || null); // Convert id to string for consistency
      setTimeout(() => setCopied(null), 2000);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  // Change page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Reset to first page when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchStudent]);

  // Calculate page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (endPage - startPage < maxPagesToShow - 3) {
        if (currentPage < totalPages / 2) {
          endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 3);
        } else {
          startPage = Math.max(2, endPage - (maxPagesToShow - 3));
        }
      }

      if (startPage > 2) {
        pageNumbers.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="space-y-4">
      {/* Search and Items per page controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 p-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari mahasiswa berdasarkan nama | nim | semester"
            className="pl-8"
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
          />
        </div>
        <Select
          value={studentsPerPage.toString()}
          onValueChange={(value) => {
            setStudentsPerPage(Number(value));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="10 per halaman" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table for md and up */}
      <div className="hidden md:block h-96 overflow-x-auto border border-border rounded-md">
        <Table className="bg-background">
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="text-center">No.</TableHead>
              <TableHead>Nama Mahasiswa</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Kontak</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentStudents.length > 0 ? (
              currentStudents.map((student, index) => (
                <TableRow
                  key={student.id || index}
                  className="border-b border-border"
                >
                  <TableCell className="text-center">
                    {indexOfFirstStudent + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Avatar>
                        <AvatarImage
                          src={
                            student.profilePicture
                              ? student.profilePicture
                              : `https://robohash.org/${student.name}`
                          }
                          alt="student-image"
                          className="border rounded-full h-8 w-8 md:h-12 md:w-12"
                        />
                        <AvatarFallback className="bg-primary-100 text-env-darker">
                          {student.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{student.name || "N/A"}</div>
                        <div className="text-muted-foreground">
                          {student.nim || "N/A"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-light">
                    {student.semester || "N/A"}
                  </TableCell>
                  <TableCell className="font-light">
                    {student.phoneNumber || "N/A"}
                    <button
                      onClick={() =>
                        handleCopy(student.phoneNumber, student.id)
                      }
                      className="ml-4 p-1 text-xs text-primary-600 hover:text-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-300 rounded"
                      aria-label="Copy phone number"
                    >
                      {copied === student.id?.toString() ? (
                        <span className="flex items-center">
                          <CopyCheck className="h-3.5 w-3.5 mr-1" />
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Copy className="h-3.5 w-3.5 mr-1" />
                        </span>
                      )}
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="p-4 text-center text-muted-foreground"
                >
                  {searchStudent
                    ? "Tidak ada mahasiswa yang ditemukan."
                    : "Tidak ada mahasiswa saat ini."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Card view for small screens */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {currentStudents.length > 0 ? (
          currentStudents.map((student, index) => (
            <Card
              key={student.id || index}
              className="overflow-hidden gap-2 border-l-4 border-l-jewel-blue hover:shadow-md transition-all duration-200"
            >
              <CardHeader className="pb-0 flex items-center gap-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-medium line-clamp-2">
                    {student.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <ListOrdered size={12} className="text-primary-600" />
                    <div>
                      <span className="text-xs">Semester</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        {student.semester || "Tidak ada"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Contact size={12} className="text-primary-600" />
                    <div>
                      <span className="text-xs">Kontak</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        {student.phoneNumber || "Tidak ada"}
                        <button
                          onClick={() =>
                            handleCopy(student.phoneNumber, student.id)
                          }
                          className="ml-2 p-1 text-xs text-primary-600 hover:text-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-300 rounded"
                          aria-label="Copy phone number"
                        >
                          {copied === student.id?.toString() ? (
                            <CopyCheck className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="p-4 text-center text-primary-600 bg-background rounded-md border">
            {searchStudent
              ? "Tidak ada mahasiswa yang ditemukan."
              : "Tidak ada mahasiswa saat ini."}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredStudents.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="text-xs text-muted-foreground">
            Menampilkan {indexOfFirstStudent + 1}-
            {Math.min(indexOfLastStudent, filteredStudents.length)} dari{" "}
            {filteredStudents.length} mahasiswa
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 flex items-center justify-center"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={`page-${page}`}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(Number(page))}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 flex items-center justify-center"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableStudentsDistribution;