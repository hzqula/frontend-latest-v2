import { useState, useEffect } from "react";
import { useParams } from "react-router";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext"; // Untuk mendapatkan token
import {
  Calendar,
  Clock,
  Glasses,
  GraduationCap,
  MapPin,
  User,
} from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Seminar } from "@/configs/types";
import { toast } from "react-toastify";
import CoordinatorLayout from "@/components/layouts/CoordinatorLayout";
import TableSeminarAssessmentDetail from "@/components/TableSeminarAssessmentDetail";

const SeminarAssessmentDetail = () => {
  const { seminarId } = useParams<{ seminarId: string }>();
  const { token } = useAuth();
  const [seminar, setSeminar] = useState<Seminar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk mengambil data seminar berdasarkan seminarId
  useEffect(() => {
    const fetchSeminar = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5500/api/seminars/${seminarId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setSeminar(response.data.seminar);
        } else {
          setError("Gagal mengambil data seminar.");
          toast.error("Gagal mengambil data seminar.");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat mengambil data seminar.");
        toast.error("Terjadi kesalahan saat mengambil data seminar.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (seminarId && token) {
      fetchSeminar();
    }
  }, [seminarId, token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !seminar) {
    return <div>Error: {error || "Seminar tidak ditemukan."}</div>;
  }

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

  return (
    <CoordinatorLayout>
      <div className="space-y-6">
        {/* Card Detail Seminar */}
        <Card className="bg-white col-span-1 sm:col-span-2 lg:col-span-4 overflow-hidden">
          <div className="relative bg-gradient-to-r from-env-base to-env-darker">
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
            <CardHeader className="relative pb-4 pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <Badge className="bg-pastel-green text-jewel-green mb-2">
                    Seminar {seminar.type === "PROPOSAL" ? "Proposal" : "Hasil"}
                  </Badge>
                  <CardTitle className="text-lg md:text-2xl mb-1 font-heading font-bold text-primary-foreground">
                    {seminar.title}
                  </CardTitle>
                  <div className="text-primary-100 mt-1">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 md:h-4 w-3 md:w-4" />
                        <span className="text-[10px] md:text-xs">
                          {formatDate(seminar.time)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 md:h-4 w-3 md:w-4" />
                        <span className="text-[10px] md:text-xs">
                          {formatTime(seminar.time)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 md:h-4 w-3 md:w-4" />
                        <span className="text-[10px] md:text-xs">
                          {seminar.room}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </div>

          <CardContent className="p-6 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Bagian Mahasiswa */}
              <div className="flex col-span-1 md:col-span-2 lg:col-span-2 items-center justify-start md:justify-center space-x-4">
                <Avatar className="size-10 md:size-14 border-2 border-primary">
                  <AvatarImage
                    src={
                      seminar.student?.profilePicture
                        ? seminar.student?.profilePicture
                        : "https://robohash.org/mail@ashallendesign.co.uk"
                    }
                    alt="student-image"
                  />
                </Avatar>
                <div>
                  <div className="flex items-center">
                    <User className="mr-1.5 h-4 w-4 text-muted-foreground" />
                    <h3 className="text-xs md:text-sm font-medium font-heading text-muted-foreground">
                      Mahasiswa
                    </h3>
                  </div>
                  <div>
                    <p className="text-env-darker text-sm md:text-base font-bold">
                      {seminar.student?.name}
                    </p>
                    <p className="text-muted-foreground text-xs md:text-sm font-medium">
                      {seminar.student?.nim}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bagian Dosen Pembimbing dan Penguji */}
              <div className="space-y-6 md:col-span-2 md:justify-center lg:col-span-2 flex flex-col md:flex-row md:gap-8">
                <div>
                  <div className="flex items-center mb-2">
                    <GraduationCap className="mr-1.5 h-4 w-4 text-muted-foreground" />
                    <h3 className="text-xs md:text-sm font-medium font-heading text-muted-foreground">
                      Pembimbing
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {seminar.advisors.map((advisor, index) => (
                      <div
                        key={index}
                        className="flex items-center pb-1 rounded-md w-full md:w-auto"
                      >
                        <Avatar className="mr-2 border border-primary size-8 md:size-10">
                          <AvatarImage
                            src={
                              advisor.lecturer?.profilePicture
                                ? advisor.lecturer?.profilePicture
                                : `https://robohash.org/${advisor.lecturer?.name}`
                            }
                            alt="advisor-image"
                          />
                          <AvatarFallback className="bg-primary-100 text-primary-800">
                            {advisor.lecturer?.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-xs md:text-sm font-medium text-env-darker">
                            {advisor.lecturer?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {advisor.lecturer?.nip}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Glasses className="mr-1.5 h-4 w-4 text-muted-foreground" />
                    <h3 className="text-xs md:text-sm font-medium font-heading text-muted-foreground">
                      Penguji
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {seminar.assessors.map((assessor, index) => (
                      <div
                        key={index}
                        className="flex items-center pb-1 rounded-md w-full md:w-auto"
                      >
                        <Avatar className="mr-2 border border-primary size-8 md:size-10">
                          <AvatarImage
                            src={
                              assessor.lecturer?.profilePicture
                                ? assessor.lecturer?.profilePicture
                                : `https://robohash.org/${assessor.lecturer?.name}`
                            }
                            alt="assessor-image"
                          />
                          <AvatarFallback className="bg-primary-100 text-primary-800">
                            {assessor.lecturer?.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-xs md:text-sm font-medium text-env-darker">
                            {assessor.lecturer?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {assessor.lecturer?.nip}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabel Penilaian */}
        <TableSeminarAssessmentDetail
          seminar={seminar}
          formatDate={formatDate}
          formatTime={formatTime}
        />
      </div>
    </CoordinatorLayout>
  );
};

export default SeminarAssessmentDetail;
