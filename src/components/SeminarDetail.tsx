import { Calendar, Clock, MapPin } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Seminar } from "@/configs/types";

interface SeminarDetailProps {
  seminar: Seminar;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
  isAdvisor: boolean;
  lecturerNIP: string;
}

const SeminarDetail: React.FC<SeminarDetailProps> = ({
  seminar,
  formatDate,
  formatTime,
  isAdvisor,
  lecturerNIP,
}) => {
  const hasBeenAssessed = seminar.assessments?.some(
    (assessment) => assessment.lecturerNIP === lecturerNIP
  );

  return (
    <Card className="bg-white col-span-1 sm:col-span-2 lg:col-span-4 overflow-hidden">
      <div className="relative bg-gradient-to-r from-env-base to-env-darker">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
        <CardHeader className="relative pb-4 pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Badge className="bg-pastel-green text-jewel-green mb-2">
                Seminar Proposal
              </Badge>
              <CardTitle className="text-xl md:text-2xl mb-1 font-heading font-bold text-primary-foreground">
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
            <Badge
              variant="outline"
              className={`uppercase self-end ${
                hasBeenAssessed
                  ? "bg-pastel-blue text-jewel-blue"
                  : "bg-pastel-red text-jewel-red"
              }`}
            >
              {hasBeenAssessed ? "Sudah dinilai" : "Belum dinilai"}
            </Badge>
          </div>
        </CardHeader>
      </div>

      <CardContent className="p-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Bagian Mahasiswa */}
          <div className="flex md:col-span-1 lg:col-span-2 items-center justify-start md:justify-center space-x-4">
            <Avatar className="size-12 md:size-16 border border-primary-800">
              <AvatarImage
                src={
                  seminar.student?.profilePicture
                    ? seminar.student?.profilePicture
                    : "https://robohash.org/mail@ashallendesign.co.uk"
                }
                alt="student-image"
              />
              <AvatarFallback className="bg-primary-800 text-primary-800 text-xl">
                {seminar.student?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm text-muted-foreground flex items-center">
                <h3 className="text-xs md:text-sm font-medium font-heading text-muted-foreground">
                  {isAdvisor
                    ? "Mahasiswa yang Dibimbing"
                    : "Mahasiswa yang Diuji"}
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
          <div className="space-y-6 md:col-span-1 lg:col-span-3">
            <div>
              <h3 className="text-xs mb-2 md:text-sm font-medium font-heading text-muted-foreground">
                Pembimbing
              </h3>
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row md:space-x-4 md:space-y-0 space-y-2">
                  {seminar.advisors.map((advisor, index) => (
                    <div
                      key={index}
                      className="flex items-center px-2 pb-1 border-l-2 border-primary-200 rounded-md w-full md:w-auto"
                    >
                      <Avatar>
                        <AvatarImage
                          src={
                            advisor.lecturer?.profilePicture
                              ? advisor.lecturer?.profilePicture
                              : `https://robohash.org/${advisor.lecturer?.name}`
                          }
                          alt="advisor-image"
                          className="border rounded-full h-8 w-8 md:h-12 md:w-12"
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
            </div>

            <div>
              <h3 className="text-xs mb-2 md:text-sm font-medium font-heading text-muted-foreground">
                Penguji
              </h3>
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row md:space-x-4 md:space-y-0 space-y-2">
                  {seminar.assessors.map((assessor, index) => (
                    <div
                      key={index}
                      className="flex items-center px-2 pb-1 border-l-2 border-primary-200 rounded-md w-full md:w-auto"
                    >
                      <Avatar>
                        <AvatarImage
                          src={
                            assessor.lecturer?.profilePicture
                              ? assessor.lecturer?.profilePicture
                              : `https://robohash.org/${assessor.lecturer?.name}`
                          }
                          alt="assessor-image"
                          className="border rounded-full h-8 w-8 md:h-12 md:w-12"
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
        </div>
      </CardContent>
    </Card>
  );
};

export default SeminarDetail;
