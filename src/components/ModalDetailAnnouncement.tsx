"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AnnouncementProps } from "@/configs/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ModalDetailAnnouncementProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: AnnouncementProps;
  themeColor?: string;
  hiddenFields?: ("coordinator" | "visibility" | "createdAt")[];
  actions?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline";
  }[];
  dateFormat?: string;
  maxWidth?: string;
}

const ModalDetailAnnouncement = ({
  isOpen,
  onClose,
  announcement,
  themeColor = "primary-400",
  hiddenFields = [],
  actions = [],
  dateFormat = "dd MMMM yyyy, HH:mm",
  maxWidth = "sm:max-w-[600px]",
}: ModalDetailAnnouncementProps) => {
  console.log("ModalDetailAnnouncement props:", { isOpen, announcement }); // Debug modal props

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-full ${maxWidth}`}>
        <DialogHeader>
          <DialogTitle className="text-env-darker">
            {announcement.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {announcement.image && (
            <img
              src={announcement.image}
              alt={announcement.title}
              className="w-full object-cover rounded-md"
            />
          )}
          <div>
            <h3 className="text-sm font-semibold text-env-darker">Caption</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {announcement.content}
            </p>
          </div>
          {!hiddenFields.includes("visibility") && (
            <div>
              <h3 className="text-sm font-semibold text-env-darker">
                Visibilitas
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {announcement.visibility
                  .map((vis) =>
                    vis === "STUDENT"
                      ? "Mahasiswa"
                      : vis === "LECTURER"
                      ? "Dosen"
                      : "Publik"
                  )
                  .join(", ")}
              </p>
            </div>
          )}
          {!hiddenFields.includes("coordinator") &&
            announcement.coordinator && (
              <div>
                <h3 className="text-sm font-semibold text-env-darker">
                  Dibuat Oleh
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {announcement.coordinator.name || "Tidak diketahui"}
                </p>
              </div>
            )}
          {!hiddenFields.includes("createdAt") && (
            <div>
              <h3 className="text-sm font-semibold text-env-darker">
                Tanggal Dibuat
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {format(new Date(announcement.createdAt), dateFormat, {
                  locale: id,
                })}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || "default"}
              className="text-xs sm:text-sm"
            >
              {action.label}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className={`text-xs sm:text-sm border-${themeColor}`}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalDetailAnnouncement;
