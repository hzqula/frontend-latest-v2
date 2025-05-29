"use client";

import { useState } from "react"; // Hapus useEffect karena tidak lagi dibutuhkan
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
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";

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

interface ModalUploadDocumentsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: Record<string, File | null>;
  uploadedStatus: Record<string, boolean>;
  seminarId: number | null; // Tambahkan prop seminarId
}

const ModalUploadDocuments = ({
  open,
  onOpenChange,
  initialData,
  uploadedStatus,
  seminarId,
}: ModalUploadDocumentsProps) => {
  const { token } = useAuth();
  const [uploadedDocuments, setUploadedDocuments] =
    useState<Record<string, File | null>>(initialData);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});

  const handleFileUpload = (documentId: string, file: File | null) => {
    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        toast.error("File terlalu besar! Maksimal 2MB.");
        return;
      }
    }
    setUploadedDocuments((prev) => ({ ...prev, [documentId]: file }));
  };

  const handleSaveDocument = async (documentId: string) => {
    if (!seminarId) {
      toast.error(
        "Seminar ID tidak tersedia. Selesaikan detail seminar terlebih dahulu."
      );
      return;
    }

    const file = uploadedDocuments[documentId];
    if (!file && !uploadedStatus[documentId]) {
      toast.error("Silakan pilih file terlebih dahulu.");
      return;
    }

    setIsUploading((prev) => ({ ...prev, [documentId]: true }));
    setUploadProgress((prev) => ({ ...prev, [documentId]: 0 }));

    try {
      const formData = new FormData();
      formData.append("seminarId", seminarId.toString());
      formData.append("documentType", documentId);
      if (file) {
        formData.append("file", file);
      }

      const method = uploadedStatus[documentId] ? "PUT" : "POST";
      const endpoint = "http://localhost:5500/api/seminars/proposal-documents";

      // Simulasi progress unggah
      let progress = 0;
      const simulateProgress = setInterval(() => {
        progress += 10;
        setUploadProgress((prev) => ({ ...prev, [documentId]: progress }));
        if (progress >= 90) clearInterval(simulateProgress);
      }, 200);

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(simulateProgress);
      setUploadProgress((prev) => ({ ...prev, [documentId]: 100 }));

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal mengunggah dokumen.");
      }

      toast.success("Dokumen berhasil disimpan ke Google Drive!");
      uploadedStatus[documentId] = true; // Perbarui status di frontend
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan dokumen."
      );
    } finally {
      setIsUploading((prev) => ({ ...prev, [documentId]: false }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl -mb-1 font-heading font-black text-primary-800">
            Upload Dokumen yang Dibutuhkan
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Unggah dokumen yang diperlukan untuk seminar proposal Anda. Anda
            dapat menyimpan dokumen secara bertahap.
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
                    <p className="text-xs text-muted-foreground">
                      (Maksimal ukuran file: 2MB)
                    </p>
                  </div>
                  {uploadedStatus[document.id] && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <div className="relative gap-2 flex md:flex-row flex-col">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => window.open(document.template, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                      Download Template
                    </Button>

                    <div className="relative w-full">
                      <Button
                        variant={
                          uploadedStatus[document.id] ||
                          uploadedDocuments[document.id]
                            ? "outline"
                            : "default"
                        }
                        size="sm"
                        className="flex items-center gap-2 w-full justify-between"
                        disabled={isUploading[document.id]}
                      >
                        <span>
                          {uploadedStatus[document.id]
                            ? "Perbarui Dokumen"
                            : "Unggah Dokumen"}
                        </span>
                        <Upload className="h-4 w-4" />
                        <Input
                          type="file"
                          accept=".pdf"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileUpload(document.id, file);
                          }}
                          disabled={isUploading[document.id]}
                        />
                      </Button>
                      {uploadedDocuments[document.id] && (
                        <Button
                          variant="default"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => handleSaveDocument(document.id)}
                          disabled={isUploading[document.id]}
                        >
                          {isUploading[document.id] ? "Menyimpan..." : "Simpan"}
                        </Button>
                      )}
                      {uploadedStatus[document.id] && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => handleSaveDocument(document.id)}
                          disabled={isUploading[document.id]}
                        >
                          {isUploading[document.id] ? "Memperbarui..." : "Edit"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {uploadedDocuments[document.id] && (
                    <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      {uploadedDocuments[document.id]?.name}
                    </div>
                  )}
                  {(isUploading[document.id] ||
                    uploadProgress[document.id]) && (
                    <Progress
                      value={uploadProgress[document.id] || 0}
                      className="mt-2"
                    />
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
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalUploadDocuments;
