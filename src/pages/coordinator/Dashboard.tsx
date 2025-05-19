"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useApiData } from "@/hooks/useApiData";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Seminar, Lecturer, LecturerSeminarData } from "@/configs/types";
import CoordinatorLayout from "@/components/layouts/CoordinatorLayout";
import { File, Folder, User, User2 } from "lucide-react";
import LineChartSeminars from "@/components/LineChartSeminars";
import TableLecturersDistribution from "@/components/TableLecturersDistribution";

const CoordinatorDashboard = () => {
  const { user, token } = useAuth();
  const studentsQuery = useApiData({ type: "students" });
  const lecturersQuery = useApiData({ type: "lecturers" });
  const seminarsQuery = useApiData({ type: "seminars" });

  const isLoading = studentsQuery.isLoading || seminarsQuery.isLoading;
  const isError = studentsQuery.isError || seminarsQuery.isError;

  if (isLoading || !token || !user) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-muted-foreground py-10">
          Memuat data...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-red-600 py-10">
          Gagal memuat data. Silakan coba lagi nanti.
        </div>
      </div>
    );
  }

  const students = studentsQuery.data || [];
  const lecturers = lecturersQuery.data || [];
  const seminars = seminarsQuery.data || [];

  const resultSeminars = seminars.filter(
    (seminar: Seminar) => seminar.type === "HASIL"
  );

  const proposalSeminars = seminars.filter(
    (seminar: Seminar) => seminar.type === "PROPOSAL"
  );

  // Filter seminar dengan status "SCHEDULED"
  const scheduledSeminars = seminars.filter(
    (seminar: Seminar) => seminar.status === "SCHEDULED"
  );

  // Proses data untuk tabel: jumlah seminar yang dibimbing dan diuji per dosen
  const lecturerSeminarData: LecturerSeminarData[] = lecturers.map(
    (lecturer: Lecturer) => {
      // Jumlah seminar yang dibimbing (advisors)
      const advisedCount = scheduledSeminars.filter((seminar: Seminar) =>
        seminar.advisors.some(
          (advisor) => advisor.lecturer?.nip === lecturer.nip
        )
      ).length;

      // Jumlah seminar yang diuji (assessors)
      const assessedCount = scheduledSeminars.filter((seminar: Seminar) =>
        seminar.assessors.some(
          (assessor) => assessor.lecturer?.nip === lecturer.nip
        )
      ).length;

      return {
        name: lecturer.name,
        nip: lecturer.nip,
        phoneNumber: lecturer.phoneNumber,
        advised: advisedCount,
        assessed: assessedCount,
      };
    }
  );

  console.log("Lecturer: ", lecturers);
  console.log("Lecturers: ", lecturerSeminarData);

  return (
    <CoordinatorLayout>
      {/* Header */}
      <div className="flex flex-col mb-4">
        <h1 className="text-xl md:text-4xl font-heading font-black text-env-darker">
          Dashboard
        </h1>
        <p className="text-primary md:text-base text-sm">
          Assalamu'alaikum, selamat datang {user.profile.name}
        </p>
      </div>
      <div className="grid grid-cols-1 auto-rows-[minmax(160px,_auto)] sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="col-span-1 row-span-1 justify-between gap-0 px-8 py-4 bg-background overflow-hidden relative">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-muted-foreground">
              Mahasiswa
            </h1>
            <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-purple">
              <User2 className="text-jewel-purple w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
          <p className="-mt-2 text-env-darker font-bold md:text-4xl text-3xl">
            {students.length}
          </p>
          <CardFooter className="p-0 text-sm text-muted-foreground">
            Jumlah mahasiswa TA yang terdaftar di sistem
          </CardFooter>
        </Card>

        <Card className="col-span-1 row-span-1 justify-between gap-0 px-8 py-4 bg-background overflow-hidden relative">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-muted-foreground">
              Dosen
            </h1>
            <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-yellow">
              <User className="text-jewel-yellow w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
          <p className="-mt-2 text-env-darker font-bold md:text-4xl text-3xl">
            {lecturers.length}
          </p>
          <CardFooter className="p-0 text-muted-foreground text-sm">
            Jumlah dosen yang terdaftar di sistem
          </CardFooter>
        </Card>

        <Card className="col-span-1 row-span-1 justify-between gap-0 px-8 py-4 bg-background overflow-hidden relative">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-muted-foreground">
              Seminar Proposal
            </h1>
            <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-blue">
              <File className="text-jewel-blue w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
          <p className="-mt-2 text-env-darker font-bold md:text-4xl text-3xl">
            {proposalSeminars.length}
          </p>
          <CardFooter className="text-sm p-0 text-muted-foreground">
            Jumlah seminar proposal yang terdaftar di sistem
          </CardFooter>
        </Card>

        <Card className="col-span-1 row-span-1 justify-between gap-0 px-8 py-4 bg-background overflow-hidden relative">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-muted-foreground">
              Seminar Hasil
            </h1>
            <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-green">
              <Folder className="text-jewel-green w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
          <p className="-mt-2 text-env-darker font-bold md:text-4xl text-3xl">
            {resultSeminars.length}
          </p>
          <CardFooter className="text-sm p-0 text-muted-foreground">
            Jumlah seminar hasil yang terdaftar di sistem
          </CardFooter>
        </Card>

        <Card className="bg-white sm:col-span-2 overflow-hidden">
          <CardHeader className="bg-env-darker">
            <CardTitle className="text-xl md:text-2xl -mb-1 font-heading font-bold text-primary-foreground">
              Tren Seminar
            </CardTitle>
            <CardDescription className="text-primary-foreground text-sm">
              Jumlah seminar dalam satu bulan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartSeminars seminars={seminars} />
          </CardContent>
        </Card>

        <Card className="bg-white sm:col-span-2 gap-0 border-env-darker border">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl -mb-1 font-heading font-bold text-primary">
              Dosen
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Sebaran seminar yang dibimbing dan diuji
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TableLecturersDistribution data={lecturerSeminarData} />
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {lecturerSeminarData.length > 0 ? (
                lecturerSeminarData.map((lecturer, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden gap-2 border-l-4 border-l-jewel-blue hover:shadow-md transition-all duration-200"
                  >
                    <CardHeader className="pb-0">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-medium line-clamp-2">
                          {lecturer.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <User size={12} className="text-primary-600" />
                          <div>
                            <span className="text-xs">Seminar Dibimbing</span>
                            <span className="text-muted-foreground text-xs ml-2">
                              {lecturer.advised}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={12} className="text-primary-600" />
                          <div>
                            <span className="text-xs">Seminar Diuji</span>
                            <span className="text-muted-foreground text-xs ml-2">
                              {lecturer.assessed}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="p-4 text-center text-primary-600 bg-background rounded-md border">
                  Tidak ada seminar yang dijadwalkan saat ini.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </CoordinatorLayout>
  );
};

export default CoordinatorDashboard;
