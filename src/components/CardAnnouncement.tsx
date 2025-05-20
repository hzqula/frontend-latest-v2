import { Button } from "@/components/ui/button";
import { Announcement } from "@/configs/types";
import { Calendar } from "lucide-react";

interface CardAnnouncementProps {
  announcement: Announcement;
  onManage: () => void;
}

export default function CardAnnouncement({
  announcement,
  onManage,
}: CardAnnouncementProps) {
  return (
    <div className="relative flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      {announcement.image && (
        <img
          src={announcement.image}
          alt={announcement.title}
          className="h-48 w-full rounded-t-lg object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {announcement.title}
        </h3>
        <p className="mt-2 text-sm text-gray-600">{announcement.content}</p>
        <div className="mt-3 flex items-center text-sm text-gray-500">
          <Calendar className="mr-1 h-4 w-4" />
          <span>
            {new Date(announcement.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Oleh: {announcement.coordinator.name}
        </p>
      </div>
      <div className="p-4 pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onManage}
          className="w-full"
        >
          Kelola
        </Button>
      </div>
    </div>
  );
}
