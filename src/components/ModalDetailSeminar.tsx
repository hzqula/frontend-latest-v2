import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../../../frontend-latest/src/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Seminar } from "@/configs/types";

interface ModalDetailSeminarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seminar: Seminar;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
}

const ModalDetailSeminar = ({
  open,
  onOpenChange,
  seminar,
  formatDate,
  formatTime,
}: ModalDetailSeminarProps) => {
  if (!seminar) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[90vw] sm:max-w-[500px] md:max-w-[600px] p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl sm:text-2xl font-heading font-black text-primary-800">
            Detail Seminar Proposal
          </DialogTitle>
          <DialogDescription className="text-primary text-xs sm:text-sm">
            Informasi lengkap tentang seminar proposal
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 sm:space-y-4 mt-2 sm:mt-4">
          <div>
            <h3 className="text-xs md:text-sm font-medium font-heading text-muted-foreground">
              Judul Penelitian
            </h3>
            <p className="text-env-darker text-sm md:text-base font-bold">
              {seminar.title}
            </p>
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-medium font-heading text-muted-foreground">
              Mahasiswa
            </h3>
            <p className="text-env-darker text-sm md:text-base font-bold -mb-1">
              {seminar.student?.name}
            </p>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">
              {seminar.student?.nim}
            </p>
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-medium font-heading text-muted-foreground">
              Jadwal Seminar
            </h3>
            <p className="text-env-darker text-sm md:text-base font-bold">
              {seminar.time
                ? `Jam ${formatTime(seminar.time)} | ${formatDate(seminar.time)}
                          `
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
          <div>
            <h3 className="text-xs md:text-sm font-medium font-heading text-muted-foreground">
              Pembimbing
            </h3>
            {seminar.advisors && seminar.advisors.length > 0 ? (
              <div className="flex flex-col gap-2 mt-2">
                {seminar.advisors.map((advisor, index) => (
                  <div
                    key={index}
                    className="flex border-env-light rounded-md items-center space-x-2 p-2"
                  >
                    <Avatar>
                      <AvatarImage
                        src={
                          advisor.lecturer?.profilePicture
                            ? advisor.lecturer.profilePicture
                            : `https://robohash.org/${
                                advisor.lecturer?.name || "unknown"
                              }`
                        }
                        alt="advisor-image"
                        className="border rounded-full h-8 w-8 md:h-12 md:w-12"
                      />
                      <AvatarFallback className="bg-primary-100 text-primary-800">
                        {advisor.lecturer?.name
                          ? advisor.lecturer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "N/A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xs md:text-sm font-medium text-primary-800">
                        {advisor.lecturer?.name || "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {advisor.lecturer?.nip || "N/A"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-primary-800 text-sm sm:text-base mt-2">
                Belum ditentukan
              </p>
            )}
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-medium font-heading text-muted-foreground">
              Penguji
            </h3>
            {seminar.assessors && seminar.assessors.length > 0 ? (
              <div className="flex flex-col gap-2 mt-2">
                {seminar.assessors.map((assessor, index) => (
                  <div
                    key={index}
                    className="flex border-env-light rounded-md items-center space-x-2 p-2"
                  >
                    <Avatar>
                      <AvatarImage
                        src={
                          assessor.lecturer?.profilePicture
                            ? assessor.lecturer.profilePicture
                            : `https://robohash.org/${
                                assessor.lecturer?.name || "unknown"
                              }`
                        }
                        alt="assessor-image"
                        className="border rounded-full h-8 w-8 md:h-12 md:w-12"
                      />
                      <AvatarFallback className="bg-primary-100 text-primary-800">
                        {assessor.lecturer?.name
                          ? assessor.lecturer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "N/A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xs md:text-sm font-medium text-primary-800">
                        {assessor.lecturer?.name || "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {assessor.lecturer?.nip || "N/A"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-primary-800 text-sm sm:text-base mt-2">
                Belum ditentukan
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="mt-4 sm:mt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto border-primary-400 text-primary-800 text-sm sm:text-base"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalDetailSeminar;
