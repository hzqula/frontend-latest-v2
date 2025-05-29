"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApiData } from "@/hooks/useApiData";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  CheckCircle2,
  Calendar,
  Loader,
  Info,
  Clock,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StudentLayout from "@/components/layouts/StudentLayout";
import { Stepper } from "@/components/Stepper";
import { Link } from "react-router";
import SeminarInvitation from "@/components/SeminarInvitation";
import EvenReport from "@/components/EventReport";
import studentImg from "@/assets/img/student-ill.png";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { Lecturer, RegisterSeminar } from "@/configs/types";
import ModalDetailResearch from "./seminar-proposal/ModalDetailResearch";
import ModalUploadDocuments from "./seminar-proposal/ModalUploadDocuments";
import SeminarStepDetail from "@/components/SeminarStepDetail";

const StudentSeminarProposal = () => {
  const [currentStep, setCurrentStep] = useState<string>("step1");
  const { user, token } = useAuth();
  const lecturersQuery = useApiData({ type: "lecturers" });
  const lecturers = lecturersQuery.data || [];
  const seminarQuery = useApiData({
    type: "seminarByStudentNIM",
    seminarType: "proposal",
    param: user?.profile.nim,
  });

  const [seminar, setSeminar] = useState<RegisterSeminar>({
    id: null,
    title: "",
    student: null,
    status: null,
    advisors: [],
    documents: {
      THESIS_PROPOSAL: { uploaded: false },
      ADVISOR_AVAILABILITY: { uploaded: false },
      KRS: { uploaded: false },
      ADVISOR_ASSISTANCE: { uploaded: false },
      SEMINAR_ATTENDANCE: { uploaded: false },
    },
    time: null,
    room: null,
    assessors: [],
  });

  const requiredDocuments = [
    { id: "THESIS_PROPOSAL", name: "Proposal Tugas Akhir" },
    { id: "ADVISOR_AVAILABILITY", name: "Kesediaan Pembimbing" },
    { id: "KRS", name: "Kartu Rencana Studi" },
    { id: "ADVISOR_ASSISTANCE", name: "Asistensi Pembimbing" },
    { id: "SEMINAR_ATTENDANCE", name: "Kehadiran Seminar" },
  ];

  const [modalResearchDetailOpen, setModalResearchDetailOpen] = useState(false);
  const [modalDocumentUploadOpen, setModalDocumentUploadOpen] = useState(false);
  const [shouldPrint, setShouldPrint] = useState(false);
  const [shouldPrintReport, setShouldPrintReport] = useState(false);

  if (!user || !user.profile?.nim) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    const seminarData = seminarQuery.data;
    console.log("Fetch Seminar Data:", seminarData);

    if (seminarData) {
      setSeminar({
        id: seminarData.id,
        title: seminarData.title,
        student: seminarData.student,
        status: seminarData.status,
        advisors: seminarData.advisors.map(
          (advisor: { lecturer?: Lecturer }) => ({
            lecturerNIP: advisor.lecturer?.name,
            lecturerName: advisor.lecturer?.name,
            profilePicture: advisor.lecturer?.profilePicture,
          })
        ),
        documents: {
          THESIS_PROPOSAL: {
            uploaded: !!seminarData.documents.find(
              (document: any) => document.documentType === "THESIS_PROPOSAL"
            ),
            fileName: seminarData.documents.find(
              (document: any) => document.documentType === "THESIS_PROPOSAL"
            )?.fileName,
            fileURL: seminarData.documents.find(
              (document: any) => document.documentType === "THESIS_PROPOSAL"
            )?.fileURL,
          },
          ADVISOR_AVAILABILITY: {
            uploaded: !!seminarData.documents.find(
              (document: any) =>
                document.documentType === "ADVISOR_AVAILABILITY"
            ),
            fileName: seminarData.documents.find(
              (document: any) =>
                document.documentType === "ADVISOR_AVAILABILITY"
            )?.fileName,
            fileURL: seminarData.documents.find(
              (document: any) =>
                document.documentType === "ADVISOR_AVAILABILITY"
            )?.fileURL,
          },
          KRS: {
            uploaded: !!seminarData.documents.find(
              (document: any) => document.documentType === "KRS"
            ),
            fileName: seminarData.documents.find(
              (document: any) => document.documentType === "KRS"
            )?.fileName,
            fileURL: seminarData.documents.find(
              (document: any) => document.documentType === "KRS"
            )?.fileURL,
          },
          ADVISOR_ASSISTANCE: {
            uploaded: !!seminarData.documents.find(
              (document: any) => document.documentType === "ADVISOR_ASSISTANCE"
            ),
            fileName: seminarData.documents.find(
              (document: any) => document.documentType === "ADVISOR_ASSISTANCE"
            )?.fileName,
            fileURL: seminarData.documents.find(
              (document: any) => document.documentType === "ADVISOR_ASSISTANCE"
            )?.fileURL,
          },
          SEMINAR_ATTENDANCE: {
            uploaded: !!seminarData.documents.find(
              (document: any) => document.documentType === "SEMINAR_ATTENDANCE"
            ),
            fileName: seminarData.documents.find(
              (document: any) => document.documentType === "SEMINAR_ATTENDANCE"
            )?.fileName,
            fileURL: seminarData.documents.find(
              (document: any) => document.documentType === "SEMINAR_ATTENDANCE"
            )?.fileURL,
          },
        },
        time: seminarData.time,
        room: seminarData.room,
        assessors: seminarData.assessors.map(
          (assessor: { lecturer?: Lecturer }) => ({
            lecturerNIP: assessor.lecturer?.nip,
            lecturerName: assessor.lecturer?.name,
            profilePicture: assessor.lecturer?.profilePicture,
          })
        ),
      });

      if (seminar.status === "DRAFT") setCurrentStep("step2");
      else if (seminar.status === "SUBMITTED" || seminar.status === "SCHEDULED")
        setCurrentStep("step3");
      else if (seminar.status === "COMPLETED") setCurrentStep("step4");
      else setCurrentStep("step1");
    }
  }, [seminarQuery.data, modalDocumentUploadOpen]);
  console.log("Current Step:", currentStep);
  console.log("Seminar Status:", seminar.status);

  console.log("Seminar", seminar);
  console.log("Dospem: ", seminar.advisors);

  const allDocumentsUploaded = () =>
    Object.values(seminar.documents).every((doc) => doc.uploaded);

  const steps = [
    "Detail Seminar",
    "Upload Dokumen",
    "Undangan Seminar",
    "Berita Acara",
  ];
  const currentStepIndex = parseInt(currentStep.replace("step", ""), 10);

  const handleNextStep = () => {
    const nextStepNum = currentStepIndex + 1;
    if (nextStepNum <= steps.length) {
      if (currentStep === "step1" && !seminar.title) {
        toast.error("Silakan masukkan detail seminar terlebih dahulu.");
        return;
      }
      if (currentStep === "step2" && !allDocumentsUploaded()) {
        toast.error(
          "Silakan upload semua dokumen yang dibutuhkan terlebih dahulu."
        );
        return;
      }
      if (currentStep === "step3" && seminar.status !== "COMPLETED") {
        toast.error(
          "Seminar belum selesai dinilai oleh semua dosen. Tunggu hingga semua penilaian diserahkan untuk melanjutkan."
        );
        return;
      }
      setCurrentStep(`step${nextStepNum}`);
    }
  };

  const handlePrevStep = () => {
    const prevStepNum = currentStepIndex - 1;
    if (prevStepNum >= 1) {
      setCurrentStep(`step${prevStepNum}`);
    }
  };

  const handlePrintInvitation = async (seminar: RegisterSeminar) => {
    try {
      const dateObj = seminar.time ? new Date(seminar.time) : null;
      const hari = dateObj
        ? dateObj.toLocaleDateString("id-ID", { weekday: "long" })
        : "Tidak diketahui";
      const formattedDate = dateObj
        ? dateObj.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "Belum dijadwalkan";

      const data = {
        student_name: seminar.student?.name || "Tidak diketahui",
        nim: seminar.student?.nim || "Tidak diketahui",
        judul_penelitian: seminar.title || "Tidak diketahui",
        date: formattedDate,
        time: seminar.time ? formatTime(seminar.time) : "Belum dijadwalkan",
        room: seminar.room || "Belum ditentukan",
        ketua_seminar: seminar.advisors[0]?.lecturerName || "Tidak ditentukan",
        pembimbing_1: seminar.advisors[0]?.lecturerName || "Tidak ditentukan",
        pembimbing_2: seminar.advisors[1]?.lecturerName || "Tidak ditentukan",
        penguji_1: seminar.assessors[0]?.lecturerName || "Tidak ditentukan",
        penguji_2: seminar.assessors[1]?.lecturerName || "Tidak ditentukan",
        hari: hari,
      };

      console.log("Data sent to backend:", data);

      const response = await axios.post(
        "http://localhost:5500/api/generate-invitation",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `invitation_${data.student_name.replace(/\s+/g, "_")}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Undangan berhasil diunduh!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ERR_NETWORK") {
          console.error(
            "Network error: Backend server might not be running or port is incorrect."
          );
          toast.error(
            "Gagal terhubung ke server. Pastikan server backend berjalan di port 5500."
          );
        } else {
          console.error("Error downloading invitation:", error.message);
          toast.error("Gagal mengunduh undangan: " + error.message);
        }
      } else {
        console.error("Unexpected error:", error);
        toast.error("Terjadi kesalahan tak terduga. Silakan coba lagi.");
      }
    }
  };

  const handlePrintReport = () => {
    setShouldPrintReport(true);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Belum ditentukan";
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string | null): string => {
    if (!dateString) return "Belum ditentukan";
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const progressPercentage =
    {
      DRAFT: 25,
      SUBMITTED: 50,
      SCHEDULED: 75,
      COMPLETED: 100,
    }[seminar.status!] || 0;

  return (
    <StudentLayout>
      <div className="flex flex-col mb-4">
        <h1 className="text-xl md:text-4xl font-heading font-black mb-3 text-env-darker">
          Pendaftaran Seminar Proposal
        </h1>
      </div>
      <div className="grid grid-cols-1 auto-rows-[minmax(160px,_auto)] sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="col-span-1 sm:col-span-2 lg:col-span-2 py-4 px-8 row-span-2 border-2 border-pastel-green relative overflow-hidden rounded-xl bg-env-light">
          <img
            src={studentImg}
            alt="student"
            className="absolute right-0 -bottom-10 w-32 md:w-48 opacity-80"
          />
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex justify-between items-center">
              <h1 className="text-lg font-heading font-bold text-primary-foreground">
                Hai, {user.profile.name}
              </h1>
              <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-yellow">
                <Info className="text-jewel-yellow w-4 md:w-6 h-4 md:h-6" />
              </div>
            </div>
            <p className="text-env-darker text-lg font-semibold">
              {seminar.status === null || seminar.status === undefined
                ? "Anda belum mendaftar seminar."
                : seminar.status === "DRAFT"
                ? "Silakan mengupload dokumen agar seminar Anda dapat diproses lebih lanjut."
                : seminar.status === "SUBMITTED"
                ? "Seminar anda menunggu untuk dijadwalkan."
                : seminar.status === "SCHEDULED" && seminar.time
                ? (() => {
                    const today = new Date();
                    const seminarDate = new Date(seminar.time!);
                    const diffTime = seminarDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24)
                    );
                    if (diffDays === 0) {
                      return "Semangat untuk seminar hari ini!";
                    } else if (diffDays > 0) {
                      return `Seminar Anda sudah dijadwalkan, ${diffDays} hari lagi seminar Anda dimulai. Silakan unduh undangan seminar.`;
                    } else {
                      return "Seminar Anda sudah dijadwalkan. Silakan unduh undangan seminar.";
                    }
                  })()
                : seminar.status === "COMPLETED"
                ? "Seminar anda telah selesai. Silakan unduh Berita Acara."
                : "Status seminar belum diketahui."}
            </p>
          </div>
        </Card>
        <Card className="col-span-1 row-span-1 gap-0 px-8 py-4 bg-env-darker overflow-hidden relative">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-env-light">
              Jadwal Seminar
            </h1>
            <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-red">
              <Clock className="text-jewel-red w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
          {seminar ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={12} className="text-primary-foreground" />
                <div>
                  <span className="text-sm text-primary-foreground">
                    {formatDate(seminar?.time)}
                  </span>
                  <span className="text-sm text-muted ml-2">
                    Jam {formatTime(seminar?.time)} WIB
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-primary-foreground" />
                <span className="text-sm text-primary-foreground">
                  {seminar.room || "Belum ditentukan"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-center text-primary">Belum ditentukan.</p>
          )}
        </Card>
        <Card className="col-span-1 row-span-1 gap-0 px-8 py-4 bg-background overflow-hidden relative">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-muted-foreground">
              Hari & Tanggal
            </h1>
            <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-purple">
              <Calendar className="text-jewel-purple w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
          <p className="-mt-2 text-env-darker font-bold md:text-2xl text-xl">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </Card>
        <Card className="col-span-1 sm:col-span-2 lg:col-span-2 row-span-1 gap-0 px-8 py-4 bg-background overflow-hidden relative">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-muted-foreground">
              Status Seminar Anda
            </h1>
            <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-green">
              <Loader className="text-jewel-yellbg-pastel-green w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
          <div className="w-4/5 bg-pastel-green rounded-full h-2.5">
            <div
              className="bg-jewel-green h-2.5 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex flex-1 w-full justify-end items-end">
            <Badge className="md:h-6 h-4 md:text-xs text-[8px] bg-pastel-blue text-jewel-blue">
              {seminar.status || "Belum Dimulai"}
            </Badge>
          </div>
        </Card>
        <Stepper
          steps={steps}
          currentStep={currentStepIndex}
          className="col-span-1 sm:col-span-2 lg:col-span-4"
        />

        {seminarQuery.isLoading && <div>Loading seminar data...</div>}
        {seminarQuery.error && (
          <div>
            Error loading seminar: {(seminarQuery.error as Error).message}
          </div>
        )}

        {currentStep === "step1" && (
          <Card className="bg-white col-span-1 sm:col-span-2 lg:col-span-4 overflow-hidden">
            <div className="relative bg-gradient-to-r from-env-base to-env-darker">
              <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>

              <CardHeader className="relative z-10">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl md:text-2xl -mb-1 font-heading font-bold text-primary-foreground">
                    Detail Seminar
                  </CardTitle>
                </div>
                <CardDescription className="text-primary-foreground text-xs md:text-sm">
                  Masukkan judul penelitian dan dosen pembimbing Anda.
                </CardDescription>
              </CardHeader>
            </div>
            <CardContent>
              {seminar.title ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs md:text-sm font-medium font-heading text-muted-foreground">
                      Judul Penelitian
                    </h3>
                    <p className="text-env-darker text-sm md:text-base font-bold">
                      {seminar.title}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-medium font-heading text-muted-foreground mb-2">
                      Dosen Pembimbing
                    </h3>
                    <div className="md:flex-row flex flex-col md:gap-12 md:items-center">
                      {seminar.advisors.map((advisor, index) => (
                        <div
                          key={index}
                          className="flex md:border-l-2 border-env-light rounded-md items-center md:px-4 pb-1 space-x-2"
                        >
                          <Avatar>
                            <AvatarImage
                              src={
                                advisor.profilePicture
                                  ? advisor.profilePicture
                                  : `https://robohash.org/${advisor.lecturerName}`
                              }
                              alt="advisor-image"
                              className="border rounded-full h-8 w-8 md:h-12 md:w-12"
                            />
                          </Avatar>
                          <div>
                            <div className="text-xs md:text-sm font-medium text-env-darker">
                              {advisor.lecturerName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {advisor.lecturerNIP}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-primary-600 mb-4">
                    Silakan masukkan detail seminar terlebih dahulu untuk
                    diproses.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <div className="space-x-2">
                <Button
                  onClick={() => setModalResearchDetailOpen(true)}
                  disabled={seminar.status === "SCHEDULED"}
                  variant="outline"
                >
                  {seminar.title
                    ? "Perbarui Detail Seminar"
                    : "Masukkan Detail Seminar"}
                </Button>
                <Button onClick={handleNextStep}>Lanjut</Button>
              </div>
            </CardFooter>
          </Card>
        )}

        {currentStep === "step2" && (
          <Card className="bg-white col-span-1 sm:col-span-2 lg:col-span-4 overflow-hidden">
            <div className="relative bg-gradient-to-r from-env-base to-env-darker">
              <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>

              <CardHeader className="relative z-10">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl md:text-2xl -mb-1 font-heading font-bold text-primary-foreground">
                    Dokumen yang Dibutuhkan
                  </CardTitle>
                </div>
                <CardDescription className="text-primary-foreground text-xs md:text-sm">
                  Upload semua dokumen yang dibutuhkan untuk seminar proposal.
                </CardDescription>
              </CardHeader>
            </div>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(seminar.documents).map(([key, doc]) => {
                    const reqDoc = requiredDocuments.find((d) => d.id === key);
                    return (
                      <div key={key} className="flex flex-col">
                        <div className="flex items-center gap-2">
                          {doc.uploaded ? (
                            <CheckCircle2 className="h-5 w-5 text-primary-600" />
                          ) : (
                            <Upload className="h-5 w-5 text-env-darker" />
                          )}
                          <h1 className="font-bold text-sm md:text-lg font-heading text-env-darker">
                            {reqDoc ? reqDoc.name : key}
                          </h1>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-primary-600" />
                          <span className="text-xs md:text-sm text-env-darker">
                            {doc.uploaded ? doc.fileName : "Belum diunggah"}
                          </span>
                          {doc.uploaded && doc.fileURL && (
                            <Button
                              variant="link"
                              size="sm"
                              className="text-primary-600 hover:text-env-darker p-0"
                            >
                              <Link
                                to={doc.fileURL}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Lihat File
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!allDocumentsUploaded() && (
                  <div className="mt-4">
                    <h3 className="text-sm md:text-base font-medium font-heading text-muted-foreground mb-2">
                      Dokumen yang Belum Diunggah:
                    </h3>
                    <ul className="list-disc pl-5 text-env-darker text-sm md:text-base">
                      {Object.entries(seminar.documents)
                        .filter(([_, doc]) => !doc.uploaded)
                        .map(([key, _]) => {
                          const reqDoc = requiredDocuments.find(
                            (d) => d.id === key
                          );
                          return (
                            <li key={key}>{reqDoc ? reqDoc.name : key}</li>
                          );
                        })}
                    </ul>
                  </div>
                )}

                {allDocumentsUploaded() && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary-600" />
                    <p className="text-env-darker text-sm md:text-base">
                      Semua dokumen yang dibutuhkan sudah berhasil diunggah.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="md:hidden flex-col flex gap-2">
              <Button
                onClick={() => setModalDocumentUploadOpen(true)}
                disabled={seminar.status === "SCHEDULED"}
                variant="outline"
                className="border-2 border-primary text-env-darker w-full"
              >
                {allDocumentsUploaded() ? "Perbarui Dokumen" : "Unggah Dokumen"}
              </Button>
              <div className="w-full gap-2 flex items-center">
                <Button
                  variant="secondary"
                  onClick={handlePrevStep}
                  className="flex-0 min-w-[120px]"
                >
                  Kembali
                </Button>
                <Button onClick={handleNextStep} className="flex-1">
                  Lanjut
                </Button>
              </div>
            </CardFooter>
            <CardFooter className="md:flex justify-between hidden">
              <Button
                variant="secondary"
                onClick={handlePrevStep}
                className="border-env-lighter text-primary-700 hover:bg-accent hover:text-accent-foreground"
              >
                Kembali
              </Button>
              <div className="space-x-2">
                <Button
                  onClick={() => setModalDocumentUploadOpen(true)}
                  disabled={seminar.status === "SCHEDULED"}
                  variant="outline"
                  className="border-2 border-primary text-env-darker"
                >
                  {allDocumentsUploaded()
                    ? "Perbarui Dokumen"
                    : "Unggah Dokumen"}
                </Button>
                <Button onClick={handleNextStep}>Lanjut</Button>
              </div>
            </CardFooter>
          </Card>
        )}

        {currentStep === "step3" && (
          <SeminarStepDetail
            step="step3"
            seminar={seminar}
            onPrevStep={handlePrevStep}
            onNextStep={handleNextStep}
            handlePrint={handlePrintInvitation}
            status={seminar.status}
          />
        )}

        {currentStep === "step4" && (
          <SeminarStepDetail
            step="step4"
            seminar={seminar}
            onPrevStep={handlePrevStep}
            onNextStep={handleNextStep}
            handlePrint={handlePrintReport}
            status={seminar.status}
          />
        )}
      </div>

      <ModalDetailResearch
        open={modalResearchDetailOpen}
        onOpenChange={setModalResearchDetailOpen}
        initialData={{
          researchTitle: seminar.title,
          advisor1: seminar.advisors[0]?.lecturerNIP,
          advisor2: seminar.advisors[1]?.lecturerNIP || "",
        }}
        user={user}
        token={token}
        lecturers={lecturers}
        seminar={seminar}
        setSeminar={setSeminar}
        setCurrentStep={setCurrentStep}
        seminarQuery={seminarQuery}
      />
      <ModalUploadDocuments
        open={modalDocumentUploadOpen}
        onOpenChange={setModalDocumentUploadOpen}
        initialData={Object.fromEntries(
          Object.entries(seminar.documents).map(([key, _]) => [key, null])
        )}
        uploadedStatus={Object.fromEntries(
          Object.entries(seminar.documents).map(([key, doc]) => [
            key,
            doc.uploaded,
          ])
        )}
        seminarId={seminar.id}
      />

      <SeminarInvitation
        seminar={seminar}
        shouldPrint={shouldPrint}
        onPrintComplete={() => setShouldPrint(false)}
      />
      <EvenReport
        seminar={seminar}
        shouldPrint={shouldPrintReport}
        onPrintComplete={() => setShouldPrintReport(false)}
      />
    </StudentLayout>
  );
};

export default StudentSeminarProposal;
