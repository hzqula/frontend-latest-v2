"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Search, ArrowUpDown } from "lucide-react";
import CoordinatorLayout from "@/components/layouts/CoordinatorLayout";
import ModalCreateAnnouncement from "@/components/ModalCreateAnnouncement";
import ModalManageAnnouncement from "@/components/ModalManageAnnouncement";
import CardAnnouncement from "@/components/CardAnnouncement";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/configs/apiClient";
import { AnnouncementProps } from "@/configs/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Announcement = () => {
  const { token, logout } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementProps[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: "createdAt" | "";
    direction: "ascending" | "descending" | null;
  }>({
    key: "",
    direction: null,
  });

  const fetchAnnouncements = useCallback(async () => {
    if (!token) {
      setError("Token tidak ditemukan. Silakan login kembali.");
      logout();
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.get("/announcements");

      if (response.data.success) {
        setAnnouncements(response.data.announcements);
        setError(null);
      } else {
        setError(response.data.message || "Gagal mengambil pengumuman");
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Sesi tidak valid. Silakan login kembali.");
        logout();
      } else {
        setError("Terjadi kesalahan saat mengambil data pengumuman");
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleAnnouncementCreated = () => {
    setIsCreateModalOpen(false);
    fetchAnnouncements();
  };

  const handleAnnouncementUpdated = () => {
    setSelectedAnnouncement(null);
    fetchAnnouncements();
  };

  const handleAnnouncementDeleted = () => {
    setSelectedAnnouncement(null);
    fetchAnnouncements();
  };

  // Sorting logic
  const requestSort = () => {
    let direction: "ascending" | "descending" | null = "ascending";
    if (sortConfig.key === "createdAt") {
      if (sortConfig.direction === "ascending") {
        direction = "descending";
      } else if (sortConfig.direction === "descending") {
        direction = null;
      }
    }
    setSortConfig({ key: "createdAt", direction });
  };

  // Get unique visibility options
  const visibilityOptions = useMemo(() => {
    const options = new Set<string>();
    announcements.forEach((announcement) => {
      announcement.visibility.forEach((vis) => options.add(vis));
    });
    return ["all", ...Array.from(options).sort()];
  }, [announcements]);

  // Filter and sort announcements
  const filteredAndSortedAnnouncements = useMemo(() => {
    let result = [...announcements];

    // Apply search filter
    if (searchQuery) {
      result = result.filter((announcement) =>
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply visibility filter
    if (visibilityFilter !== "all") {
      result = result.filter((announcement) =>
        announcement.visibility.includes(visibilityFilter)
      );
    }

    // Apply sorting
    if (sortConfig.key === "createdAt" && sortConfig.direction) {
      result.sort((a, b) => {
        const aValue = new Date(a.createdAt).getTime();
        const bValue = new Date(b.createdAt).getTime();
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [announcements, searchQuery, visibilityFilter, sortConfig]);

  return (
    <CoordinatorLayout>
      <div className="flex flex-col mb-4">
        <h1 className="text-xl md:text-4xl font-heading font-black text-env-darker">
          Pengumuman
        </h1>
        <p className="text-primary md:text-base text-sm">
          Di sini tempat Anda menambah, memperbarui, dan menghapus pengumuman
        </p>
        <div className="relative md:hidden mt-4 mb-2">
          <Search className="absolute left-2.5 top-1/4 h-4 w-4 text-primary-600" />
          <Input
            type="search"
            placeholder="Cari pengumuman berdasarkan judul"
            className="w-full pl-8 bg-background text-xs placeholder:text-xs border-primary-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4 items-center mb-4 justify-between mt-4">
          <div className="relative flex-2 hidden md:block">
            <Search className="absolute left-2.5 top-1/4 h-4 w-4 text-primary-600" />
            <Input
              type="search"
              placeholder="Cari pengumuman berdasarkan judul"
              className="w-full pl-8 bg-background border-primary-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="text-xs sm:text-sm border-primary-400 text-primary-800"
            onClick={requestSort}
          >
            Urutkan Tanggal
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
            <SelectTrigger className="w-[180px] bg-background text-xs sm:text-sm border-primary-400">
              <SelectValue placeholder="Filter visibilitas" />
            </SelectTrigger>
            <SelectContent>
              {visibilityOptions.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  className="text-xs sm:text-sm"
                >
                  {option === "all" ? "Semua Visibilitas" : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="bg-env-base text-primary-foreground text-xs sm:text-sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Buat Pengumuman
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-jewel-blue" />
        </div>
      )}

      {error && (
        <div className="text-red-500 mb-4 rounded-md bg-pastel-red/20 p-4 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {!isLoading && filteredAndSortedAnnouncements.length === 0 && !error && (
        <p className="text-center text-muted-foreground text-xs sm:text-sm">
          Tidak ada pengumuman yang ditemukan.
        </p>
      )}

      <div className="grid grid-cols-1 auto-rows-[minmax(160px,_auto)] sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredAndSortedAnnouncements.map((announcement) => (
          <CardAnnouncement
            key={announcement.id}
            announcement={announcement}
            onManage={setSelectedAnnouncement}
          />
        ))}
      </div>

      <ModalCreateAnnouncement
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAnnouncementCreated={handleAnnouncementCreated}
      />

      {selectedAnnouncement && (
        <ModalManageAnnouncement
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
          onAnnouncementUpdated={handleAnnouncementUpdated}
          onAnnouncementDeleted={handleAnnouncementDeleted}
        />
      )}
    </CoordinatorLayout>
  );
};

export default Announcement;
