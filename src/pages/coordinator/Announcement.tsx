import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { Loader2, Plus } from "lucide-react";
import ModalCreateAnnouncement from "@/components/ModalCreateAnnouncement";
import ModalManageAnnouncement from "@/components/ModalManageAnnouncement";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

interface Announcement {
  id: number;
  title: string;
  content: string;
  visibility: string[];
  image?: string;
  createdAt: string;
}

const Announcement = () => {
  const { token, logout } = useAuth(); // Gunakan AuthContext untuk token
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk mengambil pengumuman dari server
  const fetchAnnouncements = useCallback(async () => {
    if (!token) {
      setError("Token tidak ditemukan. Silakan login kembali.");
      logout();
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://localhost:5500/api/announcements",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

  // Panggil fetchAnnouncements saat komponen dimuat
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Handler untuk pengumuman baru
  const handleAnnouncementCreated = (newAnnouncement: Announcement) => {
    setIsCreateModalOpen(false);
    fetchAnnouncements(); // Ambil ulang data dari server
    toast.success("Pengumuman berhasil dibuat!");
  };

  // Handler untuk pengumuman yang diperbarui
  const handleAnnouncementUpdated = (updatedAnnouncement: Announcement) => {
    setSelectedAnnouncement(null);
    fetchAnnouncements(); // Ambil ulang data dari server
    toast.success("Pengumuman berhasil diperbarui!");
  };

  // Handler untuk pengumuman yang dihapus
  const handleAnnouncementDeleted = (id: number) => {
    setSelectedAnnouncement(null);
    fetchAnnouncements(); // Ambil ulang data dari server
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Pengumuman</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Buat Pengumuman
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-red-500 mb-4 rounded-md bg-red-50 p-4">
          {error}
        </div>
      )}

      {!isLoading && announcements.length === 0 && !error && (
        <p className="text-center text-gray-500">Belum ada pengumuman.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{announcement.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              {announcement.image && (
                <img
                  src={announcement.image}
                  alt={announcement.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              <p className="text-gray-600">{announcement.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                Visibilitas: {announcement.visibility.join(", ")}
              </p>
              <p className="text-sm text-gray-500">
                Dibuat:{" "}
                {new Date(announcement.createdAt).toLocaleDateString("id-ID")}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedAnnouncement(announcement)}
              >
                Kelola
              </Button>
            </CardFooter>
          </Card>
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
    </div>
  );
};

export default Announcement;
