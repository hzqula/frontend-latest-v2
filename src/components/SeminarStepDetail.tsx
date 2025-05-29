"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { RegisterSeminar } from "@/configs/types";

interface SeminarStepDetailProps {
  step: "step3" | "step4";
  seminar: RegisterSeminar;
  onPrevStep: () => void;
  onNextStep: () => void;
  handlePrint: (seminar: RegisterSeminar) => void;
  status: string | null;
}

const SeminarStepDetail = ({
  step,
  seminar,
  onPrevStep,
  onNextStep,
  handlePrint,
  status,
}: SeminarStepDetailProps) => {
  const isStep3 = step === "step3";

  const cardTitle = isStep3 ? "Undangan Seminar" : "Berita Acara";
  const cardDescription = isStep3
    ? "Lihat detail seminar Anda dan unduh undangan seminar setelah jadwal ditentukan."
    : "Lihat detail seminar Anda dan unduh Berita Acara setelah seminar selesai.";
  const alertDescription = isStep3
    ? "Undangan seminar akan tersedia setelah koordinator menentukan jadwal dan penguji."
    : "Berita Acara akan tersedia setelah seminar selesai dan dinilai oleh semua dosen pembimbing dan penguji.";
  const downloadButtonText = isStep3 ? "Unduh Undangan" : "Unduh Berita Acara";
  const downloadDisabled = isStep3
    ? status !== "SCHEDULED"
    : status !== "COMPLETED";

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

  return (
    <Card className="bg-white col-span-1 sm:col-span-2 lg:col-span-4 overflow-hidden">
      <div className="relative bg-gradient-to-r from-env-base to-env-darker">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>

        <CardHeader className="relative z-10">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl md:text-2xl -mb-1 font-heading font-bold text-primary-foreground">
              {cardTitle}
            </CardTitle>
          </div>
          <CardDescription className="text-primary-foreground text-xs md:text-sm">
            {cardDescription}
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
                      </Avatar>
                      <div>
                        <div className="text-xs md:text-sm font-medium text-env-darker">
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
                Jadwal Seminar
              </h3>
              <p className="text-env-darker text-sm md:text-base font-bold">
                {seminar.time
                  ? `Jam ${formatTime(seminar.time)} | ${formatDate(
                      seminar.time
                    )}`
                  : "Belum ditentukan"}
              </p>
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-medium font-heading text-muted-foreground">
                Tempat Seminar
              </h3>
              <p className="text-env-darker text-sm md:text-base font-bold">
                {seminar.room || "Belum ditentukan"}
              </p>
            </div>
          </div>

          <Alert variant="default">
            <AlertCircle />
            <AlertTitle>Informasi</AlertTitle>
            <AlertDescription>{alertDescription}</AlertDescription>
          </Alert>
        </div>
      </CardContent>
      <CardFooter className="md:hidden flex-col flex gap-2">
        <Button
          onClick={() => handlePrint(seminar)}
          disabled={downloadDisabled}
          variant="outline"
          className="border-2 w-full border-primary text-env-darker"
        >
          {downloadButtonText}
        </Button>
        <div className="w-full gap-2 flex items-center">
          <Button
            variant="secondary"
            onClick={onPrevStep}
            className="flex-0 min-w-[120px]"
          >
            Kembali
          </Button>
          {isStep3 && (
            <Button onClick={onNextStep} className="flex-1">
              Lanjut
            </Button>
          )}
        </div>
      </CardFooter>
      <CardFooter className="hidden md:flex justify-between">
        <Button
          variant="secondary"
          onClick={onPrevStep}
          className="border-env-lighter text-primary-700 hover:bg-accent hover:text-accent-foreground"
        >
          Kembali
        </Button>
        <div className="space-x-2">
          <Button
            onClick={() => handlePrint(seminar)}
            disabled={downloadDisabled}
            variant="outline"
            className="border-2 border-primary text-env-darker"
          >
            {downloadButtonText}
          </Button>
          {isStep3 && <Button onClick={onNextStep}>Lanjut</Button>}
        </div>
      </CardFooter>
    </Card>
  );
};

export default SeminarStepDetail;
