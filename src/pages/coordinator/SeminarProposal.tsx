"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApiData } from "@/hooks/useApiData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlarmClock,
  AlertOctagon,
  Calendar,
  FormInput,
  Search,
  User,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import CoordinatorLayout from "@/components/layouts/CoordinatorLayout";
import SeminarDetailsModal from "@/components/ModalDetailSeminar";
import { Seminar } from "@/configs/types";
import { Card, CardTitle } from "@/components/ui/card";
import TableSeminarsScheduled from "@/components/TableSeminarsScheduled";
import TableSeminarsSubmitted from "@/components/TableSeminarsSubmitted";
import TableSeminarsCompleted from "@/components/TableSeminarsCompleted";
import DoughnutChart from "@/components/DoughnutChart";
import ModalSchedulingSeminar from "../../components/ModalSchedulingSeminar";

const CoordinatorSeminarProposal = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("submitted");
  const [searchQuery, setSearchQuery] = useState("");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSeminar, setSelectedSeminar] = useState<any>(null);

  const seminarsQuery = useApiData({ type: "seminars" });
  const lecturersQuery = useApiData({ type: "lecturers" });
  const isLoading = seminarsQuery.isLoading || lecturersQuery.isLoading;
  const isError = seminarsQuery.isError || lecturersQuery.isError;

  if (isLoading || !token || !user) {
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
  const lecturers = lecturersQuery.data || [];

  const submittedSeminars = seminars.filter(
    (seminar: Seminar) =>
      seminar.status === "SUBMITTED" && seminar.type === "PROPOSAL"
  );
  const scheduledSeminars = seminars.filter(
    (seminar: Seminar) =>
      seminar.status === "SCHEDULED" && seminar.type === "PROPOSAL"
  );
  const completedSeminars = seminars.filter(
    (seminar: Seminar) =>
      seminar.status === "COMPLETED" && seminar.type === "PROPOSAL"
  );

  // Filter seminars berdasarkan pencarian
  const filteredSubmittedSeminars = submittedSeminars.filter(
    (seminar: Seminar) =>
      seminar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seminar.student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seminar.student?.nim.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredScheduledSeminars = scheduledSeminars.filter(
    (seminar: Seminar) =>
      seminar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seminar.student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seminar.student?.nim.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompletedSeminars = completedSeminars.filter(
    (seminar: Seminar) =>
      seminar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seminar.student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seminar.student?.nim.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fungsi untuk format tanggal
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fungsi untuk format waktu
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openScheduleModal = (seminar: Seminar) => {
    setSelectedSeminar(seminar);
    setScheduleModalOpen(true);
  };

  const openRescheduleModal = (seminar: Seminar) => {
    setSelectedSeminar(seminar);
    setScheduleModalOpen(true);
  };
  const openDetailsModal = (seminar: Seminar) => {
    setSelectedSeminar(seminar);
    setDetailsModalOpen(true);
  };

  // **Card 1: Seminar Terlama yang Belum Dijadwalkan**
  const oldestUnscheduledSeminar = submittedSeminars.sort(
    (a: Seminar, b: Seminar) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )[0];

  const seminarChartData = [
    {
      name: "Diajukan",
      value: submittedSeminars.length,
      color: "#064359",
      stroke: "#a0ced9",
    },
    {
      name: "Dijadwalkan",
      value: scheduledSeminars.length,
      color: "#6d275d",
      stroke: "#a594f9",
    },
    {
      name: "Selesai",
      value: completedSeminars.length,
      color: "#055a39",
      stroke: "#adf7b6",
    },
  ];

  return (
    <CoordinatorLayout>
      <div className="flex flex-col mb-4">
        <h1 className="text-xl md:text-4xl font-heading font-black text-env-darker">
          Seminar Proposal
        </h1>
        <p className="text-primary md:text-base text-sm">
          Kelola seminar proposal mahasiswa
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Seminar Terlama yang Belum Dijadwalkan */}
        <Card className="col-span-1 sm:col-span-2 py-4 gap-2 px-8 row-span-1 relative overflow-hidden border-env-darker border rounded-md bg-env-darker order-1">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-env-lighter">
              Belum Dijadwalkan (Terlama)
            </h1>
            <div className=" w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-red">
              <AlertOctagon className=" text-jewel-red w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
          {oldestUnscheduledSeminar ? (
            <div>
              <CardTitle className="text-sm md:text-base text-primary-foreground line-clamp-3 md:line-clamp-none font-medium">
                {oldestUnscheduledSeminar.title}
              </CardTitle>
              <div>
                <div className="flex items-center gap-2">
                  <User size={12} className="text-primary-foreground" />
                  <div>
                    <span className="text-xs text-primary-foreground">
                      {oldestUnscheduledSeminar.student?.name || "N/A"}
                    </span>
                    <span className="text-env-lighter text-xs ml-2">
                      ({oldestUnscheduledSeminar.studentNIM})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={12} className="text-primary-foreground" />
                  <div>
                    <span className="text-xs text-primary-foreground">
                      {formatDate(oldestUnscheduledSeminar.createdAt)}
                    </span>
                    <span className="text-xs text-env-lighter ml-2">
                      Jam {formatTime(oldestUnscheduledSeminar.createdAt)} WIB
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm">Tidak ada seminar yang belum dijadwalkan.</p>
          )}
        </Card>

        <Card className="col-span-1 row-span-2 gap-0 px-8 py-4 bg-background overflow-hidden relative order-3 md:order-2">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-muted-foreground">
              Info 1
            </h1>
            <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-green">
              <Users className="text-jewel-green w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
        </Card>

        <Card className="col-span-1 border row-span-2 gap-0 px-8 py-4 overflow-hidden relative order-4 md:order-3">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-muted-foreground">
              Seminar Proposal
            </h1>
            <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-green">
              <FormInput className="text-jewel-green w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
          <div className="mt-4">
            <DoughnutChart initialData={seminarChartData} />
          </div>
        </Card>

        <Card className="col-span-1 sm:col-span-2 py-4 px-8 row-span-1 relative overflow-hidden rounded-xl order-2 md:order-4">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-muted-foreground">
              Info 2
            </h1>
            <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-yellow">
              <AlarmClock className="text-jewel-yellow w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="col-span-1 sm:col-span-2 lg:col-span-4 overflow-hidden pt-2 pr-1 order-last"
        >
          <div className="relative md:hidden mt-1 mb-2">
            <Search className="absolute left-2.5 top-1/4 h-4 w-4 text-primary-600" />
            <Input
              type="search"
              placeholder="Cari seminar berdasarkan judul penelitian | nama | nim"
              className="w-full pl-8 bg-background text-xs placeholder:text-xs border-primary-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4 items-center w-full mb-4 justify-between">
            <TabsList className="bg-env-base w-full md:w-auto">
              <TabsTrigger
                value="submitted"
                className={`text-primary-foreground text-xs md:text-sm ${
                  activeTab === "submitted" ? "text-primary" : ""
                }`}
              >
                Diajukan ({submittedSeminars.length})
              </TabsTrigger>
              <TabsTrigger
                value="scheduled"
                className={`text-primary-foreground text-xs md:text-sm ${
                  activeTab === "scheduled" ? "text-primary" : ""
                }`}
              >
                Dijadwalkan ({scheduledSeminars.length})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className={`text-primary-foreground text-xs md:text-sm ${
                  activeTab === "completed" ? "text-primary" : ""
                }`}
              >
                Selesai ({completedSeminars.length})
              </TabsTrigger>
            </TabsList>
            <div className="relative w-full hidden md:block">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-primary-600" />
              <Input
                type="search"
                placeholder="Cari seminar berdasarkan judul penelitian | nama | nim"
                className="w-full bg-background pl-8 border-primary-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Tab: Diajukan (SUBMITTED) */}
          <TabsContent value="submitted">
            <TableSeminarsSubmitted
              seminars={filteredSubmittedSeminars}
              formatDate={formatDate}
              formatTime={formatTime}
              onSchedule={openScheduleModal}
              onViewDetails={openDetailsModal}
            />
          </TabsContent>

          {/* Tab: Dijadwalkan (SCHEDULED) */}
          <TabsContent value="scheduled">
            <TableSeminarsScheduled
              seminars={filteredScheduledSeminars}
              formatDate={formatDate}
              formatTime={formatTime}
              onViewDetails={openDetailsModal}
              onReschedule={openRescheduleModal}
              token={token}
              lecturers={lecturers}
            />
          </TabsContent>

          {/* Tab: Selesai (COMPLETED) */}
          <TabsContent value="completed">
            <TableSeminarsCompleted
              seminars={filteredCompletedSeminars}
              formatDate={formatDate}
              formatTime={formatTime}
              onViewDetails={openDetailsModal}
            />
          </TabsContent>
        </Tabs>

        {/* Modal Penjadwalan */}
        {selectedSeminar && (
          <ModalSchedulingSeminar
            open={scheduleModalOpen}
            onOpenChange={setScheduleModalOpen}
            seminar={selectedSeminar}
            lecturers={lecturers}
            token={token}
            onScheduleSuccess={seminarsQuery.refetch}
            isReschedule={activeTab === "scheduled"}
          />
        )}

        {/* Modal Detail Seminar */}
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
    </CoordinatorLayout>
  );
};

export default CoordinatorSeminarProposal;
