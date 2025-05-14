import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useApiData } from "@/hooks/useApiData";
import { Card, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlarmClock,
  AlertOctagon,
  Calendar,
  FormInput,
  MapPin,
  Search,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import LecturerLayout from "@/components/layouts/LecturerLayout";
import SeminarDetailsModal from "../../components/ModalDetailSeminar";

import { Select } from "@radix-ui/react-select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Lecturer, Seminar } from "@/configs/types";
import DoughnutChart from "@/components/DoughnutChart";
import TableSeminarsAssessment from "@/components/TableSeminarsAssessment";

const LecturerSeminarProposal = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("advised");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSeminar, setSelectedSeminar] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const seminarsQuery = useApiData({ type: "seminars" });
  const isLoading = seminarsQuery.isLoading;
  const isError = seminarsQuery.isError;
  const refetch = seminarsQuery.refetch;

  useEffect(() => {
    if (location.state?.fromAssessment) {
      refetch();
    }
  }, [location, refetch]);

  if (isLoading || !token || !user || !user.profile.nip) {
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

  const seminars = seminarsQuery.data || [];

  const scheduledAndCompletedSeminars = seminars.filter(
    (seminar: Seminar) =>
      (seminar.status === "SCHEDULED" || seminar.status === "COMPLETED") &&
      seminar.type === "PROPOSAL"
  );

  const advisedSeminars = scheduledAndCompletedSeminars.filter(
    (seminar: Seminar) =>
      seminar.advisors.some(
        (advisor: { lecturer?: Lecturer }) =>
          advisor.lecturer?.nip === user.profile.nip
      )
  );

  const assessedSeminars = scheduledAndCompletedSeminars.filter(
    (seminar: Seminar) =>
      seminar.assessors.some(
        (assessor: { lecturer?: Lecturer }) =>
          assessor.lecturer?.nip === user.profile.nip
      )
  );

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

  const openDetailsModal = (seminar: Seminar) => {
    setSelectedSeminar(seminar);
    setDetailsModalOpen(true);
  };

  const hasBeenAssessed = (seminar: Seminar) => {
    if (!seminar.assessments || seminar.assessments.length === 0) {
      return false;
    }
    return seminar.assessments.some(
      (assessment: any) => assessment.lecturerNIP === user.profile.nip
    );
  };
  const filteredAdvisedSeminars = advisedSeminars.filter((seminar: Seminar) => {
    const matchesSearch =
      seminar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seminar.student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seminar.student?.nim.toLowerCase().includes(searchQuery.toLowerCase());
    const isAssessed = hasBeenAssessed(seminar);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "assessed" && isAssessed) ||
      (statusFilter === "notAssessed" && !isAssessed);
    return matchesSearch && matchesStatus;
  });

  const filteredAssessedSeminars = assessedSeminars.filter(
    (seminar: Seminar) => {
      const matchesSearch =
        seminar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seminar.student?.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        seminar.student?.nim.toLowerCase().includes(searchQuery.toLowerCase());
      const isAssessed = hasBeenAssessed(seminar);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "assessed" && isAssessed) ||
        (statusFilter === "notAssessed" && !isAssessed);
      return matchesSearch && matchesStatus;
    }
  );

  const currentDate = new Date();
  const oldestUnassessedSeminar = [...advisedSeminars, ...assessedSeminars]
    .filter(
      (seminar) =>
        !hasBeenAssessed(seminar) && new Date(seminar.time) < currentDate
    )
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())[0];

  const futureSeminars = [...advisedSeminars, ...assessedSeminars].filter(
    (seminar) => new Date(seminar.time) > currentDate
  );
  const nearestSeminar =
    futureSeminars.length > 0
      ? futureSeminars.sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        )[0]
      : null;
  const isNearestAdvised = nearestSeminar
    ? advisedSeminars.some(
        (seminar: Seminar) => seminar.id === nearestSeminar.id
      )
    : false;
  const roleNearestSeminar = nearestSeminar
    ? isNearestAdvised
      ? "Dibimbing"
      : "Diuji"
    : "";

  const advisedStats = {
    assessed: advisedSeminars.filter(hasBeenAssessed).length,
    notAssessed: advisedSeminars.filter(
      (seminar: Seminar) => !hasBeenAssessed(seminar)
    ).length,
  };
  const assessedStats = {
    assessed: assessedSeminars.filter(hasBeenAssessed).length,
    notAssessed: assessedSeminars.filter(
      (seminar: Seminar) => !hasBeenAssessed(seminar)
    ).length,
  };

  const handleAssessNavigation = (seminarId: number) => {
    navigate(`/seminar-proposal/assess/${seminarId}`, {
      state: { fromAssessment: true },
    });
  };

  return (
    <LecturerLayout>
      <div className="flex flex-col mb-4">
        <h1 className="text-xl md:text-4xl font-heading font-black text-env-darker">
          Seminar Proposal
        </h1>
        <p className="text-primary md:text-base text-sm">
          {activeTab === "advised"
            ? "Kelola seminar proposal mahasiswa yang Anda bimbing"
            : "Kelola seminar proposal mahasiswa yang Anda uji"}
        </p>
      </div>
      <div className="grid grid-cols-1 auto-rows-[minmax(160px,_auto)] sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="col-span-1 sm:col-span-2 py-4  gap-2 px-8 row-span-1 relative overflow-hidden border-env-darker border rounded-md bg-env-darker order-1">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-env-lighter">
              Belum Dinilai (Terlama)
            </h1>
            <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-red">
              <AlertOctagon className="text-jewel-red w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
          {oldestUnassessedSeminar ? (
            <div>
              <CardTitle className="text-sm md:text-base text-primary-foreground font-medium line-clamp-2">
                {oldestUnassessedSeminar.title}
              </CardTitle>
              <div>
                <div className="flex items-center gap-2">
                  <User size={12} className="text-primary-foreground" />
                  <div>
                    <span className="text-xs text-primary-foreground">
                      {oldestUnassessedSeminar.student?.name || "N/A"}
                    </span>
                    <span className="text-env-lighter text-xs ml-2">
                      ({oldestUnassessedSeminar.studentNIM})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={12} className="text-primary-foreground" />
                  <div>
                    <span className="text-xs text-primary-foreground">
                      {formatDate(oldestUnassessedSeminar.time)}
                    </span>
                    <span className="text-xs text-env-lighter ml-2">
                      Jam {formatTime(oldestUnassessedSeminar.time)} WIB
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-primary-foreground" />
                  <span className="text-xs text-primary-foreground">
                    {oldestUnassessedSeminar.room || "TBD"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-primary-foreground">
              Tidak ada seminar belum dinilai.
            </p>
          )}
        </Card>

        <Card className="col-span-1 row-span-2 gap-0 px-8 py-4 bg-background overflow-hidden relative order-3 md:order2">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-muted-foreground">
              Dibimbing
            </h1>
            <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center  rounded-full bg-pastel-green">
              <FormInput className="text-jewel-green w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
          <DoughnutChart
            initialData={[
              {
                name: "Sudah Dinilai",
                value: advisedStats.assessed,
                color: "#064359",
                stroke: "#a0ced9",
              },
              {
                name: "Belum Dinilai",
                value: advisedStats.notAssessed,
                color: "#C50043",
                stroke: "#ffc09f",
              },
            ]}
          />
        </Card>

        <Card className="col-span-1 border row-span-2 gap-0 px-8 py-4 overflow-hidden relative order-4 md:order-3">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-muted-foreground">
              Diuji
            </h1>
            <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-green">
              <FormInput className="text-jewel-green w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
          <DoughnutChart
            initialData={[
              {
                name: "Sudah Dinilai",
                value: assessedStats.assessed,
                color: "#064359",
                stroke: "#a0ced9",
              },
              {
                name: "Belum Dinilai",
                value: assessedStats.notAssessed,
                color: "#C50043",
                stroke: "#ffc09f",
              },
            ]}
          />
        </Card>

        <Card className="col-span-1 sm:col-span-2 py-4 px-8 row-span-1 relative overflow-hidden rounded-xl order-2 md:order-4">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-muted-foreground">
              Seminar Terdekat
            </h1>
            <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-yellow">
              <AlarmClock className="text-jewel-yellow w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
          {nearestSeminar ? (
            <div>
              <div className="flex w-full justify-between">
                <CardTitle className="text-sm md:text-base text-env-darker font-medium line-clamp-2">
                  {nearestSeminar.title}
                </CardTitle>
                <Badge className="md:h-6 h-4 md:text-xs text-[8px] bg-pastel-blue text-jewel-blue">
                  {roleNearestSeminar}
                </Badge>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <User size={12} className="text-primary" />
                  <div>
                    <span className="text-xs text-primary">
                      {nearestSeminar.student?.name || "N/A"}
                    </span>
                    <span className="text-muted-foreground text-xs ml-2">
                      ({nearestSeminar.studentNIM})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={12} className="text-primary" />
                  <div>
                    <span className="text-xs text-primary">
                      {formatDate(nearestSeminar.time)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      Jam {formatTime(nearestSeminar.time)} WIB
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-primary" />
                  <span className="text-xs text-primary">
                    {nearestSeminar.room || "TBD"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-primary-600">
              Tidak ada jadwal seminar terdekat.
            </p>
          )}
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="col-span-1 sm:col-span-2 lg:col-span-4 overflow-hidden pt-2 pr-1 order-last"
        >
          <div className="relative md:hidden -mt-4 mb-2">
            <Search className="absolute left-2.5 top-1/4 h-4 w-4 text-primary-600" />
            <Input
              type="search"
              placeholder="Cari seminar berdasarkan judul penelitian | nama | nim"
              className="w-full pl-8 bg-background  text-xs placeholder:text-xs border-primary-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4 items-center mb-4 justify-between">
            <TabsList className="bg-env-base">
              <TabsTrigger
                value="advised"
                className={`text-primary-foreground text-xs md:text-sm ${
                  activeTab === "advised" ? "text-primary" : ""
                }`}
              >
                Dibimbing ({advisedSeminars.length})
              </TabsTrigger>
              <TabsTrigger
                value="assessed"
                className={`text-primary-foreground text-xs md:text-sm ${
                  activeTab === "assessed" ? "text-primary" : ""
                }`}
              >
                Diuji ({assessedSeminars.length})
              </TabsTrigger>
            </TabsList>
            <div className="relative flex-2 hidden md:block">
              <Search className="absolute left-2.5 top-1/4 h-4 w-4 text-primary-600" />
              <Input
                type="search"
                placeholder="Cari seminar berdasarkan judul penelitian | nama | nim"
                className="w-full pl-8 bg-background border-primary-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Keterangan</SelectItem>
                <SelectItem value="assessed">Sudah Dinilai</SelectItem>
                <SelectItem value="notAssessed">Belum Dinilai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="advised">
            <TableSeminarsAssessment
              seminars={filteredAdvisedSeminars}
              userNip={user.profile.nip}
              openDetailsModal={openDetailsModal}
              handleAssessNavigation={handleAssessNavigation}
            />
          </TabsContent>

          <TabsContent value="assessed">
            <TableSeminarsAssessment
              seminars={filteredAssessedSeminars}
              userNip={user.profile.nip}
              openDetailsModal={openDetailsModal}
              handleAssessNavigation={handleAssessNavigation}
            />
          </TabsContent>
        </Tabs>

        {selectedSeminar && (
          <SeminarDetailsModal
            open={detailsModalOpen}
            onOpenChange={setDetailsModalOpen}
            seminar={selectedSeminar}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        )}
      </div>
    </LecturerLayout>
  );
};

export default LecturerSeminarProposal;
