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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface TableLecturersDistributionProps {
  data: LecturerSeminarData[];
}

const TableLecturersDistribution: React.FC<TableLecturersDistributionProps> = ({
  data,
}) => {
  return (
    <div className="hidden md:block h-96 overflow-x-auto border border-border ">
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
                  <div className="flex  gap-2">
                    <Avatar>
                      <AvatarImage
                        src={
                          lecturer.profilePicture
                            ? lecturer.profilePicture
                            : `https://robohash.org/${lecturer.name}`
                        }
                        alt="advisor-image"
                        className="border rounded-full h-8 w-8 md:h-12 md:w-12"
                      />
                      <AvatarFallback className="bg-primary-100 text-env-darker">
                        {lecturer
                          .name!.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{lecturer.name || "N/A"}</div>
                      <div className="text-muted-foreground">
                        {lecturer.nip || "N/A"}
                      </div>
                    </div>
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
