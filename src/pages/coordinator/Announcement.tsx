"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import CoordinatorLayout from "@/components/layouts/CoordinatorLayout";
import ModalCreateAnnouncement from "@/components/ModalCreateAnnouncement";
import ModalManageAnnouncement from "@/components/ModalManageAnnouncement";
import CardAnnouncement from "@/components/CardAnnouncement";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/configs/apiClient";
import { AnnouncementProps } from "@/configs/types";

const Announcement = () => {
  const { token, logout } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementProps[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    toast.success("Pengumuman berhasil dibuat!");
  };

  const handleAnnouncementUpdated = () => {
    setSelectedAnnouncement(null);
    fetchAnnouncements();
  };

  const handleAnnouncementDeleted = () => {
    setSelectedAnnouncement(null);
    fetchAnnouncements();
  };

  return (
    <CoordinatorLayout>
      <div className="flex flex-col mb-4">
        <h1 className="text-xl md:text-4xl font-heading font-black text-env-darker">
          Pengumuman
        </h1>
        <p className="text-primary md:text-base text-sm">
          Di sini tempat Anda menambah, memperbarui, dan menghapus pengumuman
        </p>
      </div>
      <Button
        className="bg-env-base text-primary-foreground text-xs sm:text-sm"
        onClick={() => setIsCreateModalOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" /> Buat Pengumuman
      </Button>

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

      {!isLoading && announcements.length === 0 && !error && (
        <p className="text-center text-muted-foreground text-xs sm:text-sm">
          Belum ada pengumuman.
        </p>
      )}

      <div className="grid grid-cols-1 auto-rows-[minmax(160px,_auto)] sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {announcements.map((announcement) => (
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
