"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const requiredDocuments = [
  {
    id: "THESIS_PROPOSAL",
    name: "Proposal Tugas Akhir",
    description: "Dokumen Proposal Tugas Akhir",
    template: "/templates/thesis_proposal_template.docx",
  },
  {
    id: "ADVISOR_AVAILABILITY",
    name: "Kesediaan Pembimbing",
    description: "Surat kesediaan dosen pembimbing yang ditandatangani",
    template: "/templates/advisor_availability_template.docx",
  },
  {
    id: "KRS",
    name: "Kartu Rencana Studi",
    description:
      "Kartu Rencana Studi (KRS) di semester ini yang sudah disetujui",
    template: "/templates/krs_template.pdf",
  },
  {
    id: "ADVISOR_ASSISTANCE",
    name: "Asistensi Pembimbing",
    description: "Bukti asistensi dengan dosen pembimbing",
    template: "/templates/advisor_assistance_template.pdf",
  },
  {
    id: "SEMINAR_ATTENDANCE",
    name: "Kehadiran Seminar",
    description: "Bukti kehadiran seminar proposal",
    template: "/templates/seminar_attendance_template.pdf",
  },
];

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (documents: Record<string, File | null>) => void;
  initialData: Record<string, File | null>;
  uploadedStatus: Record<string, boolean>;
}

const DocumentUploadModal = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  uploadedStatus,
}: DocumentUploadModalProps) => {
  const [uploadedDocuments, setUploadedDocuments] =
    useState<Record<string, File | null>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (documentId: string, file: File | null) => {
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("File terlalu besar! Maksimal 5MB.");
        return;
      }
    }
    setUploadedDocuments((prev) => ({ ...prev, [documentId]: file }));
  };

  const allDocumentsUploaded = () =>
    requiredDocuments.every(
      (doc) => uploadedDocuments[doc.id] !== null || uploadedStatus[doc.id]
    );

  const handleSubmit = async () => {
    if (!allDocumentsUploaded()) {
      toast.error("Silakan unggah semua dokumen yang dibutuhkan.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(uploadedDocuments);
      setIsSubmitting(false);
      onOpenChange(false);
    } catch (error) {
      setIsSubmitting(false);
      toast.error("Gagal menyimpan dokumen.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl -mb-1 font-heading font-black text-primary-800">
            Upload Dokumen yang Dibutuhkan
          </DialogTitle>
          <DialogDescription>
            Unggah semua dokumen yang diperlukan untuk seminar proposal Anda.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="space-y-4 max-h-[60vh] pr-2">
          <div className="space-y-4">
            {requiredDocuments.map((document) => (
              <div key={document.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-bold font-heading text-primary-800">
                      {document.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {document.description}
                    </p>
                  </div>
                  {uploadedStatus[document.id] && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <div className="relative gap-2 flex">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => window.open(document.template, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                      Download Template
                    </Button>

                    <Button
                      variant={
                        uploadedStatus[document.id] ||
                        uploadedDocuments[document.id]
                          ? "outline"
                          : "default"
                      }
                      size="sm"
                      className="flex items-center gap-2 w-full sm:w-auto"
                      disabled={isSubmitting}
                    >
                      <Upload className="h-4 w-4" />
                      {uploadedStatus[document.id]
                        ? "Perbarui Dokumen"
                        : "Unggah Dokumen"}
                      <Input
                        type="file"
                        accept=".pdf"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleFileUpload(document.id, file);
                        }}
                        disabled={isSubmitting}
                      />
                    </Button>
                  </div>

                  {uploadedDocuments[document.id] && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      {uploadedDocuments[document.id]?.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            className="w-1/3"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            className="w-2/3"
            onClick={handleSubmit}
            disabled={!allDocumentsUploaded() || isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadModal;
