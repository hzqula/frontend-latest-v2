"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useApiData } from "@/hooks/useApiData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Minus,
  Check,
  ChevronsUpDown,
  Loader2,
  UserPlus,
} from "lucide-react";
import { toast } from "react-toastify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import axios from "axios";
import { Lecturer, RegisterSeminar, ExternalLecturer } from "@/configs/types";

const formSchema = z.object({
  researchTitle: z
    .string()
    .min(10, "Research title must be at least 10 characters."),
  advisor1: z.union([
    z.string().min(1, "First supervisor is required."),
    z.object({
      name: z.string().min(1, "Name is required."),
      externalId: z.string().min(1, "External ID is required."),
      contact: z.string().min(1, "Contact is required."),
    }),
  ]),
  advisor2: z.union([
    z.string().optional(),
    z
      .object({
        name: z.string().min(1, "Name is required."),
        externalId: z.string().min(1, "External ID is required."),
        contact: z.string().min(1, "Contact is required."),
      })
      .optional(),
  ]),
});

type FormData = z.infer<typeof formSchema>;

interface ModalDetailResearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    researchTitle: string;
    advisor1: string | ExternalLecturer;
    advisor2: string | ExternalLecturer | "";
  };
  user: any;
  token: string | null;
  lecturers: Lecturer[];
  seminar: RegisterSeminar;
  setSeminar: (seminar: RegisterSeminar) => void;
  setCurrentStep: (step: string) => void;
  seminarQuery: any;
}

