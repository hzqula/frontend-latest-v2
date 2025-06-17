"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useApiData } from "@/hooks/useApiData";
import CoordinatorLayout from "@/components/layouts/CoordinatorLayout";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Seminar } from "@/configs/types";
import TableExternalSeminars from "@/components/TableExternalSeminars";

interface ExternalSeminarResponse {
  success: boolean;
  seminars: Seminar[];
  message: string;
}

export const ExternalAssessmentLink: React.FC = () => {
  const { token, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [filteredSeminars, setFilteredSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");

  const seminarQuery = useApiData({
    type: "seminarsWithExternalAdvisors",
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Belum ditentukan";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!token || !userRole) {
      navigate("/login");
      return;
    }

    if (userRole !== "COORDINATOR") {
      setError(
        "Akses ditolak: Anda tidak memiliki izin untuk mengakses halaman ini."
      );
      navigate("/login");
      return;
    }

    if (seminarQuery.isLoading) {
      setLoading(true);
    } else if (seminarQuery.isError) {
      setError("Gagal memuat data seminar. Silakan coba lagi.");
      setLoading(false);
    } else if (seminarQuery.data) {
      const response = seminarQuery.data as ExternalSeminarResponse;
      setSeminars(response.seminars);
      setFilteredSeminars(response.seminars);
      setLoading(false);
      setError(null);
    }
  }, [
    authLoading,
    token,
    userRole,
    navigate,
    seminarQuery.isLoading,
    seminarQuery.isError,
    seminarQuery.data,
  ]);

  useEffect(() => {
    const filtered = seminars.filter(
      (seminar) =>
        seminar.student?.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        seminar.student?.nim
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        seminar.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSeminars(filtered);
    setPage(1);
  }, [seminars, searchQuery]);

  const getStatusBadgeType = (status: string | null) => {
    switch (status) {
      case "DRAFT":
        return "bg-pastel-yellow text-jewel-yellow";
      case "SUBMITTED":
        return "bg-pastel-blue text-jewel-blue";
      case "SCHEDULED":
        return "bg-pastel-green text-jewel-green";
      case "COMPLETED":
        return "bg-pastel-purple text-jewel-purple";
      default:
        return "bg-pastel-gray text-jewel-gray";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
        role="alert"
      >
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <CoordinatorLayout>
      <div className="flex flex-col mb-4">
        <h1 className="text-xl md:text-4xl font-heading font-black text-env-darker">
          Seminar dengan Dosen Pembimbing Eksternal
        </h1>
        <p className="text-primary md:text-base text-sm">
          Kelola seminar yang memiliki dosen pembimbing eksternal dan link
          penilaian
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-1 sm:col-span-2 lg:col-span-4 overflow-hidden pt-2 pr-1 order-last">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="relative flex-2 hidden md:block">
              <Search className="absolute left-2.5 top-1/4 h-4 w-4 text-primary-600" />
              <Input
                type="search"
                placeholder="Cari berdasarkan nama mahasiswa, NIM, atau judul"
                className="w-full pl-8 bg-background border-primary-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="ml-auto">
              <Button onClick={() => seminarQuery.refetch()} size="sm">
                Refresh
              </Button>
            </div>
          </div>

          <div className="flex gap-4 items-center mb-4 justify-between">
            <div className="relative flex-2 md:hidden">
              <Search className="absolute left-2.5 top-1/4 h-4 w-4 text-primary-600" />
              <Input
                type="search"
                placeholder="Cari seminar..."
                className="w-full pl-8 bg-background border-primary-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={perPage.toString()}
              onValueChange={(value) => {
                setPerPage(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Seminar per halaman" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TableExternalSeminars
            seminars={filteredSeminars}
            formatDate={formatDate}
            formatTime={formatTime}
            getStatusBadgeType={getStatusBadgeType}
            totalPages={Math.ceil(filteredSeminars.length / perPage)}
            currentPage={page}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </div>
      </div>
    </CoordinatorLayout>
  );
};

export default ExternalAssessmentLink;
