"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-toastify";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lecturer, Seminar } from "@/configs/types";
import { AvatarFallback } from "@/components/ui/avatar";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Schema validasi menggunakan Zod
const scheduleSchema = z.object({
  time: z.string().min(1, "Waktu seminar wajib diisi."),
  room: z.string().min(1, "Ruangan wajib diisi."),
  assessor1: z.string().min(1, "Dosen penguji 1 wajib dipilih."),
  assessor2: z.string().min(1, "Dosen penguji 2 wajib dipilih."),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ModalSchedulingSeminarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seminar: Seminar;
  lecturers: Lecturer[];
  token: string;
  onScheduleSuccess: () => void;
}

const ModalSchedulingSeminar = ({
  open,
  onOpenChange,
  seminar,
  lecturers,
  token,
  onScheduleSuccess,
}: ModalSchedulingSeminarProps) => {
  // Setup form dengan react-hook-form
  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      time: "",
      room: "",
      assessor1: "",
      assessor2: "",
    },
  });

  // State untuk Combobox
  const [assessor1Open, setAssessor1Open] = useState(false);
  const [assessor2Open, setAssessor2Open] = useState(false);

  // State untuk menyimpan tanggal dan waktu secara terpisah
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  // Fungsi untuk menggabungkan tanggal dan waktu
  const combineDateTime = (date: Date | null, time: Date | null): string => {
    if (!date || !time) return "";
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes());
    return combined.toISOString();
  };

  const handleScheduleSubmit = async (data: ScheduleFormData) => {
    try {
      const response = await axios.put(
        "http://localhost:5500/api/seminars/proposal-schedule",
        {
          seminarId: seminar.id,
          time: new Date(data.time).toISOString(),
          room: data.room,
          assessorNIPs: [data.assessor1, data.assessor2],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Seminar berhasil dijadwalkan!");
      onScheduleSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Gagal menjadwalkan seminar:", error);
      toast.error(
        "Gagal menjadwalkan seminar: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  // Dapatkan NIP dosen pembimbing dari seminar.advisors
  const advisorNIPs = seminar.advisors.map(
    (advisor) => advisor.lecturer?.nip || ""
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl -mb-1 font-heading font-semibold text-env-darker">
            Penjadwalan Seminar Proposal
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-muted-foreground">
            Atur jadwal seminar atau lihat detail seminar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleScheduleSubmit)}
            className="space-y-4 md:space-y-6"
          >
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-sm -mb-1 md:mb-0 block text-env-darker">
                    Waktu Seminar
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Kolom Tanggal (Kiri) */}
                      <div className="relative">
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date: Date | null) => {
                            setSelectedDate(date);
                            const combinedTime = combineDateTime(
                              date,
                              selectedTime
                            );
                            field.onChange(combinedTime);
                          }}
                          dateFormat="dd MMMM yyyy"
                          placeholderText="Pilih tanggal"
                          className="w-full border text-sm rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 px-4 py-2"
                          wrapperClassName="w-full"
                          minDate={new Date()}
                        />
                      </div>
                      {/* Kolom Waktu (Kanan) */}
                      <div className="relative">
                        <DatePicker
                          selected={selectedTime}
                          onChange={(time: Date | null) => {
                            setSelectedTime(time);
                            const combinedTime = combineDateTime(
                              selectedDate,
                              time
                            );
                            field.onChange(combinedTime);
                          }}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeFormat="HH:mm"
                          dateFormat="HH:mm"
                          placeholderText="Pilih waktu"
                          className="w-full border text-sm rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 px-4 py-2"
                          wrapperClassName="w-full"
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-sm -mb-1 md:mb-0 block text-env-darker">
                    Ruangan
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama ruangan"
                      {...field}
                      className="border-primary-400 text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assessor1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-sm -mb-1 md:mb-0 block text-env-darker">
                    Dosen Penguji 1
                  </FormLabel>
                  <Popover open={assessor1Open} onOpenChange={setAssessor1Open}>
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
                          <span className="truncate md:text-sm text-xs">
                            {field.value
                              ? lecturers.find(
                                  (lecturer: { nip: string }) =>
                                    lecturer.nip === field.value
                                )?.name
                              : "Pilih Dosen Penguji 1"}
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
                            {lecturers.map(
                              (lecturer: {
                                nip: string;
                                name: string;
                                profilePicture?: string;
                              }) => {
                                const isAdvisor = advisorNIPs.includes(
                                  lecturer.nip
                                );
                                const isSelectedAsAssessor2 =
                                  lecturer.nip === form.watch("assessor2");

                                return (
                                  <CommandItem
                                    key={lecturer.nip}
                                    value={`${lecturer.name} ${lecturer.nip}`}
                                    onSelect={() => {
                                      form.setValue("assessor1", lecturer.nip);
                                      setAssessor1Open(false);
                                    }}
                                    disabled={
                                      isAdvisor || isSelectedAsAssessor2
                                    }
                                    className={cn(
                                      "cursor-pointer pointer-events-auto",
                                      (isAdvisor || isSelectedAsAssessor2) &&
                                        "opacity-50"
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6 md:h-7 md:w-7">
                                        <AvatarImage
                                          src={
                                            lecturer.profilePicture
                                              ? lecturer.profilePicture
                                              : `https://robohash.org/${lecturer.name}`
                                          }
                                          alt="advisor-image"
                                          className="rounded-full"
                                        />
                                        <AvatarFallback className="bg-pastel-yellow text-jewel-yellow">
                                          {lecturer.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col">
                                        <div className="text-xs -mb-0.5 md:text-sm font-medium text-env-darker">
                                          {lecturer.name}
                                          {isAdvisor && (
                                            <span className="ml-2 text-xs text-primary-600">
                                              (Pembimbing)
                                            </span>
                                          )}
                                          {isSelectedAsAssessor2 && (
                                            <span className="ml-2 text-xs text-primary-600">
                                              (Penguji 2)
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-left text-muted-foreground">
                                          {lecturer.nip}
                                        </div>
                                      </div>
                                    </div>
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4 flex-shrink-0",
                                        field.value === lecturer.nip
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
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assessor2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-sm -mb-1 md:mb-0 block text-env-darker">
                    Dosen Penguji 2
                  </FormLabel>
                  <Popover open={assessor2Open} onOpenChange={setAssessor2Open}>
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
                          <span className="truncate md:text-sm text-xs">
                            {field.value
                              ? lecturers.find(
                                  (lecturer: { nip: string }) =>
                                    lecturer.nip === field.value
                                )?.name
                              : "Pilih Dosen Penguji 2"}
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
                            {lecturers.map(
                              (lecturer: {
                                nip: string;
                                name: string;
                                profilePicture?: string;
                              }) => {
                                const isAdvisor = advisorNIPs.includes(
                                  lecturer.nip
                                );
                                const isSelectedAsAssessor1 =
                                  lecturer.nip === form.watch("assessor1");

                                return (
                                  <CommandItem
                                    key={lecturer.nip}
                                    value={`${lecturer.name} ${lecturer.nip}`}
                                    onSelect={() => {
                                      form.setValue("assessor2", lecturer.nip);
                                      setAssessor2Open(false);
                                    }}
                                    disabled={
                                      isAdvisor || isSelectedAsAssessor1
                                    }
                                    className={cn(
                                      "cursor-pointer pointer-events-auto",
                                      (isAdvisor || isSelectedAsAssessor1) &&
                                        "opacity-50"
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6 md:h-7 md:w-7">
                                        <AvatarImage
                                          src={
                                            lecturer.profilePicture
                                              ? lecturer.profilePicture
                                              : `https://robohash.org/${lecturer.name}`
                                          }
                                          alt="advisor-image"
                                          className="rounded-full"
                                        />
                                        <AvatarFallback className="bg-pastel-yellow text-jewel-yellow">
                                          {lecturer.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col">
                                        <div className="text-xs -mb-0.5 md:text-sm font-medium text-env-darker">
                                          {lecturer.name}
                                          {isAdvisor && (
                                            <span className="ml-2 text-xs text-primary-600">
                                              (Pembimbing)
                                            </span>
                                          )}
                                          {isSelectedAsAssessor1 && (
                                            <span className="ml-2 text-xs text-primary-600">
                                              (Penguji 1)
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-left text-muted-foreground">
                                          {lecturer.nip}
                                        </div>
                                      </div>
                                    </div>
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4 flex-shrink-0",
                                        field.value === lecturer.nip
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
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <DialogFooter>
              <div className="w-full flex gap-4">
                <Button
                  variant="destructive"
                  className="w-1/3"
                  onClick={() => onOpenChange(false)}
                >
                  Batal
                </Button>
                <Button className="flex-1" type="submit">
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

export default ModalSchedulingSeminar;
