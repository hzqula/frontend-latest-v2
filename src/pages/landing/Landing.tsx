import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Announcement {
  id: number;
  title: string;
  content: string;
  image?: string;
  visibility: string[]; // Ubah ke array untuk sesuai dengan backend
  createdAt: string;
  coordinator: {
    name: string;
    profilePicture?: string;
  };
}

const LandingPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "http://localhost:5500/api/announcements/public"
        );
        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || "Gagal mengambil pengumuman");
          setIsLoading(false);
          return;
        }

        setAnnouncements(data.announcements);
      } catch (error) {
        console.error("Error fetching announcements:", error);
        toast.error("Terjadi kesalahan ketika mengambil pengumuman");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Selamat Datang!</h1>
      <h2 className="text-xl font-semibold mb-2">Pengumuman Publik</h2>
      {isLoading ? (
        <p>Memuat pengumuman...</p>
      ) : announcements.length === 0 ? (
        <p>Tidak ada pengumuman publik saat ini.</p>
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold">{announcement.title}</h3>
              <p className="text-gray-600">{announcement.content}</p>
              {announcement.image && (
                <img
                  src={announcement.image}
                  alt="Pengumuman"
                  className="mt-2 rounded max-w-full h-auto"
                />
              )}
              <p className="text-sm text-gray-500 mt-2">
                Dibuat oleh: {announcement.coordinator.name} pada{" "}
                {new Date(announcement.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandingPage;
