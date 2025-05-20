import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

const formSchema = z.object({
  title: z.string().min(1, "Judul tidak boleh kosong"),
  content: z.string().min(1, "Caption tidak boleh kosong"),
  visibility: z
    .array(z.enum(["STUDENT", "LECTURER", "PUBLIC"]))
    .min(1, "Pilih setidaknya satu visibilitas"),
  image: z.any().optional(),
});

interface ModalManageAnnouncementProps {
  announcement: {
    id: number;
    title: string;
    content: string;
    visibility: string[];
    image?: string;
  };
  onClose: () => void;
  onAnnouncementUpdated: (announcement: any) => void;
  onAnnouncementDeleted: (id: number) => void;
}

const ModalManageAnnouncement = ({
  announcement,
  onClose,
  onAnnouncementUpdated,
  onAnnouncementDeleted,
}: ModalManageAnnouncementProps) => {
  const { token, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    announcement.image || null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: announcement.title,
      content: announcement.content,
      visibility: announcement.visibility as any,
      image: null,
    },
  });

  useEffect(() => {
    form.reset({
      title: announcement.title,
      content: announcement.content,
      visibility: announcement.visibility as any,
      image: null,
    });
    setImagePreview(announcement.image || null);
  }, [announcement, form]);

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

      const response = await axios.put(
        `http://localhost:5500/api/announcements/${announcement.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        onAnnouncementUpdated(response.data.announcement);
        toast.success("Pengumuman berhasil diperbarui!");
        onClose();
      } else {
        setError(response.data.message);
        toast.error(response.data.message || "Gagal memperbarui pengumuman");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Terjadi kesalahan saat memperbarui pengumuman";
      setError(errorMessage);
      toast.error(errorMessage);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!token) {
      setError("Sesi tidak valid. Silakan login kembali.");
      logout();
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await axios.delete(
        `http://localhost:5500/api/announcements/${announcement.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        onAnnouncementDeleted(announcement.id);
        toast.success("Pengumuman berhasil dihapus!");
        onClose();
      } else {
        setError(response.data.message);
        toast.error(response.data.message || "Gagal menghapus pengumuman");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Terjadi kesalahan saat menghapus pengumuman";
      setError(errorMessage);
      toast.error(errorMessage);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kelola Pengumuman</DialogTitle>
          <DialogDescription>
            Edit atau hapus pengumuman yang sudah ada.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan judul pengumuman" {...field} />
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
                    <Input
                      placeholder="Masukkan caption pengumuman"
                      {...field}
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
                  <div className="space-y-2">
                    {["STUDENT", "LECTURER", "PUBLIC"].map((vis) => (
                      <FormItem
                        key={vis}
                        className="flex items-center space-x-2"
                      >
                        <FormControl>
                          <Checkbox
                            checked={form
                              .watch("visibility")
                              .includes(vis as any)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues("visibility");
                              if (checked) {
                                form.setValue("visibility", [
                                  ...current,
                                  vis as any,
                                ]);
                              } else {
                                form.setValue(
                                  "visibility",
                                  current.filter((v) => v !== vis)
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {vis === "STUDENT"
                            ? "Mahasiswa"
                            : vis === "LECTURER"
                            ? "Dosen"
                            : "Publik"}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    />
                  </FormControl>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-2 w-full h-48 object-cover rounded-md"
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <div className="text-red-500 rounded-md bg-red-50 p-2">
                {error}
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Hapus
              </Button>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Simpan
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalManageAnnouncement;
