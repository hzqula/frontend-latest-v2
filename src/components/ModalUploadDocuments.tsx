// ModalUploadDocuments.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, Save, Loader2, FileEdit } from "lucide-react";
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
  seminarId: number | null;
  onDocumentUploaded: () => void;
}

const ModalUploadDocuments = ({
  open,
  onOpenChange,
  initialData,
  uploadedStatus,
  seminarId,
  onDocumentUploaded,
}: ModalUploadDocumentsProps) => {
  const { token } = useAuth();
  const [uploadedDocuments, setUploadedDocuments] =
    useState<Record<string, File | null>>(initialData);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const [isDragging, setIsDragging] = useState<Record<string, boolean>>({});
  const [localUploadedStatus, setLocalUploadedStatus] = useState<
    Record<string, boolean>
  >(() => {
    const initialStatus: Record<string, boolean> = {};
    requiredDocuments.forEach((doc) => {
      initialStatus[doc.id] = false;
    });
    return initialStatus;
  });

  // Gunakan useRef untuk melacak apakah modal baru saja dibuka
  const wasOpen = useRef<boolean>(false);

  // Sinkronkan state lokal dengan prop uploadedStatus hanya saat modal baru dibuka
  useEffect(() => {
    if (open && !wasOpen.current) {
      const updatedStatus: Record<string, boolean> = {};
      requiredDocuments.forEach((doc) => {
        updatedStatus[doc.id] = uploadedStatus[doc.id] ?? false;
      });
      setLocalUploadedStatus(updatedStatus);
      setUploadedDocuments({ ...initialData });
      console.log(
        "Test after sync",
        requiredDocuments.map((document) => updatedStatus[document.id])
      );
    }
    wasOpen.current = open;
  }, [open, uploadedStatus, initialData]);

  // Log untuk memantau perubahan localUploadedStatus
  useEffect(() => {
    console.log(
      "Test after state update",
      requiredDocuments.map((document) => localUploadedStatus[document.id])
    );
  }, [localUploadedStatus]);

  // Log untuk memantau perubahan uploadedStatus
  useEffect(() => {
    console.log(
      "Test uploadedStatus change",
      requiredDocuments.map((document) => uploadedStatus[document.id] ?? false)
    );
  }, [uploadedStatus]);

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

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    documentId: string
  ) => {
    e.preventDefault();
    setIsDragging((prev) => ({ ...prev, [documentId]: true }));
  };

  const handleDragLeave = (documentId: string) => {
    setIsDragging((prev) => ({ ...prev, [documentId]: false }));
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    documentId: string
  ) => {
    e.preventDefault();
    setIsDragging((prev) => ({ ...prev, [documentId]: false }));
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(documentId, file);
    }
  };

  const handleSaveDocument = async (documentId: string) => {
    if (!seminarId) {
      toast.error(
        "Seminar ID tidak tersedia. Selesaikan detail seminar terlebih dahulu."
      );
      return;
    }

    const file = uploadedDocuments[documentId];
    if (!file && !localUploadedStatus[documentId]) {
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

      const method = localUploadedStatus[documentId] ? "PUT" : "POST";
      const endpoint = "http://localhost:5500/api/seminars/proposal-documents";

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
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengunggah dokumen.");
      }

      toast.success("Dokumen berhasil disimpan ke Google Drive!");
      setLocalUploadedStatus((prev) => {
        const updated = { ...prev, [documentId]: true };
        console.log(
          "Test after upload",
          requiredDocuments.map((document) => updated[document.id])
        );
        return updated;
      });
      setUploadedDocuments((prev) => ({ ...prev, [documentId]: null }));
      onDocumentUploaded();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan dokumen."
      );
    } finally {
      setIsUploading((prev) => ({ ...prev, [documentId]: false }));
    }
  };

  const totalDocuments = requiredDocuments.length;

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

        <ScrollArea className="max-h-[60vh] pr-2">
          {requiredDocuments.map((document, index) => (
            <div key={document.id} className="border rounded-lg p-4 mb-2">
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
                {localUploadedStatus[document.id] && (
                  <div className="flex flex-row items-center gap-1">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-xs text-green-600 font-semibold">
                      {index + 1}/{totalDocuments}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <div
                  className={`border-2 border-dashed p-4 rounded-md ${
                    isDragging[document.id]
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                  onDragOver={(e) => handleDragOver(e, document.id)}
                  onDragLeave={() => handleDragLeave(document.id)}
                  onDrop={(e) => handleDrop(e, document.id)}
                >
                  <div className="flex flex-row items-center gap-2">
                    <label className="cursor-pointer text-xs inline-flex items-center justify-center px-3 py-[0.45rem] border-env-base border text-env-base rounded-md hover:bg-gray-100 transition-colors">
                      <Input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleFileUpload(document.id, file);
                        }}
                        disabled={isUploading[document.id]}
                      />
                      <FileEdit className="h-4 w-4 mr-2" />
                      {localUploadedStatus[document.id]
                        ? "Ubah File"
                        : "Pilih File"}
                    </label>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex items-center justify-center px-2 py-2 w-fit"
                      onClick={() => handleSaveDocument(document.id)}
                      disabled={
                        isUploading[document.id] ||
                        (!uploadedDocuments[document.id] &&
                          !localUploadedStatus[document.id]) ||
                        (localUploadedStatus[document.id] &&
                          !uploadedDocuments[document.id])
                      }
                    >
                      {isUploading[document.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {isDragging[document.id]
                      ? "Lepaskan file di sini"
                      : "Drag and drop file di sini"}
                  </p>
                </div>

                {uploadedDocuments[document.id] && (
                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {uploadedDocuments[document.id]?.name}
                  </div>
                )}
                {isUploading[document.id] &&
                  uploadProgress[document.id] < 100 && (
                    <Progress
                      value={uploadProgress[document.id] || 0}
                      className="mt-2 bg-env-base"
                    />
                  )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ModalUploadDocuments;
