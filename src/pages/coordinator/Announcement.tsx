import { useState, useEffect } from "react";
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

interface Announcement {
  id: number;
  title: string;
  content: string;
  visibility: string[];
  image?: string;
  createdAt: string;
}

export default function Announcement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/announcements", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data.success) {
          setAnnouncements(response.data.announcements);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Terjadi kesalahan saat mengambil data pengumuman");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleAnnouncementCreated = (newAnnouncement: Announcement) => {
    setAnnouncements([newAnnouncement, ...announcements]);
  };

  const handleAnnouncementUpdated = (updatedAnnouncement: Announcement) => {
    setAnnouncements(
      announcements.map((ann) =>
        ann.id === updatedAnnouncement.id ? updatedAnnouncement : ann
      )
    );
    setSelectedAnnouncement(null);
  };

  const handleAnnouncementDeleted = (id: number) => {
    setAnnouncements(announcements.filter((ann) => ann.id !== id));
    setSelectedAnnouncement(null);
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

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {!isLoading && announcements.length === 0 && (
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
}
