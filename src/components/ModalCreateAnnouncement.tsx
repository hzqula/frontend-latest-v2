"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { AnnouncementProps } from "@/configs/types";
import axios from "axios";

const formSchema = z.object({
  title: z.string().min(1, "Judul tidak boleh kosong"),
  content: z.string().min(1, "Caption tidak boleh kosong"),
  visibility: z
    .array(z.enum(["STUDENT", "LECTURER", "PUBLIC"]))
    .min(1, "Pilih setidaknya satu visibilitas"),
  image: z.any().optional(),
});

interface ModalCreateAnnouncementProps {
  isOpen: boolean;
  onClose: () => void;
  onAnnouncementCreated: (announcement: AnnouncementProps) => void;
}

const visibilityOptions: ("STUDENT" | "LECTURER" | "PUBLIC")[] = [
  "STUDENT",
  "LECTURER",
  "PUBLIC",
];

const ModalCreateAnnouncement = ({
  isOpen,
  onClose,
  onAnnouncementCreated,
}: ModalCreateAnnouncementProps) => {
  const { token, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      visibility: [],
      image: null,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token) {
      setError("Sesi tidak valid. Silakan login kembali.");
      logout();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("content", values.content);
      formData.append("visibility", JSON.stringify(values.visibility));
      if (values.image) {
        formData.append("image", values.image);
      }

      const response = await axios.post(
        "http://localhost:5500/api/announcements",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        onAnnouncementCreated(response.data.announcement);
        toast.success("Pengumuman berhasil dibuat!");
        onClose();
        form.reset();
        setImagePreview(null);
      } else {
        setError(response.data.message);
        toast.error(response.data.message || "Gagal membuat pengumuman");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Terjadi kesalahan saat membuat pengumuman";
      setError(errorMessage);
      toast.error(errorMessage);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Pengumuman Baru</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Gambar (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleImageChange}
                      className="text-xs sm:text-sm"
                    />
                  </FormControl>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-2 w-full max-h-48 object-cover rounded-md"
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan judul pengumuman"
                      {...field}
                      className="text-xs sm:text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan caption pengumuman"
                      {...field}
                      className="text-xs sm:text-sm"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visibility"
              render={() => (
                <FormItem>
                  <FormLabel>Visibilitas</FormLabel>
                  <div className="flex gap-2">
                    {visibilityOptions.map((vis) => {
                      const isSelected = form.watch("visibility").includes(vis);
                      return (
                        <Button
                          key={vis}
                          type="button"
                          variant="outline"
                          className={`flex-1 text-xs sm:text-sm border-primary-400 ${
                            isSelected
                              ? "border-2 bg-pastel-blue text-jewel-blue"
                              : "border bg-background text-primary-800"
                          }`}
                          onClick={() => {
                            const current = form.getValues("visibility");
                            if (isSelected) {
                              form.setValue(
                                "visibility",
                                current.filter((v) => v !== vis)
                              );
                            } else {
                              form.setValue("visibility", [...current, vis]);
                            }
                          }}
                        >
                          {vis === "STUDENT"
                            ? "Mahasiswa"
                            : vis === "LECTURER"
                            ? "Dosen"
                            : "Publik"}
                        </Button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <div className="text-red-500 rounded-md bg-pastel-red/20 p-2 text-xs sm:text-sm">
                {error}
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="text-xs sm:text-sm"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs sm:text-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalCreateAnnouncement;
