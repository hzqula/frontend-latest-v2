import { Calendar, Clock, MapPin, User, Award, Users } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
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
  // Check if the seminar has been assessed by the current lecturer
  const hasBeenAssessed = seminar.assessments?.some(
    (assessment) => assessment.lecturerNIP === lecturerNIP
  );

  return (
    <Card className="overflow-hidden bg-white col-span-1 sm:col-span-2 lg:col-span-4">
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
        <CardHeader className="relative pb-4 pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Badge className="bg-white text-primary-800 mb-2">
                Seminar Proposal
              </Badge>
              <CardTitle className="text-2xl font-heading font-black text-primary-foreground">
                {seminar.title}
              </CardTitle>
              <div className="text-primary-100 mt-1">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>{formatDate(seminar.time)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{formatTime(seminar.time)}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    <span>{seminar.room}</span>
                  </div>
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-primary-100 border-primary-100 uppercase tracking-wider px-3 py-1"
            >
              {hasBeenAssessed ? "Sudah dinilai" : "Belum dinilai"}
            </Badge>
          </div>
        </CardHeader>
      </div>

      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border border-primary-800">
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
                <User className="h-3.5 w-3.5 mr-1" />
                {isAdvisor
                  ? "Mahasiswa yang Dibimbing"
                  : "Mahasiswa yang Diuji"}
              </div>
              <h3 className="text-lg font-heading font-semibold text-primary-800">
                {seminar.student?.name}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="mr-2">{seminar.student?.nim}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                <Award className="h-4 w-4 mr-1" />
                Pembimbing
              </h4>
              <div className="space-y-2">
                {seminar.advisors.map((advisor, index) => (
                  <div
                    key={index}
                    className="flex border-l-2 border-primary-200 rounded-md items-center px-2 pb-1 space-x-2"
                  >
                    <Avatar className="h-8 w-8">
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
                      <div className="text-sm font-medium text-primary-800">
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
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Penguji
              </h4>
              <div className="space-y-2">
                {seminar.assessors.map((assessor, index) => (
                  <div
                    key={index}
                    className="flex border-l-2 border-primary-200 rounded-md items-center px-2 pb-1 space-x-2"
                  >
                    <Avatar className="h-8 w-8">
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
                      <div className="text-sm font-medium text-primary-800">
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
  );
};

export default SeminarDetail;
