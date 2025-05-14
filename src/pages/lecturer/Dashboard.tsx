"use client";

import { Link } from "react-router";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useApiData } from "../../hooks/useApiData";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  FileText,
  CheckCircle2,
  BookOpen,
  ClipboardList,
  ClipboardPenLine,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import LecturerLayout from "../../components/layouts/LecturerLayout";
import { Input } from "../../components/ui/input";

const LecturerDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const studentsQuery = useApiData({ type: "students" });
  const seminarsQuery = useApiData({ type: "seminars" });

  const isLoading = studentsQuery.isLoading || seminarsQuery.isLoading;
  const isError = studentsQuery.isError || seminarsQuery.isError;

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

  const completedSeminars = seminars.filter(
    (seminar: any) => seminar.status === "COMPLETED"
  );

  const seminarTypes = ["PROPOSAL", "HASIL"];
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  // Modified code - don't filter by scheduledSeminars:
  const advisedSeminars = seminars.filter((seminar: any) =>
    seminar.advisors.some(
      (advisor: any) => advisor.lecturer?.nip === user.profile.nip
    )
  );

  // Modified code - don't filter by scheduledSeminars:
  const assessedSeminars = seminars.filter((seminar: any) =>
    seminar.assessors.some(
      (assessor: any) => assessor.lecturer?.nip === user.profile.nip
    )
  );

  // Combined filtering logic for advised seminars
  const filteredAdvisedSeminars = advisedSeminars.filter((seminar: any) => {
    const matchesSearch =
      seminar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seminar.studentNIM.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seminar.student.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = statusFilter === "all" || seminar.type === statusFilter;
    return matchesSearch && matchesType;
  });

  // Combined filtering logic for assessed seminars
  const filteredAssessedSeminars = assessedSeminars.filter((seminar: any) => {
    const matchesSearch =
      seminar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seminar.studentNIM.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seminar.student.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = statusFilter === "all" || seminar.type === statusFilter;
    return matchesSearch && matchesType;
  });

  // Fungsi untuk format tanggal
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fungsi untuk format waktu
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <LecturerLayout>
      <div className="container mx-auto p-4">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome, {user.profile?.name}!
            </h1>
            <p className="text-muted-foreground bg-p">
              NIP: {user.profile?.nip}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/seminar-proposal">
                <BookOpen className="mr-2 h-4 w-4" />
                Seminar Proposal
              </Link>
            </Button>
            <Button asChild>
              <Link to="/seminar-hasil">
                <FileText className="mr-2 h-4 w-4" />
                Seminar Hasil
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(80px,_auto)] gap-4 mb-6">
          <Card className="bg-radial-[at_380%_380%] from-primary-600 from-80% to-20% to-primary-800 border-primary-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl -mb-1 font-heading font-black text-primary-foreground">
                Dibimbing
              </CardTitle>
              <CardDescription className="text-primary-foreground text-sm">
                Menunggu untuk dinilai
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-5xl -my-1 font-bold text-primary-foreground font-heading">
                  {
                    advisedSeminars.filter(
                      (seminar: any) => seminar.status === "SCHEDULED"
                    ).length
                  }
                </div>
                <div className="p-2 bg-primary rounded-full border-primary-foreground border">
                  <ClipboardList className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-primary-400 text-primary-700 hover:bg-accent"
                onClick={() => setActiveTab("overview")}
              >
                Lihat Mahasiswa Bimbingan
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-radial-[at_380%_380%] from-primary-600 from-80% to-20% to-primary-800 border-primary-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl -mb-1 font-heading font-black text-primary-foreground">
                Diuji
              </CardTitle>
              <CardDescription className="text-primary-foreground text-sm">
                Menunggu untuk dinilai
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-5xl -my-1 font-bold text-primary-foreground font-heading">
                  {
                    assessedSeminars.filter(
                      (seminar: any) => seminar.status === "SCHEDULED"
                    ).length
                  }
                </div>
                <div className="p-2 bg-primary rounded-full border-primary-foreground border">
                  <ClipboardPenLine className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-primary-400 text-primary-700 hover:bg-accent"
                onClick={() => setActiveTab("submissions")}
              >
                Lihat Mahasiswa Diuji
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-radial-[at_380%_380%] from-primary-600 from-80% to-20% to-primary-800 border-primary-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl -mb-1 font-heading font-black text-primary-foreground">
                Selesai
              </CardTitle>
              <CardDescription className="text-primary-foreground text-sm">
                Telah selesai dinilai
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-5xl -my-1 font-bold text-primary-foreground font-heading">
                  {completedSeminars.length}
                </div>
                <div className="p-2 bg-primary rounded-full border-primary-foreground border">
                  <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full border-primary-400 text-primary-700 hover:bg-accent"
                onClick={() => setActiveTab("completed")}
              >
                Lihat Riwayat Seminar
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="grid grid-cols-3 mb-6 bg-primary">
              <TabsTrigger
                value="overview"
                className={`text-primary-foreground ${
                  activeTab === "overview" ? "text-primary-800" : ""
                }`}
              >
                Dibimbing
              </TabsTrigger>
              <TabsTrigger
                value="submissions"
                className={`text-primary-foreground ${
                  activeTab === "submissions" ? "text-primary-800" : ""
                }`}
              >
                Diuji
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className={`text-primary-foreground ${
                  activeTab === "completed" ? "text-primary-800" : ""
                }`}
              >
                Selesai
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab - Now using a 4-column grid with minmax 200px */}
          <TabsContent value="overview">
            <Card className="bg-white">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl -mb-1 font-heading font-black text-primary-800">
                      Mahasiswa Dibimbing
                    </CardTitle>
                    <CardDescription className="text-primary">
                      Seminar yang menunggu dinilai
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-3 h-4 w-4 text-primary-600" />
                      <Input
                        type="search"
                        placeholder="Cari seminar..."
                        className="w-full md:w-[200px] pl-8 border-primary-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select defaultValue="all" onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px] border-primary-400">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {seminarTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {capitalize(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-6">
                {/* Desktop View */}
                <div className="hidden md:block rounded-sm overflow-x-auto border border-primary">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-primary text-primary-foreground font-heading font-medium text-xs lg:text-sm">
                        <th className="p-3 lg:p-4 w-[30%]">Judul Penelitian</th>
                        <th className="p-3 lg:p-4 w-[20%]">Mahasiswa</th>
                        <th className="p-3 lg:p-4 w-[15%]">Jadwal Seminar</th>
                        <th className="p-3 lg:p-4 w-[10%]">Tempat</th>
                        <th className="p-3 lg:p-4 w-[10%]">Jenis Seminar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdvisedSeminars.filter(
                        (seminar: any) => seminar.status === "SCHEDULED"
                      ).length > 0 ? (
                        filteredAdvisedSeminars
                          .filter(
                            (seminar: any) => seminar.status === "SCHEDULED"
                          )
                          .map((seminar: any) => (
                            <tr
                              key={seminar.id}
                              className="border-b border-primary-200 text-primary-800 text-xs lg:text-sm"
                            >
                              <td className="p-3 lg:p-4">
                                <div className="font-medium">
                                  {seminar.title}
                                </div>
                              </td>
                              <td className="p-3 lg:p-4">
                                <div className="font-medium text-primary-800">
                                  {seminar.student?.name || "N/A"}
                                </div>
                                <div className="text-sm text-primary-600">
                                  {seminar.studentNIM}
                                </div>
                              </td>
                              <td className="p-3 lg:p-4">
                                <div>{formatDate(seminar.time)}</div>
                                <div className="text-sm text-primary-600">
                                  {formatTime(seminar.time)} WIB
                                </div>
                              </td>
                              <td className="p-3 lg:p-4">
                                {seminar.room || "TBD"}
                              </td>
                              <td className="p-3 lg:p-4">
                                <Badge
                                  variant="outline"
                                  className="mt-1 text-primary-800"
                                >
                                  {seminar.type}
                                </Badge>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-4 text-center text-primary-600"
                          >
                            Tidak ada mahasiswa yang dibimbing.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                  <div className="space-y-3 sm:space-y-4">
                    {filteredAdvisedSeminars.filter(
                      (seminar: any) => seminar.status === "SCHEDULED"
                    ).length > 0 ? (
                      filteredAdvisedSeminars
                        .filter(
                          (seminar: any) => seminar.status === "SCHEDULED"
                        )
                        .map((seminar: any) => (
                          <div
                            key={seminar.id}
                            className="border border-primary rounded-sm p-2 sm:p-3 text-primary-800 shadow-sm"
                          >
                            <div className="space-y-2 sm:space-y-3">
                              <div>
                                <h3 className="text-xs font-bold text-primary-600">
                                  Judul
                                </h3>
                                <p className="font-medium text-xs sm:text-sm break-words line-clamp-2 sm:line-clamp-none">
                                  {seminar.title}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                <div>
                                  <h3 className="text-xs font-bold text-primary-600">
                                    Mahasiswa
                                  </h3>
                                  <p className="text-xs sm:text-sm truncate">
                                    {seminar.student?.name || "N/A"}
                                  </p>
                                  <p className="text-xs text-primary-600">
                                    {seminar.studentNIM}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-xs font-bold text-primary-600">
                                    Tanggal & Waktu
                                  </h3>
                                  <p className="text-xs sm:text-sm">
                                    {formatDate(
                                      seminar.time || seminar.createdAt
                                    )}
                                  </p>
                                  <p className="text-xs text-primary-600">
                                    {seminar.time
                                      ? formatTime(seminar.time)
                                      : "TBD"}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                <div>
                                  <h3 className="text-xs font-bold text-primary-600">
                                    Ruangan
                                  </h3>
                                  <p className="text-xs sm:text-sm">
                                    {seminar.room || "TBD"}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-xs font-bold text-primary-600">
                                    Jenis Seminar
                                  </h3>
                                  <p className="text-xs sm:text-sm">
                                    <Badge
                                      variant="outline"
                                      className="mt-1 text-primary-800"
                                    >
                                      {seminar.type}
                                    </Badge>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="border border-primary rounded-sm p-3 text-center text-primary-600 text-xs sm:text-sm">
                        Tidak ada mahasiswa yang dibimbing.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Submissions Tab */}
          <TabsContent value="submissions">
            <Card className="bg-white">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl -mb-1 font-heading font-black text-primary-800">
                      Mahasiswa Diuji
                    </CardTitle>
                    <CardDescription className="text-primary">
                      Seminar yang menunggu dinilai
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-3 h-4 w-4 text-primary-600" />
                      <Input
                        type="search"
                        placeholder="Cari seminar..."
                        className="w-full md:w-[200px] pl-8 border-primary-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select defaultValue="all" onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px] border-primary-400">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {seminarTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {capitalize(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-6">
                {/* Desktop View */}
                <div className="hidden md:block rounded-sm overflow-x-auto border border-primary">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-primary text-primary-foreground font-heading font-medium text-xs lg:text-sm">
                        <th className="p-3 lg:p-4 w-[30%]">Judul Penelitian</th>
                        <th className="p-3 lg:p-4 w-[20%]">Mahasiswa</th>
                        <th className="p-3 lg:p-4 w-[15%]">Jadwal Seminar</th>
                        <th className="p-3 lg:p-4 w-[10%]">Tempat</th>
                        <th className="p-3 lg:p-4 w-[10%]">Jenis Seminar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssessedSeminars.filter(
                        (seminar: any) => seminar.status === "SCHEDULED"
                      ).length > 0 ? (
                        filteredAssessedSeminars
                          .filter(
                            (seminar: any) => seminar.status === "SCHEDULED"
                          )
                          .map((seminar: any) => (
                            <tr
                              key={seminar.id}
                              className="border-b border-primary-200 text-primary-800 text-xs lg:text-sm"
                            >
                              <td className="p-3 lg:p-4">
                                <div className="font-medium">
                                  {seminar.title}
                                </div>
                              </td>
                              <td className="p-3 lg:p-4">
                                <div className="font-medium text-primary-800">
                                  {seminar.student?.name || "N/A"}
                                </div>
                                <div className="text-sm text-primary-600">
                                  {seminar.studentNIM}
                                </div>
                              </td>
                              <td className="p-3 lg:p-4">
                                <div>{formatDate(seminar.time)}</div>
                                <div className="text-sm text-primary-600">
                                  {formatTime(seminar.time)} WIB
                                </div>
                              </td>
                              <td className="p-3 lg:p-4">
                                {seminar.room || "TBD"}
                              </td>
                              <td className="p-3 lg:p-4">
                                <Badge
                                  variant="outline"
                                  className="mt-1 text-primary-800"
                                >
                                  {seminar.type}
                                </Badge>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-4 text-center text-primary-600"
                          >
                            Tidak ada mahasiswa yang diuji.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                  <div className="space-y-3 sm:space-y-4">
                    {filteredAssessedSeminars.filter(
                      (seminar: any) => seminar.status === "SCHEDULED"
                    ).length > 0 ? (
                      filteredAssessedSeminars
                        .filter(
                          (seminar: any) => seminar.status === "SCHEDULED"
                        )
                        .map((seminar: any) => (
                          <div
                            key={seminar.id}
                            className="border border-primary rounded-sm p-2 sm:p-3 text-primary-800 shadow-sm"
                          >
                            <div className="space-y-2 sm:space-y-3">
                              <div>
                                <h3 className="text-xs font-bold text-primary-600">
                                  Judul
                                </h3>
                                <p className="font-medium text-xs sm:text-sm break-words line-clamp-2 sm:line-clamp-none">
                                  {seminar.title}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                <div>
                                  <h3 className="text-xs font-bold text-primary-600">
                                    Mahasiswa
                                  </h3>
                                  <p className="text-xs sm:text-sm truncate">
                                    {seminar.student?.name || "N/A"}
                                  </p>
                                  <p className="text-xs text-primary-600">
                                    {seminar.studentNIM}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-xs font-bold text-primary-600">
                                    Tanggal & Waktu
                                  </h3>
                                  <p className="text-xs sm:text-sm">
                                    {formatDate(
                                      seminar.time || seminar.createdAt
                                    )}
                                  </p>
                                  <p className="text-xs text-primary-600">
                                    {seminar.time
                                      ? formatTime(seminar.time)
                                      : "TBD"}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                <div>
                                  <h3 className="text-xs font-bold text-primary-600">
                                    Ruangan
                                  </h3>
                                  <p className="text-xs sm:text-sm">
                                    {seminar.room || "TBD"}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-xs font-bold text-primary-600">
                                    Jenis Seminar
                                  </h3>
                                  <p className="text-xs sm:text-sm">
                                    <Badge
                                      variant="outline"
                                      className="mt-1 text-primary-800"
                                    >
                                      {seminar.type}
                                    </Badge>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="border border-primary rounded-sm p-3 text-center text-primary-600 text-xs sm:text-sm">
                        Tidak ada mahasiswa yang diuji.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Seminars Tab */}
          <TabsContent value="completed">
            <Card className="bg-white">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <CardTitle className="text-primary-700">
                      Riwayat Seminar
                    </CardTitle>
                    <CardDescription className="text-primary-600">
                      Seminar yang telah selesai dinilai
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-3 h-4 w-4 text-primary-600" />
                      <Input
                        type="search"
                        placeholder="Cari seminar..."
                        className="w-full md:w-[200px] pl-8 border-primary-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select defaultValue="all" onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] border-primary-400">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {seminarTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {capitalize(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="dibimbing" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6 bg-primary">
                    <TabsTrigger
                      value="dibimbing"
                      className="text-primary-foreground data-[state=active]:text-primary-800"
                    >
                      Dibimbing
                    </TabsTrigger>
                    <TabsTrigger
                      value="diuji"
                      className="text-primary-foreground data-[state=active]:text-primary-800"
                    >
                      Diuji
                    </TabsTrigger>
                  </TabsList>

                  {/* Dibimbing Tab */}
                  <TabsContent value="dibimbing">
                    {/* Desktop View */}
                    <div className="hidden md:block rounded-sm overflow-x-auto border border-primary">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-primary text-primary-foreground font-heading font-medium text-xs lg:text-sm">
                            <th className="p-3 lg:p-4 w-[30%]">
                              Judul Penelitian
                            </th>
                            <th className="p-3 lg:p-4 w-[20%]">Mahasiswa</th>
                            <th className="p-3 lg:p-4 w-[15%]">
                              Jadwal Seminar
                            </th>
                            <th className="p-3 lg:p-4 w-[10%]">Tempat</th>
                            <th className="p-3 lg:p-4 w-[10%]">
                              Jenis Seminar
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAdvisedSeminars.filter(
                            (seminar: any) => seminar.status === "COMPLETED"
                          ).length > 0 ? (
                            filteredAdvisedSeminars
                              .filter(
                                (seminar: any) => seminar.status === "COMPLETED"
                              )
                              .map((seminar: any) => (
                                <tr
                                  key={seminar.id}
                                  className="border-b border-primary-200 text-primary-800 text-xs lg:text-sm"
                                >
                                  <td className="p-3 lg:p-4">
                                    <div className="font-medium">
                                      {seminar.title}
                                    </div>
                                  </td>
                                  <td className="p-3 lg:p-4">
                                    <div className="font-medium text-primary-800">
                                      {seminar.student?.name || "N/A"}
                                    </div>
                                    <div className="text-sm text-primary-600">
                                      {seminar.studentNIM}
                                    </div>
                                  </td>
                                  <td className="p-3 lg:p-4">
                                    <div>{formatDate(seminar.time)}</div>
                                    <div className="text-sm text-primary-600">
                                      {formatTime(seminar.time)} WIB
                                    </div>
                                  </td>
                                  <td className="p-3 lg:p-4">
                                    {seminar.room || "TBD"}
                                  </td>
                                  <td className="p-3 lg:p-4">
                                    <Badge
                                      variant="outline"
                                      className="mt-1 text-primary-800"
                                    >
                                      {seminar.type}
                                    </Badge>
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td
                                colSpan={6}
                                className="p-4 text-center text-primary-600"
                              >
                                Tidak ada seminar yang telah selesai.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden">
                      <div className="space-y-3 sm:space-y-4">
                        {filteredAdvisedSeminars.filter(
                          (seminar: any) => seminar.status === "COMPLETED"
                        ).length > 0 ? (
                          filteredAdvisedSeminars
                            .filter(
                              (seminar: any) => seminar.status === "COMPLETED"
                            )
                            .map((seminar: any) => (
                              <div
                                key={seminar.id}
                                className="border border-primary rounded-sm p-2 sm:p-3 text-primary-800 shadow-sm"
                              >
                                <div className="space-y-2 sm:space-y-3">
                                  <div>
                                    <h3 className="text-xs font-bold text-primary-600">
                                      Judul
                                    </h3>
                                    <p className="font-medium text-xs sm:text-sm break-words line-clamp-2 sm:line-clamp-none">
                                      {seminar.title}
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                    <div>
                                      <h3 className="text-xs font-bold text-primary-600">
                                        Mahasiswa
                                      </h3>
                                      <p className="text-xs sm:text-sm truncate">
                                        {seminar.student?.name || "N/A"}
                                      </p>
                                      <p className="text-xs text-primary-600">
                                        {seminar.studentNIM}
                                      </p>
                                    </div>
                                    <div>
                                      <h3 className="text-xs font-bold text-primary-600">
                                        Tanggal & Waktu
                                      </h3>
                                      <p className="text-xs sm:text-sm">
                                        {formatDate(
                                          seminar.time || seminar.createdAt
                                        )}
                                      </p>
                                      <p className="text-xs text-primary-600">
                                        {seminar.time
                                          ? formatTime(seminar.time)
                                          : "TBD"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                    <div>
                                      <h3 className="text-xs font-bold text-primary-600">
                                        Ruangan
                                      </h3>
                                      <p className="text-xs sm:text-sm">
                                        {seminar.room || "TBD"}
                                      </p>
                                    </div>
                                    <div>
                                      <h3 className="text-xs font-bold text-primary-600">
                                        Jenis Seminar
                                      </h3>
                                      <p className="text-xs sm:text-sm">
                                        <Badge
                                          variant="outline"
                                          className="mt-1 text-primary-800"
                                        >
                                          {seminar.type}
                                        </Badge>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="border border-primary rounded-sm p-3 text-center text-primary-600 text-xs sm:text-sm">
                            Tidak seminar yang telah selesai.
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Diuji Tab */}
                  <TabsContent value="diuji">
                    {/* Desktop View */}
                    <div className="hidden md:block rounded-sm overflow-x-auto border border-primary">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-primary text-primary-foreground font-heading font-medium text-xs lg:text-sm">
                            <th className="p-3 lg:p-4 w-[30%]">
                              Judul Penelitian
                            </th>
                            <th className="p-3 lg:p-4 w-[20%]">Mahasiswa</th>
                            <th className="p-3 lg:p-4 w-[15%]">
                              Jadwal Seminar
                            </th>
                            <th className="p-3 lg:p-4 w-[10%]">Tempat</th>
                            <th className="p-3 lg:p-4 w-[10%]">
                              Jenis Seminar
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAssessedSeminars.filter(
                            (seminar: any) => seminar.status === "COMPLETED"
                          ).length > 0 ? (
                            filteredAssessedSeminars
                              .filter(
                                (seminar: any) => seminar.status === "COMPLETED"
                              )
                              .map((seminar: any) => (
                                <tr
                                  key={seminar.id}
                                  className="border-b border-primary-200 text-primary-800 text-xs lg:text-sm"
                                >
                                  <td className="p-3 lg:p-4">
                                    <div className="font-medium">
                                      {seminar.title}
                                    </div>
                                  </td>
                                  <td className="p-3 lg:p-4">
                                    <div className="font-medium text-primary-800">
                                      {seminar.student?.name || "N/A"}
                                    </div>
                                    <div className="text-sm text-primary-600">
                                      {seminar.studentNIM}
                                    </div>
                                  </td>
                                  <td className="p-3 lg:p-4">
                                    <div>{formatDate(seminar.time)}</div>
                                    <div className="text-sm text-primary-600">
                                      {formatTime(seminar.time)} WIB
                                    </div>
                                  </td>
                                  <td className="p-3 lg:p-4">
                                    {seminar.room || "TBD"}
                                  </td>
                                  <td className="p-3 lg:p-4">
                                    <Badge
                                      variant="outline"
                                      className="mt-1 text-primary-800"
                                    >
                                      {seminar.type}
                                    </Badge>
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td
                                colSpan={6}
                                className="p-4 text-center text-primary-600"
                              >
                                Tidak ada seminar yang telah selesai
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden">
                      <div className="space-y-3 sm:space-y-4">
                        {filteredAssessedSeminars.filter(
                          (seminar: any) => seminar.status === "COMPLETED"
                        ).length > 0 ? (
                          filteredAssessedSeminars
                            .filter(
                              (seminar: any) => seminar.status === "COMPLETED"
                            )
                            .map((seminar: any) => (
                              <div
                                key={seminar.id}
                                className="border border-primary rounded-sm p-2 sm:p-3 text-primary-800 shadow-sm"
                              >
                                <div className="space-y-2 sm:space-y-3">
                                  <div>
                                    <h3 className="text-xs font-bold text-primary-600">
                                      Judul
                                    </h3>
                                    <p className="font-medium text-xs sm:text-sm break-words line-clamp-2 sm:line-clamp-none">
                                      {seminar.title}
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                    <div>
                                      <h3 className="text-xs font-bold text-primary-600">
                                        Mahasiswa
                                      </h3>
                                      <p className="text-xs sm:text-sm truncate">
                                        {seminar.student?.name || "N/A"}
                                      </p>
                                      <p className="text-xs text-primary-600">
                                        {seminar.studentNIM}
                                      </p>
                                    </div>
                                    <div>
                                      <h3 className="text-xs font-bold text-primary-600">
                                        Tanggal & Waktu
                                      </h3>
                                      <p className="text-xs sm:text-sm">
                                        {formatDate(
                                          seminar.time || seminar.createdAt
                                        )}
                                      </p>
                                      <p className="text-xs text-primary-600">
                                        {seminar.time
                                          ? formatTime(seminar.time)
                                          : "TBD"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                    <div>
                                      <h3 className="text-xs font-bold text-primary-600">
                                        Ruangan
                                      </h3>
                                      <p className="text-xs sm:text-sm">
                                        {seminar.room || "TBD"}
                                      </p>
                                    </div>
                                    <div>
                                      <h3 className="text-xs font-bold text-primary-600">
                                        Jenis Seminar
                                      </h3>
                                      <p className="text-xs sm:text-sm">
                                        <Badge
                                          variant="outline"
                                          className="mt-1 text-primary-800"
                                        >
                                          {seminar.type}
                                        </Badge>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="border border-primary rounded-sm p-3 text-center text-primary-600 text-xs sm:text-sm">
                            Tidak ada seminar yang telah selesai
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LecturerLayout>
  );
};

export default LecturerDashboard;
