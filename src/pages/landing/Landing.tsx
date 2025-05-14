import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Seminar } from "@/configs/types";
import { useApiData } from "@/hooks/useApiData";
import { Calendar, Info, MapPin, User } from "lucide-react";
import React, { useState } from "react";

const Landing = () => {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSeminar, setSelectedSeminar] = useState<any>(null);

  const seminarQuery = useApiData({ type: "seminars" });
  const seminars = seminarQuery.data || [];
  const isLoading = seminarQuery.isLoading;
  const isError = seminarQuery.isError;
  const refetch = seminarQuery.refetch;

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error...</div>;
  }

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

  const openDetailsModal = (seminar: Seminar) => {
    setSelectedSeminar(seminar);
    setDetailsModalOpen(true);
  };

  console.log("Seminar: ", seminars);

  return (
    <div>
      {seminars.map((seminar: Seminar, index: number) => (
        <Card
          key={index}
          className="overflow-hidden gap-2 border-l-4 hover:shadow-md transition-all duration-200"
        >
          <CardHeader className="pb-0">Test</CardHeader>
          <CardContent className="pb-2">
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <User size={12} className="text-primary-600" />
                <div>
                  <span className="text-xs">
                    {seminar.student?.name || "N/A"}
                  </span>
                  <span className="text-muted-foreground text-xs ml-2">
                    ({seminar.student?.nim || "N/A"})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={12} className="text-primary-600" />
                <div>
                  <span className="text-xs">{formatDate(seminar.time)}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    Jam {formatTime(seminar.time)} WIB
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-primary-600" />
                <span className="text-xs">{seminar.room || "TBD"}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 flex justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => openDetailsModal(seminar)}
            >
              <Info size={12} className="mr-1" />
              Lihat
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default Landing;
