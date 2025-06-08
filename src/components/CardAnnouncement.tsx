"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { AnnouncementProps } from "@/configs/types";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface CardAnnouncementProps {
  announcement: AnnouncementProps;
  onManage: (announcement: AnnouncementProps) => void;
}

const CardAnnouncement = ({
  announcement,
  onManage,
}: CardAnnouncementProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const maxBadges = 3;
  const visibleBadges = announcement.visibility.slice(0, maxBadges);
  console.log(visibleBadges);

  return (
    <Card className="py-6 hover:shadow-md transition-all duration-200 border border-env-base/50 flex flex-col min-h-[400px]">
      <CardContent className="flex flex-col gap-4 flex-grow">
        <div className="flex flex-col gap-2">
          {announcement.image && (
            <img
              src={announcement.image}
              alt={announcement.title}
              className="w-full h-40 object-cover rounded-sm mb-3 border"
            />
          )}
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-heading text-env-darker font-medium text-xs sm:text-sm line-clamp-1">
                {announcement.title}
              </h3>
            </div>
            <div className="flex gap-2 items-center">
              <Calendar className="w-3 md:w-4 h-3 md:h-4 text-muted-foreground" />
              <p className="text-muted-foreground text-xs">
                {formatDate(announcement.createdAt)}
              </p>
            </div>
          </div>
          <p className="text-muted-foreground font-light text-xs sm:text-sm line-clamp-3 mb-2">
            {announcement.content}
          </p>
          <div className="flex gap-2 items-center">
            {visibleBadges.map((visibility, index) => (
              <Badge key={index} className="lowercase">
                {visibility}
              </Badge>
            ))}
          </div>
        </div>
        <div className="mt-auto">
          <Button
            variant="default"
            size="sm"
            className="w-full text-primary-foreground text-xs sm:text-sm"
            onClick={() => onManage(announcement)}
          >
            Kelola
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardAnnouncement;
