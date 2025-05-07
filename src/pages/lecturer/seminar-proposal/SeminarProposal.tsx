import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useApiData } from "@/hooks/useApiData";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import LecturerLayout from "@/components/layouts/LecturerLayout";
import SeminarDetailsModal from "./SeminarDetailsModal";

import SeminarTable from "./SeminarTable";
import { Select } from "@radix-ui/react-select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    (seminar: any) =>
      (seminar.status === "SCHEDULED" || seminar.status === "COMPLETED") &&
      seminar.type === "PROPOSAL"
  );

  const advisedSeminars = scheduledAndCompletedSeminars.filter((seminar: any) =>
    seminar.advisors.some(
      (advisor: any) => advisor.lecturer?.nip === user.profile.nip
    )
  );

  const assessedSeminars = scheduledAndCompletedSeminars.filter(
    (seminar: any) =>
      seminar.assessors.some(
        (assessor: any) => assessor.lecturer?.nip === user.profile.nip
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

  const openDetailsModal = (seminar: any) => {
    setSelectedSeminar(seminar);
    setDetailsModalOpen(true);
  };

  const hasBeenAssessed = (seminar: any) => {
    if (!seminar.assessments || seminar.assessments.length === 0) {
      return false;
    }
    return seminar.assessments.some(
      (assessment: any) => assessment.lecturerNIP === user.profile.nip
    );
  };
  const filteredAdvisedSeminars = advisedSeminars.filter((seminar: any) => {
    const matchesSearch =
      seminar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seminar.student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seminar.studentNIM.toLowerCase().includes(searchQuery.toLowerCase());
    const isAssessed = hasBeenAssessed(seminar);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "assessed" && isAssessed) ||
      (statusFilter === "notAssessed" && !isAssessed);
    return matchesSearch && matchesStatus;
  });

  const filteredAssessedSeminars = assessedSeminars.filter((seminar: any) => {
    const matchesSearch =
      seminar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seminar.student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seminar.studentNIM.toLowerCase().includes(searchQuery.toLowerCase());
    const isAssessed = hasBeenAssessed(seminar);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "assessed" && isAssessed) ||
      (statusFilter === "notAssessed" && !isAssessed);
    return matchesSearch && matchesStatus;
  });

  const handleAssessNavigation = (seminarId: number) => {
    navigate(`/seminar-proposal/assess/${seminarId}`, {
      state: { fromAssessment: true },
    });
  };

  return (
    <LecturerLayout>
      <div className="flex flex-col mb-4">
        <h1 className="text-4xl font-heading font-black text-primary-800">
          Seminar Proposal
        </h1>
        <p className="text-primary">
          {activeTab === "advised"
            ? "Kelola seminar proposal mahasiswa yang Anda bimbing"
            : "Kelola seminar proposal mahasiswa yang Anda uji"}
        </p>
      </div>
      <div className="grid grid-cols-1 auto-rows-[minmax(160px,_auto)] sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="col-span-1 sm:col-span-2 py-4 px-8 row-span-1 border-2 border-pastel-green relative overflow-hidden rounded-xl bg-env-light"></Card>

        <Card className="col-span-1 border border-env-darker row-span-2 gap-0 px-8 py-4 bg-env-lighter overflow-hidden relative"></Card>
        <Card className="col-span-1 row-span-2 gap-0 px-8 py-4 bg-background overflow-hidden relative"></Card>
        <Card className="col-span-1 sm:col-span-2 py-4 px-8 row-span-1 border-2 border-pastel-green relative overflow-hidden rounded-xl bg-env-light"></Card>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="col-span-1 sm:col-span-2 lg:col-span-4 overflow-hidden pt-2 pr-1"
        >
          <div className="flex gap-4 items-center w-full mb-4 justify-between">
            <TabsList className="bg-env-base">
              <TabsTrigger
                value="advised"
                className={`text-primary-foreground ${
                  activeTab === "advised" ? "text-primary-800" : ""
                }`}
              >
                Dibimbing ({advisedSeminars.length})
              </TabsTrigger>
              <TabsTrigger
                value="assessed"
                className={`text-primary-foreground ${
                  activeTab === "assessed" ? "text-primary-800" : ""
                }`}
              >
                Diuji ({assessedSeminars.length})
              </TabsTrigger>
            </TabsList>
            <div className="relative flex-2">
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
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="assessed">Sudah Dinilai</SelectItem>
                <SelectItem value="notAssessed">Belum Dinilai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="advised">
            <SeminarTable
              seminars={filteredAdvisedSeminars}
              userNip={user.profile.nip}
              openDetailsModal={openDetailsModal}
              handleAssessNavigation={handleAssessNavigation}
            />
          </TabsContent>

          <TabsContent value="assessed">
            <SeminarTable
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
