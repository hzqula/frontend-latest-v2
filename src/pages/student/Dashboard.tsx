"use client";

import { Link } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useApiData } from "@/hooks/useApiData";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, University, ChevronRight } from "lucide-react";
import StudentLayout from "@/components/layouts/StudentLayout";

const StudentDashboard = () => {
  const { user, token } = useAuth();

  // Fetch seminar data for the logged-in student
  const seminarsQuery = useApiData({
    type: "seminarByStudentNIM",
    param: user?.profile?.nim,
  });

  // Add console log to debug API response
  console.log("API Response:", seminarsQuery.data);

  const isLoading = seminarsQuery.isLoading;
  const isError = seminarsQuery.isError;

  if (isLoading || !token || !user) {
    return (
      <StudentLayout>
        <div className="container mx-auto p-4">
          <div className="text-center text-muted-foreground py-10">
            Memuat data...
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (isError) {
    return (
      <StudentLayout>
        <div className="container mx-auto p-4">
          <div className="text-center text-red-600 py-10">
            Gagal memuat data: {seminarsQuery.error?.message || "Unknown error"}
            <br />
            <Button
              variant="outline"
              onClick={() => seminarsQuery.refetch()}
              className="mt-4"
            >
              Coba Lagi
            </Button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Process the API response data
  const seminarsData = seminarsQuery.data || [];

  // Check if we have any seminars
  const hasSeminars = Array.isArray(seminarsData)
    ? seminarsData.length > 0
    : seminarsData && Object.keys(seminarsData).length > 0;

  // Add debug check for data structure
  if (!hasSeminars) {
    console.log("No seminar data found:", seminarsQuery.data);
  }

  // Find proposal and final seminars
  // If seminarsData is an array, find seminars by type
  let proposalSeminar = null;
  let finalSeminar = null;

  if (Array.isArray(seminarsData)) {
    proposalSeminar = seminarsData.find(
      (seminar) => seminar.type === "PROPOSAL"
    );
    finalSeminar = seminarsData.find((seminar) => seminar.type === "FINAL");
  } else if (seminarsData && typeof seminarsData === "object") {
    // If it's a single object, check its type
    if (seminarsData.type === "PROPOSAL") {
      proposalSeminar = seminarsData;
    } else if (seminarsData.type === "FINAL") {
      finalSeminar = seminarsData;
    }
  }

  // Helper function to format date
  const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Helper function to format time
  const formatTime = (dateString: string | number | Date) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSeminarStatusBadge = (status: any) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge variant="outline" className="bg-slate-100">
            Draft
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Submitted
          </Badge>
        );
      case "SCHEDULED":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            Scheduled
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <StudentLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              Selamat Datang,{" "}
              {user.profile?.name ||
                (proposalSeminar || finalSeminar)?.student?.name ||
                ""}
              !
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              NIM:{" "}
              {user.profile?.nim ||
                (proposalSeminar || finalSeminar)?.student?.nim ||
                ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Proposal Seminar Card */}
          {proposalSeminar ? (
            <Card className="h-full flex flex-col bg-primary-50">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <CardTitle className="text-lg font-medium">
                    Seminar Proposal
                  </CardTitle>
                  <div className="mt-1 sm:mt-0">
                    {getSeminarStatusBadge(proposalSeminar.status)}
                  </div>
                </div>
                <span className="mt-1 font-bold">
                  {proposalSeminar.title || "No title submitted yet"}
                </span>
              </CardHeader>
              <CardContent className="pb-4 text-sm flex-grow">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-4 pt-6">
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                    <span className="text-sm truncate">
                      {proposalSeminar.time
                        ? formatDate(proposalSeminar.time)
                        : "Not scheduled yet"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                    <span className="text-sm">
                      {proposalSeminar.time
                        ? formatTime(proposalSeminar.time)
                        : "TBD"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <University className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                    <span className="text-sm truncate">
                      {proposalSeminar.room || "TBD"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 mt-auto">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/seminar-proposal">
                    Lihat Seminar
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="h-full bg-primary-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">
                  Seminar Proposal
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center min-h-[150px]">
                <p className="text-center text-muted-foreground font-medium">
                  Anda belum mendaftar seminar ini.
                </p>
              </CardContent>
              <CardFooter className="pt-10">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/seminar-proposal">
                    Daftar Seminar
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Final Seminar Card */}
          {finalSeminar ? (
            <Card className="h-full flex flex-col bg-primary-50">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <CardTitle className="text-lg font-medium">
                    Seminar Hasil
                  </CardTitle>
                  <div className="mt-1 sm:mt-0">
                    {getSeminarStatusBadge(finalSeminar.status)}
                  </div>
                </div>
                <span className="mt-1 font-bold">
                  {finalSeminar.title || "No title submitted yet"}
                </span>
              </CardHeader>
              <CardContent className="pb-4 text-sm flex-grow">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-4 pt-6">
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                    <span className="text-sm truncate">
                      {finalSeminar.time
                        ? formatDate(finalSeminar.time)
                        : "Not scheduled yet"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                    <span className="text-sm">
                      {finalSeminar.time
                        ? formatTime(finalSeminar.time)
                        : "TBD"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <University className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                    <span className="text-sm truncate">
                      {finalSeminar.room || "TBD"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 mt-auto">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/seminar-hasil">
                    Lihat Seminar
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="h-full bg-primary-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">
                  Seminar Hasil
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center min-h-[150px]">
                <p className="text-center text-muted-foreground font-medium">
                  Anda belum mendaftar seminar ini.
                </p>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/seminar-hasil">
                    Daftar Seminar
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Advisors */}
          <Card className="h-full bg-primary-50 mb-5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                Dosen Pembimbing
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2 text-sm space-y-4">
              {/* Get advisors from either seminar if available */}
              {(proposalSeminar?.advisors || finalSeminar?.advisors)?.length >
              0 ? (
                (proposalSeminar?.advisors || finalSeminar?.advisors || []).map(
                  (advisor: any, index: any) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-medium">
                            {advisor.lecturer?.name
                              ? advisor.lecturer.name.charAt(0)
                              : "?"}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {advisor.lecturer?.name || "No name"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            NIP:{" "}
                            {advisor.lecturer?.nip ||
                              advisor.lecturerNIP ||
                              "No NIP"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full sm:w-auto mt-2 sm:mt-0 bg-primary-600 text-white hover:bg-primary-300"
                        onClick={() => {
                          const phoneNumber =
                            advisor.lecturer?.phoneNumber ||
                            advisor.lecturerNIP;
                          if (phoneNumber) {
                            // Format phone number: remove spaces, ensure it starts with country code
                            let formattedNumber = phoneNumber.replace(
                              /\s+/g,
                              ""
                            );
                            if (formattedNumber.startsWith("0")) {
                              formattedNumber =
                                "62" + formattedNumber.substring(1);
                            } else if (
                              !formattedNumber.startsWith("+") &&
                              !formattedNumber.startsWith("62")
                            ) {
                              formattedNumber = "62" + formattedNumber;
                            }

                            // Open WhatsApp with the phone number
                            window.open(
                              `https://wa.me/${formattedNumber}`,
                              "_blank"
                            );
                          } else {
                            alert(
                              "No phone number available for this examiner"
                            );
                          }
                        }}
                      >
                        Contact
                      </Button>
                    </div>
                  )
                )
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Belum ada dosen pembimbing yang ditetapkan
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assessors */}
          <Card className="h-full bg-primary-50 mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                Dosen Penguji
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2 text-sm space-y-4">
              {/* Get assessors from either seminar if available */}
              {(proposalSeminar?.assessors || finalSeminar?.assessors)?.length >
              0 ? (
                (
                  proposalSeminar?.assessors ||
                  finalSeminar?.assessors ||
                  []
                ).map((assessor: any, index: any) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-medium">
                          {assessor.lecturer?.name
                            ? assessor.lecturer.name.charAt(0)
                            : "?"}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {assessor.lecturer?.name || "No name"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          NIP:{" "}
                          {assessor.lecturer?.nip ||
                            assessor.lecturerNIP ||
                            "No NIP"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full sm:w-auto mt-2 sm:mt-0 bg-primary-600 text-white hover:bg-primary-300"
                      onClick={() => {
                        const phoneNumber =
                          assessor.lecturer?.phoneNumber ||
                          assessor.lecturerNIP;
                        if (phoneNumber) {
                          // Format phone number: remove spaces, ensure it starts with country code
                          let formattedNumber = phoneNumber.replace(/\s+/g, "");
                          if (formattedNumber.startsWith("0")) {
                            formattedNumber =
                              "62" + formattedNumber.substring(1);
                          } else if (
                            !formattedNumber.startsWith("+") &&
                            !formattedNumber.startsWith("62")
                          ) {
                            formattedNumber = "62" + formattedNumber;
                          }

                          // Open WhatsApp with the phone number
                          window.open(
                            `https://wa.me/${formattedNumber}`,
                            "_blank"
                          );
                        } else {
                          alert("No phone number available for this examiner");
                        }
                      }}
                    >
                      Contact
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Belum ada dosen penguji yang ditetapkan
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
