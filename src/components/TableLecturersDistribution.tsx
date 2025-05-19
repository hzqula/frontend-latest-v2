"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LecturerSeminarData } from "@/configs/types";

interface TableLecturersDistributionProps {
  data: LecturerSeminarData[];
}

const TableLecturersDistribution: React.FC<TableLecturersDistributionProps> = ({
  data,
}) => {
  console.log(data);

  return (
    <div className="hidden md:block rounded-sm overflow-x-auto border border-border">
      <Table className="bg-background">
        <TableHeader>
          <TableRow className="text-xs">
            <TableHead className="text-center">No.</TableHead>
            <TableHead>Nama Dosen</TableHead>
            <TableHead>Kontak</TableHead>
            <TableHead className="text-center">Dibimbing</TableHead>
            <TableHead className="text-center px-2">Diuji</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((lecturer, index) => (
              <TableRow key={index} className="border-b border-border">
                <TableCell className="text-center">{index + 1}</TableCell>
                <TableCell>
                  <div>{lecturer.name || "N/A"}</div>
                  <div className="text-muted-foreground">
                    {lecturer.nip || "N/A"}
                  </div>
                </TableCell>
                <TableCell className="font-light">
                  {lecturer.phoneNumber}
                </TableCell>
                <TableCell className="text-center">
                  {lecturer.advised}
                </TableCell>
                <TableCell className="text-center px-10">
                  {lecturer.assessed}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={4}
                className="p-4 text-center text-primary-600"
              >
                Tidak ada seminar yang dijadwalkan saat ini.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableLecturersDistribution;