const ModalDetailResearch = ({
  open,
  onOpenChange,
  initialData,
  user,
  token,
  lecturers,
  seminar,
  setSeminar,
  setCurrentStep,
  seminarQuery,
}: ModalDetailResearchProps) => {
  const [showSecondSupervisor, setShowSecondSupervisor] = useState<boolean>(
    !!initialData.advisor2
  );
  const [advisor1Open, setAdvisor1Open] = useState(false);
  const [advisor2Open, setAdvisor2Open] = useState(false);
  const [isAdvisor1External, setIsAdvisor1External] = useState<boolean>(
    typeof initialData.advisor1 !== "string"
  );
  const [isAdvisor2External, setIsAdvisor2External] = useState<boolean>(
    typeof initialData.advisor2 !== "string" && !!initialData.advisor2
  );

  const lecturersQuery = useApiData({ type: "lecturers" });
  const availableSupervisors = lecturersQuery.data || [];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      researchTitle: initialData.researchTitle || "",
      advisor1: isAdvisor1External
        ? (initialData.advisor1 as ExternalLecturer)
        : (initialData.advisor1 as string) || "",
      advisor2: isAdvisor2External
        ? (initialData.advisor2 as ExternalLecturer)
        : (initialData.advisor2 as string) || "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const advisorNIPs: string[] = [];
      const externalAdvisors: ExternalLecturer[] = [];

      if (typeof data.advisor1 === "string") {
        advisorNIPs.push(data.advisor1);
      } else {
        externalAdvisors.push(data.advisor1);
      }

      if (data.advisor2) {
        if (typeof data.advisor2 === "string") {
          advisorNIPs.push(data.advisor2);
        } else {
          externalAdvisors.push(data.advisor2);
        }
      }

      const endpoint = seminar.id
        ? `http://localhost:5500/api/seminars/proposal-register/${seminar.id}`
        : "http://localhost:5500/api/seminars/proposal-register";
      const method = seminar.id ? "put" : "post";

      const requestData = {
        title: data.researchTitle,
        advisorNIPs,
        externalAdvisors,
        ...(method === "post" && { studentNIM: user.profile.nim }),
      };

      const response = await axios({
        method,
        url: endpoint,
        data: requestData,
        headers: { Authorization: `Bearer ${token}` },
      });

      const newSeminarId = response.data.seminar.id;
      setSeminar({
        ...seminar,
        id: newSeminarId,
        title: data.researchTitle,
        advisors: [
          typeof data.advisor1 === "string"
            ? {
                lecturerNIP: data.advisor1,
                lecturerName:
                  lecturers.find(
                    (lecturer: Lecturer) => lecturer.nip === data.advisor1
                  )?.name || "",
                profilePicture:
                  lecturers.find(
                    (lecturer: Lecturer) => lecturer.nip === data.advisor1
                  )?.profilePicture || "",
              }
            : {
                externalLecturer: data.advisor1,
              },
          ...(data.advisor2
            ? [
                typeof data.advisor2 === "string"
                  ? {
                      lecturerNIP: data.advisor2,
                      lecturerName:
                        lecturers.find(
                          (lecturer: Lecturer) => lecturer.nip === data.advisor2
                        )?.name || "",
                      profilePicture:
                        lecturers.find(
                          (lecturer: Lecturer) => lecturer.nip === data.advisor2
                        )?.profilePicture || "",
                    }
                  : {
                      externalLecturer: data.advisor2,
                    },
              ]
            : []),
        ],
        status: "DRAFT",
        student:
          method === "post"
            ? { nim: user.profile.nim!, name: user.profile.name || "" }
            : seminar.student,
      });
      onOpenChange(false);
      setCurrentStep("step2");
      toast.success(
        method === "put"
          ? "Detail seminar berhasil diperbarui!"
          : "Detail seminar berhasil didaftarkan!"
      );

      seminarQuery.refetch();
    } catch (error: any) {
      console.error("Error updating seminar:", error.response?.data || error);
      toast.error(
        "Failed to update: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSecondSupervisor = () => {
    setShowSecondSupervisor(!showSecondSupervisor);
    if (showSecondSupervisor) {
      form.setValue("advisor2", "");
      setIsAdvisor2External(false);
    }
  };

  const toggleAdvisor1Type = () => {
    setIsAdvisor1External(!isAdvisor1External);
    form.setValue(
      "advisor1",
      isAdvisor1External ? "" : { name: "", externalId: "", contact: "" }
    );
  };

  const toggleAdvisor2Type = () => {
    setIsAdvisor2External(!isAdvisor2External);
    form.setValue(
      "advisor2",
      isAdvisor2External ? "" : { name: "", externalId: "", contact: "" }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl -mb-1 font-heading font-semibold text-env-darker">
            Detail Seminar Proposal
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-muted-foreground">
            Masukkan judul penelitian dan dosen pembimbing Anda.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="researchTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-sm -mb-1 md:mb-0 block text-env-darker">
                    Judul Penelitian
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="text-xs md:text-sm md:placeholder:text-sm placeholder:text-xs resize-y"
                      placeholder="Masukkan judul penelitian Anda"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="advisor1"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-medium text-sm -mb-1 md:mb-0 block text-env-darker">
                        Dosen Pembimbing 1
                      </FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={toggleAdvisor1Type}
                        className="text-primary-600 hover:text-env-darker"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        {isAdvisor1External
                          ? "Pilih Dosen Internal"
                          : "Tambah Dosen Eksternal"}
                      </Button>
                    </div>
                    {isAdvisor1External ? (
                      <div className="space-y-2">
                        <FormControl>
                          <Input
                            placeholder="Nama Dosen"
                            value={
                              (field.value as ExternalLecturer)?.name || ""
                            }
                            onChange={(e) =>
                              form.setValue("advisor1", {
                                ...(field.value as ExternalLecturer),
                                name: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                        <FormControl>
                          <Input
                            placeholder="ID Eksternal (misal NIDN)"
                            value={
                              (field.value as ExternalLecturer)?.externalId ||
                              ""
                            }
                            onChange={(e) =>
                              form.setValue("advisor1", {
                                ...(field.value as ExternalLecturer),
                                externalId: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                        <FormControl>
                          <Input
                            placeholder="Kontak (email atau nomor telepon)"
                            value={
                              (field.value as ExternalLecturer)?.contact || ""
                            }
                            onChange={(e) =>
                              form.setValue("advisor1", {
                                ...(field.value as ExternalLecturer),
                                contact: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    ) : (
                      <Popover
                        open={advisor1Open}
                        onOpenChange={setAdvisor1Open}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={advisor1Open}
                              className={cn(
                                "w-full justify-between border-primary-400 text-primary-800",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <span className="truncate md:text-sm text-xs">
                                {typeof field.value === "string" && field.value
                                  ? availableSupervisors.find(
                                      (advisor: { nip: string }) =>
                                        advisor.nip === field.value
                                    )?.name || "Tidak ditemukan"
                                  : "Pilih Dosen Pembimbing 1"}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popper-anchor-width)] p-0 z-[50]">
                          <Command className="bg-white">
                            <CommandInput
                              placeholder="Cari dosen..."
                              className="h-9"
                            />
                            <CommandList className="max-h-[200px] overflow-y-auto">
                              <CommandEmpty>
                                Tidak ada dosen ditemukan.
                              </CommandEmpty>
                              <CommandGroup>
                                {availableSupervisors.map(
                                  (supervisor: {
                                    nip: string;
                                    name: string;
                                    profilePicture?: string;
                                  }) => {
                                    const isSelectedAsAdvisor2 =
                                      typeof form.watch("advisor2") ===
                                        "string" &&
                                      supervisor.nip === form.watch("advisor2");
                                    return (
                                      <CommandItem
                                        key={supervisor.nip}
                                        value={`${supervisor.name} ${supervisor.nip}`}
                                        onSelect={() => {
                                          form.setValue(
                                            "advisor1",
                                            supervisor.nip
                                          );
                                          setAdvisor1Open(false);
                                        }}
                                        disabled={isSelectedAsAdvisor2}
                                        className={cn(
                                          "cursor-pointer pointer-events-auto",
                                          isSelectedAsAdvisor2 && "opacity-50"
                                        )}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Avatar className="h-6 w-6 md:h-7 md:w-7">
                                            <AvatarImage
                                              src={
                                                supervisor.profilePicture
                                                  ? supervisor.profilePicture
                                                  : `https://robohash.org/${supervisor.name}`
                                              }
                                              alt="advisor-image"
                                              className="rounded-full"
                                            />
                                            <AvatarFallback className="bg-pastel-yellow text-jewel-yellow">
                                              {supervisor.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex flex-col">
                                            <div className="text-xs -mb-0.5 md:text-sm font-medium text-env-darker">
                                              {supervisor.name}
                                              {isSelectedAsAdvisor2 && (
                                                <span className="ml-2 text-xs text-primary-600">
                                                  (Pembimbing 2)
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-xs text-left text-muted-foreground">
                                              {supervisor.nip}
                                            </div>
                                          </div>
                                        </div>
                                        <Check
                                          className={cn(
                                            "ml-auto h-4 w-4 flex-shrink-0",
                                            typeof field.value === "string" &&
                                              field.value === supervisor.nip
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    );
                                  }
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showSecondSupervisor && (
                <FormField
                  control={form.control}
                  name="advisor2"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="font-medium text-sm -mb-1 md:mb-0 block text-env-darker">
                          Dosen Pembimbing 2
                        </FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={toggleAdvisor2Type}
                          className="text-primary-600 hover:text-env-darker"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          {isAdvisor2External
                            ? "Pilih Dosen Internal"
                            : "Tambah Dosen Eksternal"}
                        </Button>
                      </div>
                      {isAdvisor2External ? (
                        <div className="space-y-2">
                          <FormControl>
                            <Input
                              placeholder="Nama Dosen"
                              value={
                                (field.value as ExternalLecturer)?.name || ""
                              }
                              onChange={(e) =>
                                form.setValue("advisor2", {
                                  ...((field.value as ExternalLecturer) || {
                                    name: "",
                                    externalId: "",
                                    contact: "",
                                  }),
                                  name: e.target.value,
                                })
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <Input
                              placeholder="ID Eksternal (misal NIDN)"
                              value={
                                (field.value as ExternalLecturer)?.externalId ||
                                ""
                              }
                              onChange={(e) =>
                                form.setValue("advisor2", {
                                  ...((field.value as ExternalLecturer) || {
                                    name: "",
                                    externalId: "",
                                    contact: "",
                                  }),
                                  externalId: e.target.value,
                                })
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <Input
                              placeholder="Kontak (email atau nomor telepon)"
                              value={
                                (field.value as ExternalLecturer)?.contact || ""
                              }
                              onChange={(e) =>
                                form.setValue("advisor2", {
                                  ...((field.value as ExternalLecturer) || {
                                    name: "",
                                    externalId: "",
                                    contact: "",
                                  }),
                                  contact: e.target.value,
                                })
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      ) : (
                        <Popover
                          open={advisor2Open}
                          onOpenChange={setAdvisor2Open}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={advisor2Open}
                                className={cn(
                                  "w-full justify-between border-primary-400 text-primary-800",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <span className="truncate md:text-sm text-xs">
                                  {typeof field.value === "string" &&
                                  field.value
                                    ? availableSupervisors.find(
                                        (supervisor: { nip: string }) =>
                                          supervisor.nip === field.value
                                      )?.name || "Tidak ditemukan"
                                    : "Pilih Dosen Pembimbing 2"}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popper-anchor-width)] p-0 z-[50]">
                            <Command className="bg-white">
                              <CommandInput
                                placeholder="Cari dosen..."
                                className="h-9"
                              />
                              <CommandList className="max-h-[200px] overflow-y-auto">
                                <CommandEmpty>
                                  Tidak ada dosen ditemukan.
                                </CommandEmpty>
                                <CommandGroup>
                                  {availableSupervisors.map(
                                    (supervisor: {
                                      nip: string;
                                      name: string;
                                      profilePicture?: string;
                                    }) => {
                                      const isSelectedAsAdvisor1 =
                                        typeof form.watch("advisor1") ===
                                          "string" &&
                                        supervisor.nip ===
                                          form.watch("advisor1");
                                      return (
                                        <CommandItem
                                          key={supervisor.nip}
                                          value={`${supervisor.name} ${supervisor.nip}`}
                                          onSelect={() => {
                                            form.setValue(
                                              "advisor2",
                                              supervisor.nip
                                            );
                                            setAdvisor2Open(false);
                                          }}
                                          disabled={isSelectedAsAdvisor1}
                                          className={cn(
                                            "cursor-pointer pointer-events-auto",
                                            isSelectedAsAdvisor1 && "opacity-50"
                                          )}
                                        >
                                          <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6 md:h-7 md:w-7">
                                              <AvatarImage
                                                src={
                                                  supervisor.profilePicture
                                                    ? supervisor.profilePicture
                                                    : `https://robohash.org/${supervisor.name}`
                                                }
                                                alt="advisor-image"
                                                className="rounded-full"
                                              />
                                              <AvatarFallback className="bg-pastel-yellow text-jewel-yellow">
                                                {supervisor.name
                                                  .split(" ")
                                                  .map((n) => n[0])
                                                  .join("")}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                              <div className="text-xs -mb-0.5 md:text-sm font-medium text-env-darker">
                                                {supervisor.name}
                                                {isSelectedAsAdvisor1 && (
                                                  <span className="ml-2 text-xs text-primary-600">
                                                    (Pembimbing 1)
                                                  </span>
                                                )}
                                              </div>
                                              <div className="text-xs text-left text-muted-foreground">
                                                {supervisor.nip}
                                              </div>
                                            </div>
                                          </div>
                                          <Check
                                            className={cn(
                                              "ml-auto h-4 w-4 flex-shrink-0",
                                              typeof field.value === "string" &&
                                                field.value === supervisor.nip
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                        </CommandItem>
                                      );
                                    }
                                  )}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Button
              className="w-full"
              type="button"
              variant="outline"
              size="default"
              onClick={toggleSecondSupervisor}
              disabled={showSecondSupervisor && !form.getValues("advisor2")}
            >
              {showSecondSupervisor ? (
                <Minus className="h-4 w-4 mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {showSecondSupervisor
                ? "Hapus Dosen Pembimbing"
                : "Tambah Dosen Pembimbing"}
            </Button>
            <DialogFooter>
              <div className="w-full flex gap-4">
                <Button
                  variant="destructive"
                  className="w-1/3"
                  onClick={() => onOpenChange(false)}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalDetailResearch;
