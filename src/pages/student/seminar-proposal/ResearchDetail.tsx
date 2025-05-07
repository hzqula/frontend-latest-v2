"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils"; // Pastikan Anda mengimpor cn jika digunakan
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
import { Plus, Minus, Check, ChevronsUpDown } from "lucide-react";
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

const formSchema = z.object({
  researchTitle: z
    .string()
    .min(10, "Research title must be at least 10 characters."),
  advisor1: z.string().min(1, "First supervisor is required."),
  advisor2: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ResearchDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
  initialData: {
    researchTitle: string;
    advisor1: string;
    advisor2: string;
  };
}

const ResearchDetailsModal = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: ResearchDetailsModalProps) => {
  const [showSecondSupervisor, setShowSecondSupervisor] = useState<boolean>(
    !!initialData.advisor2
  );
  const [assessor1Open, setAssessor1Open] = useState(false);
  const [assessor2Open, setAssessor2Open] = useState(false);

  const lecturersQuery = useApiData({ type: "lecturers" });
  const availableSupervisors = lecturersQuery.data || [];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      researchTitle: initialData.researchTitle || "",
      advisor1: initialData.advisor1 || "",
      advisor2: initialData.advisor2 || "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      toast.error("Gagal menyimpan detail seminar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSecondSupervisor = () => {
    setShowSecondSupervisor(!showSecondSupervisor);
    if (showSecondSupervisor) {
      form.setValue("advisor2", "");
    }
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
                  <FormLabel className="font-medium text-sm -mb-1 md:mb-2 block text-env-darker">
                    Judul Penelitian
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="text-xs md:text-sm md:placeholder:text-base placeholder:text-sm"
                      placeholder="Masukkan judul penelitian Anda"
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
                    <FormLabel className="font-medium text-sm -mb-1 md:mb-2 block text-env-darker">
                      Dosen Pembimbing I
                    </FormLabel>
                    <Popover
                      open={assessor1Open}
                      onOpenChange={setAssessor1Open}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={assessor1Open}
                            className={cn(
                              "w-full justify-between border-primary-400 text-primary-800",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <span className="truncate">
                              {field.value
                                ? availableSupervisors.find(
                                    (supervisor: { nip: string }) =>
                                      supervisor.nip === field.value
                                  )?.name
                                : "Pilih dosen"}
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
                                }) => (
                                  <CommandItem
                                    key={supervisor.nip}
                                    value={`${supervisor.name} ${supervisor.nip}`}
                                    onSelect={(selectedValue) => {
                                      form.setValue(
                                        "advisor1",
                                        selectedValue === field.value
                                          ? ""
                                          : supervisor.nip
                                      );
                                      setAssessor1Open(false);
                                    }}
                                    className="cursor-pointer pointer-events-auto"
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
                                        </div>
                                        <div className="text-xs text-left text-muted-foreground">
                                          {supervisor.nip}
                                        </div>
                                      </div>
                                    </div>
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4 flex-shrink-0",
                                        field.value === supervisor.nip
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                )
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                      <FormLabel className="font-medium text-sm -mb-1 md:mb-2 block text-env-darker">
                        Dosen Pembimbing II
                      </FormLabel>
                      <Popover
                        open={assessor2Open}
                        onOpenChange={setAssessor2Open}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={assessor2Open}
                              className={cn(
                                "w-full justify-between border-primary-400 text-primary-800",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <span className="truncate">
                                {field.value
                                  ? availableSupervisors.find(
                                      (supervisor: { nip: string }) =>
                                        supervisor.nip === field.value
                                    )?.name
                                  : "Pilih dosen"}
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
                                {availableSupervisors
                                  .filter(
                                    (supervisor: { nip: string }) =>
                                      supervisor.nip !==
                                      form.getValues("advisor1")
                                  )
                                  .map(
                                    (supervisor: {
                                      nip: string;
                                      name: string;
                                      profilePicture?: string;
                                    }) => (
                                      <CommandItem
                                        key={supervisor.nip}
                                        value={`${supervisor.name} ${supervisor.nip}`}
                                        onSelect={(selectedValue) => {
                                          form.setValue(
                                            "advisor2",
                                            selectedValue === field.value
                                              ? ""
                                              : supervisor.nip
                                          );
                                          setAssessor2Open(false);
                                        }}
                                        className="cursor-pointer pointer-events-auto"
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
                                            </div>
                                            <div className="text-xs text-left text-muted-foreground">
                                              {supervisor.nip}
                                            </div>
                                          </div>
                                        </div>
                                        <Check
                                          className={cn(
                                            "ml-auto h-4 w-4 flex-shrink-0",
                                            field.value === supervisor.nip
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    )
                                  )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
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
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ResearchDetailsModal;
