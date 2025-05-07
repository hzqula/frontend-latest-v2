"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useApiData } from "../../../hooks/useApiData";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Loader,
  Info,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";
import { Badge } from "../../../components/ui/badge";
import ResearchDetailsModal from "./ResearchDetail";
import DocumentUploadModal from "./DocumentUpload";
import StudentLayout from "../../../components/layouts/StudentLayout";
import { Stepper } from "../../../components/Stepper";
import { Link } from "react-router";
import SeminarInvitation from "../../../components/SeminarInvitation";
import studentImg from "@/assets/img/student-ill.png";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

export interface Seminar {
  id: number | null;
  title: string;
  student?: {
    nim: string;
    name: string;
  } | null;
  status: "DRAFT" | "SUBMITTED" | "SCHEDULED" | "COMPLETED" | null;
  advisors: {
    lecturerNIP: string;
    lecturerName?: string;
    profilePicture?: string;
  }[];
  documents: Record<
    string,
    { uploaded: boolean; fileName?: string; fileURL?: string }
  >;
  time: string | null;
  room: string | null;
  assessors: {
    lecturerNIP: string;
    lecturerName?: string;
    profilePicture?: string;
  }[];
}

const StudentSeminarProposal = () => {
  const [currentStep, setCurrentStep] = useState<string>("step1");
  const [maxStepReached, setMaxStepReached] = useState<number>(1);
  const { user, token } = useAuth();
  const lecturersQuery = useApiData({ type: "lecturers" });
  const lecturers = lecturersQuery.data || [];
  const seminarQuery = useApiData({
    type: "seminarByStudentNIM",
    seminarType: "proposal",
    param: user?.profile.nim,
  });

  const [seminar, setSeminar] = useState<Seminar>({
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

  const [researchDetailsModalOpen, setResearchDetailsModalOpen] =
    useState(false);
  const [documentUploadModalOpen, setDocumentUploadModalOpen] = useState(false);
  const [shouldPrint, setShouldPrint] = useState(false);

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
        advisors: seminarData.advisors.map((advisor: any) => ({
          lecturerNIP: advisor.lecturerNIP,
          lecturerName: advisor.lecturer?.name,
          profilePicture: advisor.lecturer?.profilePicture,
        })),
        documents: {
          THESIS_PROPOSAL: {
            uploaded: !!seminarData.documents.find(
              (d: any) => d.documentType === "THESIS_PROPOSAL"
            ),
            fileName: seminarData.documents.find(
              (d: any) => d.documentType === "THESIS_PROPOSAL"
            )?.fileName,
            fileURL: seminarData.documents.find(
              (d: any) => d.documentType === "THESIS_PROPOSAL"
            )?.fileURL,
          },
          ADVISOR_AVAILABILITY: {
            uploaded: !!seminarData.documents.find(
              (d: any) => d.documentType === "ADVISOR_AVAILABILITY"
            ),
            fileName: seminarData.documents.find(
              (d: any) => d.documentType === "ADVISOR_AVAILABILITY"
            )?.fileName,
            fileURL: seminarData.documents.find(
              (d: any) => d.documentType === "ADVISOR_AVAILABILITY"
            )?.fileURL,
          },
          KRS: {
            uploaded: !!seminarData.documents.find(
              (d: any) => d.documentType === "KRS"
            ),
            fileName: seminarData.documents.find(
              (d: any) => d.documentType === "KRS"
            )?.fileName,
            fileURL: seminarData.documents.find(
              (d: any) => d.documentType === "KRS"
            )?.fileURL,
          },
          ADVISOR_ASSISTANCE: {
            uploaded: !!seminarData.documents.find(
              (d: any) => d.documentType === "ADVISOR_ASSISTANCE"
            ),
            fileName: seminarData.documents.find(
              (d: any) => d.documentType === "ADVISOR_ASSISTANCE"
            )?.fileName,
            fileURL: seminarData.documents.find(
              (d: any) => d.documentType === "ADVISOR_ASSISTANCE"
            )?.fileURL,
          },
          SEMINAR_ATTENDANCE: {
            uploaded: !!seminarData.documents.find(
              (d: any) => d.documentType === "SEMINAR_ATTENDANCE"
            ),
            fileName: seminarData.documents.find(
              (d: any) => d.documentType === "SEMINAR_ATTENDANCE"
            )?.fileName,
            fileURL: seminarData.documents.find(
              (d: any) => d.documentType === "SEMINAR_ATTENDANCE"
            )?.fileURL,
          },
        },
        time: seminarData.time,
        room: seminarData.room,
        assessors: seminarData.assessors.map((assessor: any) => ({
          lecturerNIP: assessor.lecturerNIP,
          lecturerName: assessor.lecturer?.name,
          profilePicture: assessor.lecturer?.profilePicture,
        })),
      });

      if (seminarData.status === "DRAFT") setCurrentStep("step1");
      else if (seminarData.status === "SUBMITTED") setCurrentStep("step2");
      else if (seminarData.status === "SCHEDULED") setCurrentStep("step3");
    }
  }, [seminarQuery.data, documentUploadModalOpen]);

  console.log("Seminar", seminar);
  console.log("Dospem: ", seminar.advisors);

  const handleResearchDetailsSubmit = async (data: {
    researchTitle: string;
    advisor1: string;
    advisor2?: string;
  }) => {
    try {
      const advisorNIPs = [data.advisor1];
      if (data.advisor2) advisorNIPs.push(data.advisor2);

      console.log("ID Seminar:", seminar);
      console.log("Data: ", data);

      const endpoint = seminar.id
        ? `http://localhost:5500/api/seminars/proposal-register/${seminar.id}`
        : "http://localhost:5500/api/seminars/proposal-register";
      const method = seminar.id ? "put" : "post";

      const requestData = {
        title: data.researchTitle,
        advisorNIPs,
        ...(method === "post" && { studentNIM: user.profile.nim }),
      };

      console.log("Request Data:", {
        method,
        url: endpoint,
        data: requestData,
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await axios({
        method,
        url: endpoint,
        data: requestData,
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Server Response:", response.data);

      const newSeminarId = response.data.seminar.id;
      setSeminar((prev) => ({
        ...prev,
        id: newSeminarId,
        title: data.researchTitle,
        advisors: [
          {
            lecturerNIP: data.advisor1,
            lecturerName:
              lecturers.find((l: any) => l.nip === data.advisor1)?.name || "",
          },
          ...(data.advisor2
            ? [
                {
                  lecturerNIP: data.advisor2,
                  lecturerName:
                    lecturers.find((l: any) => l.nip === data.advisor2)?.name ||
                    "",
                },
              ]
            : []),
        ],
        status: "DRAFT",
        student:
          method === "post"
            ? { nim: user.profile.nim!, name: user.profile.name || "" }
            : prev.student,
      }));
      setResearchDetailsModalOpen(false);
      setCurrentStep("step2");
      toast.success(
        method === "put"
          ? "Detail seminar berhasil diperbarui!"
          : "Detail seminar berhasil didaftarkan!"
      );

      seminarQuery.refetch();
    } catch (error: any) {
      console.error("Error updating seminar:", error.response?.data || error);
      toast.error(
        "Failed to update: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleDocumentUpload = async (
    documents: Record<string, File | null>
  ) => {
    if (!seminar.id) {
      toast.error(
        "ID seminar tidak ditemukan, selesaikan detail seminar terlebih dahulu."
      );
      return;
    }

    try {
      const requiredDocs = [
        "THESIS_PROPOSAL",
        "ADVISOR_AVAILABILITY",
        "KRS",
        "ADVISOR_ASSISTANCE",
        "SEMINAR_ATTENDANCE",
      ];

      for (const docType of requiredDocs) {
        const file = documents[docType];
        if (file instanceof File) {
          const uploadFormData = new FormData();
          uploadFormData.append("seminarId", String(seminar.id));
          uploadFormData.append("documentType", docType);
          uploadFormData.append("file", file);

          const method = seminar.documents[docType].uploaded ? "put" : "post";
          const endpoint = `http://localhost:5500/api/seminars/proposal-documents`;

          const response = await axios({
            method,
            url: endpoint,
            data: uploadFormData,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });

          console.log("Upload Response:", response.data);

          setSeminar((prev) => ({
            ...prev,
            documents: {
              ...prev.documents,
              [docType]: {
                uploaded: true,
                fileName: response.data.seminarDocument.fileName,
                fileURL: response.data.seminarDocument.fileURL,
              },
            },
            status: "SUBMITTED",
          }));
        }
      }
      setDocumentUploadModalOpen(false);
      setCurrentStep("step3");
      toast.success("Dokumen berhasil diunggah!");

      seminarQuery.refetch();
    } catch (error: any) {
      console.error("Upload error:", error.response?.data || error);
      toast.error(
        "Gagal mengunggah dokumen: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const allDocumentsUploaded = () =>
    Object.values(seminar.documents).every((doc) => doc.uploaded);

  const getStatusBadge = (step: string) => {
    const currentStepNum = Number.parseInt(currentStep.replace("step", ""));
    const stepNum = Number.parseInt(step.replace("step", ""));
    if (stepNum < maxStepReached) {
      return (
        <Badge className="bg-primary-100 text-env-darker border-env-lighter">
          Sudah
        </Badge>
      );
    } else if (stepNum === currentStepNum) {
      return (
        <Badge className="bg-primary-200 text-env-darker border-env-lighter border-2">
          Belum
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-white text-env-darker border-env-lighter">
          Pending
        </Badge>
      );
    }
  };

  const isScheduled = seminar.status === "SCHEDULED";

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
      setCurrentStep(`step${nextStepNum}`);
      setMaxStepReached((prev) => Math.max(prev, nextStepNum));
    }
  };

  const handlePrevStep = () => {
    const prevStepNum = currentStepIndex - 1;
    if (prevStepNum >= 1) {
      setCurrentStep(`step${prevStepNum}`);
    }
  };

  const handlePrintInvitation = () => {
    setShouldPrint(true);
  };

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

  const progressPercentage =
    {
      DRAFT: 25,
      SUBMITTED: 50,
      SCHEDULED: 75,
      COMPLETED: 100,
    }[seminar.status!] || 0;

  const statusMessage =
    {
      DRAFT: "Masukkan detail seminar untuk melanjutkan.",
      SUBMITTED: "Menunggu penjadwalan oleh koordinator.",
      SCHEDULED: "Jadwal telah ditentukan, unduh undangan!",
      COMPLETED: "Seminar selesai!",
    }[seminar.status!] || "Belum Dimulai";

  return (
    <StudentLayout>
      <div className="flex flex-col mb-4">
        <h1 className="text-xl md:text-4xl font-heading font-black mb-3 text-env-darker">
          Pendaftaran Seminar Proposal
        </h1>
      </div>
      <div className="grid grid-cols-1 auto-rows-[minmax(120px,_auto)] sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="w-10 flex items-center justify-center h-10 rounded-full bg-pastel-yellow">
                <Info className="text-jewel-yellow" />
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
                ? "Seminar anda sedang menunggu untuk dinilai."
                : "Status seminar belum diketahui."}
            </p>
          </div>
        </Card>
        <Card className="col-span-1 border border-env-darker row-span-1 gap-0 px-8 py-4 bg-env-lighter overflow-hidden relative">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-env-light">
              Jadwal Seminar
            </h1>
            <div className="w-10 flex items-center justify-center h-10 rounded-full bg-pastel-red">
              <Calendar className="text-jewel-red" />
            </div>
          </div>
          <p className="-mt-2 text-env-darker font-bold md:text-2xl text-xl">
            {seminar.time
              ? `Jam  ${formatTime(seminar.time)} | ${formatDate(seminar.time)}`
              : "Belum ditentukan"}
          </p>
        </Card>
        <Card className="col-span-1 row-span-1 gap-0 px-8 py-4 bg-background overflow-hidden relative">
          <div className="w-12 h-12 rounded-full bg-env-base absolute -left-2 -bottom-4"></div>
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-muted-foreground">
              Hari & Tanggal
            </h1>
            <div className="w-10 flex items-center justify-center h-10 rounded-full bg-pastel-purple">
              <Calendar className="text-jewel-purple" />
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
            <div className="w-10 flex items-center justify-center h-10 rounded-full bg-pastel-green">
              <Loader className="text-jewel-yellbg-pastel-green" />
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
          <Card className="bg-white col-span-1 sm:col-span-2 lg:col-span-4 overflow-hidden ">
            <div className="relative bg-gradient-to-r from-env-base to-env-darker">
              <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>

              <CardHeader className="relative z-10 ">
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
                            <AvatarFallback className="bg-primary-100 text-primary-800">
                              {advisor
                                .lecturerName!.split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-xs md:text-sm font-medium text-primary-800">
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
                  onClick={() => setResearchDetailsModalOpen(true)}
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

              <CardHeader className="relative z-10 ">
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
              {allDocumentsUploaded() ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary-600" />
                    <p className="text-env-darker text-sm md:text-base">
                      Semua dokumen yang dibutuhkan sudah berhasil diunggah.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(seminar.documents).map(([key, doc]) => {
                      const reqDoc = requiredDocuments.find(
                        (d) => d.id === key
                      );
                      return (
                        <div key={key} className="flex flex-col">
                          <h1 className="font-bold text-sm md:text-lg font-heading text-env-darker">
                            {reqDoc ? reqDoc.name : key}
                          </h1>
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
                </div>
              ) : (
                <div className="py-8 mt-4 text-center">
                  <Upload className="h-8 md:h-12 w-8 md:w-12 text-env-darker mx-auto mb-4" />
                  <p className="text-primary-600 mb-4 text-xs md:text-base">
                    Silakan upload semua dokumen yang dibutuhkan, untuk
                    diproses.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="md:hidden flex-col flex gap-2">
              <Button
                onClick={() => setDocumentUploadModalOpen(true)}
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
                  onClick={() => setDocumentUploadModalOpen(true)}
                  disabled={seminar.status === "SCHEDULED"}
                  variant="outline"
                  className="border-2 border-primary text-env-darker"
                >
                  {allDocumentsUploaded()
                    ? "Perbarui Dokumen"
                    : "Unggah Dokumen"}
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="bg-primary hover:bg-primary-700 text-primary-foreground"
                >
                  Lanjut
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}

        {currentStep === "step3" && (
          <Card className="bg-white col-span-1 sm:col-span-2 lg:col-span-4 overflow-hidden">
            <div className="relative bg-gradient-to-r from-env-base to-env-darker">
              <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>

              <CardHeader className="relative z-10 ">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl md:text-2xl -mb-1 font-heading font-bold text-primary-foreground">
                    Undangan Seminar
                  </CardTitle>
                </div>
                <CardDescription className="text-primary-foreground text-xs md:text-sm">
                  Lihat detail seminar Anda dan unduh undangan seminar setelah
                  jadwal ditentukan.
                </CardDescription>
              </CardHeader>
            </div>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs md:text-sm font-medium font-heading text-muted-foreground">
                      Mahasiswa
                    </h3>
                    <div className="flex flex-col">
                      <p className="text-env-darker text-sm md:text-base font-bold">
                        {seminar.student?.name}
                      </p>
                      <p className="text-env-darker text-sm md:text-base font-bold">
                        {seminar.student?.nim}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs md:text-sm font-medium font-heading text-muted-foreground">
                      Judul Penelitian
                    </h3>
                    <p className="text-env-darker text-sm md:text-base font-bold">
                      {seminar.title}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <h3 className="text-xs mb-2 md:text-sm font-medium font-heading text-muted-foreground">
                      Dosen Pembimbing
                    </h3>
                    <div className="flex flex-col gap-2">
                      {seminar.advisors.map((advisor, index) => (
                        <div
                          key={index}
                          className="flex border-env-light rounded-md items-center space-x-2"
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
                            <AvatarFallback className="bg-primary-100 text-primary-800">
                              {advisor
                                .lecturerName!.split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-xs md:text-sm font-medium text-primary-800">
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
                  <div className="col-span-1">
                    <h3 className="text-xs mb-2 md:text-sm font-medium font-heading text-muted-foreground">
                      Dosen Penguji
                    </h3>
                    {seminar.assessors.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {seminar.assessors.map((assessor, index) => (
                          <div
                            key={index}
                            className="flex border-env-light rounded-md items-center space-x-2"
                          >
                            <Avatar>
                              <AvatarImage
                                src={
                                  assessor.profilePicture
                                    ? assessor.profilePicture
                                    : `https://robohash.org/${assessor.lecturerName}`
                                }
                                alt="assessor-image"
                                className="border rounded-full h-8 w-8 md:h-12 md:w-12"
                              />
                              <AvatarFallback className="bg-primary-100 text-primary-800">
                                {assessor
                                  .lecturerName!.split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-xs md:text-sm font-medium text-primary-800">
                                {assessor.lecturerName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {assessor.lecturerNIP}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-env-darker text-sm md:text-base font-bold">
                        Belum ditentukan
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-medium font-heading text-muted-foreground">
                      Waktu
                    </h3>
                    <p className="text-env-darker text-sm md:text-base font-bold">
                      {seminar.time
                        ? `Jam ${formatTime(seminar.time)} | ${formatDate(
                            seminar.time
                          )}
                          `
                        : "Belum ditentukan"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-medium font-heading text-muted-foreground">
                      Ruangan
                    </h3>
                    <p className="text-env-darker text-sm md:text-base font-bold">
                      {seminar.room || "Belum ditentukan"}
                    </p>
                  </div>
                </div>

                <Alert variant="default">
                  <AlertCircle />
                  <AlertTitle>Informasi</AlertTitle>
                  <AlertDescription>
                    Undangan seminar akan tersedia setelah koordinator
                    menentukan jadwal dan penguji.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter className="md:hidden flex-col flex gap-2">
              <Button
                onClick={handlePrintInvitation}
                disabled={seminar.status !== "SCHEDULED"}
                variant="outline"
                className="border-2 w-full border-primary text-env-darker"
              >
                Unduh Undangan
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
            <CardFooter className="hidden md:flex justify-between">
              <Button
                variant="secondary"
                onClick={handlePrevStep}
                className="border-env-lighter text-primary-700 hover:bg-accent hover:text-accent-foreground"
              >
                Kembali
              </Button>
              <div className="space-x-2">
                <Button
                  onClick={handlePrintInvitation}
                  disabled={seminar.status !== "SCHEDULED"}
                  variant="outline"
                  className="border-2 border-primary text-env-darker"
                >
                  Unduh Undangan
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="bg-primary hover:bg-primary-700 text-primary-foreground"
                >
                  Lanjut
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}

        {currentStep === "step4" && (
          <Card className="bg-white col-span-1 sm:col-span-2 lg:col-span-4 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-primary-700">
                Registration Complete
              </CardTitle>
              <CardDescription className="text-primary-600">
                Your proposal seminar registration has been submitted
                successfully.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="rounded-full bg-primary-100 p-3 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-medium mb-2 text-env-darker">
                  Thank You!
                </h3>
                <p className="text-primary-600 mb-6 max-w-md">
                  Your proposal seminar registration has been submitted and is
                  now being processed by the coordinator.
                </p>
                <div className="bg-primary-50 p-4 rounded-lg mb-6 w-full max-w-md border-primary-200">
                  <p className="font-medium text-env-darker">
                    Registration ID:{" "}
                    <span className="font-mono">{seminar.id || "N/A"}</span>
                  </p>
                  <p className="text-sm text-primary-600">
                    Please keep this ID for your reference.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/dashboard")}
                  className="border-env-lighter text-primary-700 hover:bg-accent hover:text-accent-foreground"
                >
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStepIndex === 1 || isScheduled}
                className="border-env-lighter text-primary-700 hover:bg-accent hover:text-accent-foreground"
              >
                Back
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={true}
                className="bg-primary hover:bg-primary-700 text-primary-foreground"
              >
                Next
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      <ResearchDetailsModal
        open={researchDetailsModalOpen}
        onOpenChange={setResearchDetailsModalOpen}
        onSubmit={handleResearchDetailsSubmit}
        initialData={{
          researchTitle: seminar.title,
          advisor1: seminar.advisors[0]?.lecturerNIP,
          advisor2: seminar.advisors[1]?.lecturerNIP || "",
        }}
      />
      <DocumentUploadModal
        open={documentUploadModalOpen}
        onOpenChange={setDocumentUploadModalOpen}
        onSubmit={handleDocumentUpload}
        initialData={Object.fromEntries(
          Object.entries(seminar.documents).map(([key, _]) => [key, null])
        )}
        uploadedStatus={Object.fromEntries(
          Object.entries(seminar.documents).map(([key, doc]) => [
            key,
            doc.uploaded,
          ])
        )}
      />

      <SeminarInvitation
        seminar={seminar}
        shouldPrint={shouldPrint}
        onPrintComplete={() => setShouldPrint(false)}
      />
    </StudentLayout>
  );
};

export default StudentSeminarProposal;
