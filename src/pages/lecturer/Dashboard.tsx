// pages/Dashboard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApiData } from "@/hooks/useApiData";
import { toast } from "react-toastify";
import LecturerLayout from "@/components/layouts/LecturerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  File,
  Folder,
  Signpost,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { AnnouncementProps, Seminar } from "@/configs/types";
import ModalDetailAnnouncement from "@/components/ModalDetailAnnouncement";
import LineChartLecturerSeminars from "@/components/LineChartLecturerSeminars";

const LecturerDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementProps | null>(null);

  // Ambil data seminar
  const seminarsQuery = useApiData({ type: "seminars" });

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "http://localhost:5500/api/announcements/role",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || "Gagal mengambil pengumuman");
          setIsLoading(false);
          return;
        }

        console.log("Fetched announcements:", data.announcements);
        setAnnouncements(data.announcements);
      } catch (error) {
        console.error("Error fetching announcements:", error);
        toast.error("Terjadi kesalahan ketika mengambil pengumuman");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchAnnouncements();
    }
  }, [token]);

  // Filter announcements for LECTURER visibility, sort by createdAt, and limit to 5
  const lecturerAnnouncements = announcements
    .filter((a) => a.visibility.includes("LECTURER"))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  console.log("Lecturer announcements:", lecturerAnnouncements);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? lecturerAnnouncements.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === lecturerAnnouncements.length - 1 ? 0 : prev + 1
    );
  };

  const openModal = (announcement: AnnouncementProps) => {
    console.log("Opening modal with announcement:", announcement);
    setSelectedAnnouncement(announcement);
  };

  const closeModal = () => {
    console.log("Closing modal");
    setSelectedAnnouncement(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <LecturerLayout>
      <div className="flex flex-col mb-4">
        <h1 className="text-xl md:text-4xl font-heading font-black text-env-darker">
          Dashboard
        </h1>
        <p className="text-primary md:text-base text-sm">
          Assalamu'alaikum, selamat datang {user?.profile.name}
        </p>
      </div>
      <div className="grid grid-cols-1 auto-rows-[minmax(160px,_auto)] sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Pengumuman */}
        <Card className="col-span-1 sm:col-span-2 md:col-span-3 py-4 px-8 row-span-2 relative overflow-hidden border-border border rounded-md">
          <div className="w-full flex justify-between items-center mb-4">
            <h1 className="text-base md:text-lg font-heading font-bold text-primary">
              Pengumuman
            </h1>
            <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-red">
              <Signpost className="text-jewel-red w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
          {isLoading ? (
            <p className="text-center text-muted-foreground">
              Memuat pengumuman...
            </p>
          ) : lecturerAnnouncements.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Tidak ada pengumuman untuk Dosen.
            </p>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex flex-row gap-4 h-[200px]">
                <div className="w-1/2">
                  <img
                    src={
                      lecturerAnnouncements[currentIndex].image ||
                      "/placeholder.png"
                    }
                    alt={lecturerAnnouncements[currentIndex].title}
                    className="w-full h-full object-cover rounded-sm border-env-darker border-2"
                  />
                </div>
                <div className="w-1/2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="flex-2">
                        <h2 className="text-base md:text-lg font-bold text-env-darker">
                          {lecturerAnnouncements[currentIndex].title}
                        </h2>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Calendar className="w-3 md:w-4 h-3 md:h-4 text-muted-foreground" />
                        <p className="text-muted-foreground text-xs">
                          {formatDate(
                            lecturerAnnouncements[currentIndex].createdAt
                          )}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-3">
                      {lecturerAnnouncements[currentIndex].content}
                    </p>
                  </div>
                  <Button
                    variant="default"
                    className="text-xs sm:text-sm"
                    onClick={() =>
                      openModal(lecturerAnnouncements[currentIndex])
                    }
                  >
                    Lihat Postingan
                  </Button>
                </div>
              </div>
              {lecturerAnnouncements.length > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    disabled={lecturerAnnouncements.length <= 1}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div className="flex gap-2">
                    {lecturerAnnouncements.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentIndex
                            ? "bg-pastel-blue"
                            : "bg-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                    disabled={lecturerAnnouncements.length <= 1}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
        {/* Card Info 1 */}
        <Card className="col-span-1 row-span-1 justify-between gap-0 px-8 py-4 bg-background overflow-hidden relative order-2">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-muted-foreground">
              Info 1
            </h1>
            <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-green">
              <File className="text-jewel-green w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
          <p className="-mt-2 text-env-darker font-bold md:text-4xl text-3xl"></p>
          <CardFooter className="p-0 text-muted-foreground text-sm">
            Deskripsi dari info 1
          </CardFooter>
        </Card>
        {/* Card Info 2 */}
        <Card className="col-span-1 row-span-1 justify-between gap-0 px-8 py-4 bg-background overflow-hidden relative order-3">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-base md:text-lg font-heading font-bold text-muted-foreground">
              Info 2
            </h1>
            <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-full bg-pastel-blue">
              <Folder className="text-jewel-blue w-4 md:w-6 h-4 md:h-6" />
            </div>
          </div>
          <p className="-mt-2 text-env-darker font-bold md:text-4xl text-3xl"></p>
          <CardFooter className="p-0 text-muted-foreground text-sm">
            Deskripsi dari info 2
          </CardFooter>
        </Card>
        {/* Card Tren Seminar yang Dibimbing */}
        <Card className="bg-white sm:col-span-2 overflow-hidden order-4">
          <CardHeader className="bg-env-darker">
            <CardTitle className="text-xl md:text-2xl -mb-1 font-heading font-bold text-primary-foreground">
              Tren Seminar yang Dibimbing
            </CardTitle>
            <CardDescription className="text-primary-foreground text-sm">
              Jumlah seminar yang anda bimbing (proposal dan hasil)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {seminarsQuery.isLoading ? (
              <p className="text-center text-muted-foreground">
                Memuat data seminar...
              </p>
            ) : seminarsQuery.isError ? (
              <p className="text-center text-red-600">
                Gagal memuat data seminar.
              </p>
            ) : (
              <LineChartLecturerSeminars
                seminars={seminarsQuery.data || []}
                role="ADVISED"
              />
            )}
          </CardContent>
        </Card>
        {/* Card Tren Seminar yang Diuji */}
        <Card className="bg-white sm:col-span-2 overflow-hidden order-5">
          <CardHeader className="bg-env-darker">
            <CardTitle className="text-xl md:text-2xl -mb-1 font-heading font-bold text-primary-foreground">
              Tren Seminar yang Diuji
            </CardTitle>
            <CardDescription className="text-primary-foreground text-sm">
              Jumlah seminar yang anda uji (proposal dan hasil)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {seminarsQuery.isLoading ? (
              <p className="text-center text-muted-foreground">
                Memuat data seminar...
              </p>
            ) : seminarsQuery.isError ? (
              <p className="text-center text-red-600">
                Gagal memuat data seminar.
              </p>
            ) : (
              <LineChartLecturerSeminars
                seminars={seminarsQuery.data || []}
                role="ASSESSED"
              />
            )}
          </CardContent>
        </Card>
      </div>
      {selectedAnnouncement &&
        (console.log("Rendering modal with:", selectedAnnouncement),
        (
          <ModalDetailAnnouncement
            isOpen={!!selectedAnnouncement}
            onClose={closeModal}
            announcement={selectedAnnouncement}
            themeColor="pastel-red"
          />
        ))}
    </LecturerLayout>
  );
};

export default LecturerDashboard;
