"use client";
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
import { SecurityLogs } from "@/configs/types"; // Pastikan interface SecurityLogs diimpor dari file yang tepat

interface TableSecurityLogProps {
  logs: SecurityLogs[];
  formatDate: (dateString: string) => string;
  getLogBadgeType: (
    action: string
  ) => "info" | "warning" | "danger" | "success";
  totalPages: number;
  currentPage: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

const LogBadge: React.FC<{
  type: "info" | "warning" | "danger" | "success";
  text: string;
}> = ({ type, text }) => {
  const colorClasses = {
    info: "bg-blue-100 text-blue-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    success: "bg-green-100 text-green-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[type]}`}
    >
      {text}
    </span>
  );
};

const TableSecurityLog = ({
  logs,
  formatDate,
  getLogBadgeType,
  totalPages,
  currentPage,
  perPage,
  onPageChange,
}: TableSecurityLogProps) => {
  const handlePageClick = (pageNumber: number, e: React.MouseEvent) => {
    e.preventDefault();
    onPageChange(pageNumber);
  };

  return (
    <>
      <div className="hidden md:block rounded-sm overflow-x-auto border border-border">
        <Table className="bg-background">
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="text-center">No.</TableHead>
              <TableHead>Kapan?</TableHead>
              <TableHead>Pengguna</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
              <TableHead className="text-center">Alamat IP</TableHead>
              <TableHead>Perangkat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log, index) => {
                const startIndex = (currentPage - 1) * perPage;
                const isThreat =
                  log.action.toLowerCase().includes("injection") ||
                  log.action.toLowerCase().includes("attack");

                return (
                  <TableRow
                    key={log.id}
                    className={isThreat ? "bg-destructive/50" : ""}
                  >
                    <TableCell className="font-medium text-center">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                    <TableCell>
                      <div>{log.user?.email || "Unknown"}</div>
                      <div className="text-muted-foreground">
                        {log.user?.email.endsWith("@student.unri.ac.id")
                          ? "STUDENT"
                          : log.user?.email.endsWith("@lecturer.unri.ac.id")
                          ? "LECTURER"
                          : "COORDINATOR"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <LogBadge
                        type={getLogBadgeType(log.action)}
                        text={log.action}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {log.ipAddress}
                    </TableCell>
                    <TableCell>{log.device}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="p-4 text-center text-primary-600"
                >
                  Tidak ada log yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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

export default TableSecurityLog;
