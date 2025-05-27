'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Firearm } from "@/types/inventory";
import { DEPOT_LOCATIONS } from "@/types/inventory";
import { firearmFormSchema, firearmStatuses, type FirearmFormValues } from "./firearm-form-schema";
import { addFirearmAction, updateFirearmAction } from "@/lib/actions/inventory.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";


interface FirearmFormProps {
  firearm?: Firearm; // Optional: for editing existing firearm
}

export function FirearmForm({ firearm }: FirearmFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const defaultValues: Partial<FirearmFormValues> = firearm ? {
    ...firearm,
    purchaseDate: firearm.purchaseDate ? format(new Date(firearm.purchaseDate), 'yyyy-MM-dd') : undefined,
  } : {
    status: 'Hizmette',
    depotId: DEPOT_LOCATIONS[0].id,
  };
  
  const form = useForm<FirearmFormValues>({
    resolver: zodResolver(firearmFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: FirearmFormValues) {
    try {
      const firearmData: Omit<Firearm, 'id' | 'lastUpdated' | 'itemType' | 'maintenanceHistory'> & { id?: string } = {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : undefined,
      };

      if (firearm) {
        await updateFirearmAction({ ...firearmData, id: firearm.id } as Firearm);
        toast({ title: "Başarılı", description: "Ateşli silah başarıyla güncellendi." });
      } else {
        await addFirearmAction(firearmData as Omit<Firearm, 'id' | 'lastUpdated' | 'itemType' | 'maintenanceHistory'>);
        toast({ title: "Başarılı", description: "Ateşli silah başarıyla eklendi." });
      }
      router.push("/inventory/firearms");
      router.refresh(); // To ensure the table data is up-to-date
    } catch (error) {
      toast({ variant: "destructive", title: "Hata", description: `Ateşli silah ${firearm ? 'güncellenirken' : 'eklenirken'} hata oluştu.` });
      console.error("Form gönderme hatası:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Ateşli Silah Adı / Tanımlayıcı</span></FormLabel>
                <FormControl>
                  <Input placeholder="örn. Tüfek #123, Birincil Tabanca" {...field} />
                </FormControl>
                <FormDescription><span suppressHydrationWarning>Kolay tanımlama için açıklayıcı bir ad.</span></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serialNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Seri Numarası</span></FormLabel>
                <FormControl>
                  <Input placeholder="SN123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Model</span></FormLabel>
                <FormControl>
                  <Input placeholder="örn. M4A1, Glock 19 Gen5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="manufacturer"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Üretici (İsteğe Bağlı)</span></FormLabel>
                <FormControl>
                  <Input placeholder="örn. Colt, Glock" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="caliber"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Kalibre</span></FormLabel>
                <FormControl>
                  <Input placeholder="örn. 5.56x45mm, 9mm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="depotId"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Depo Konumu</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Bir depo seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DEPOT_LOCATIONS.map(depot => (
                      <SelectItem key={depot.id} value={depot.id}><span suppressHydrationWarning>{depot.name}</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Durum</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {firearmStatuses.map(status => (
                      <SelectItem key={status} value={status}><span suppressHydrationWarning>{status}</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel><span suppressHydrationWarning>Satın Alma Tarihi (İsteğe Bağlı)</span></FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP", { locale: tr })
                        ) : (
                          <span suppressHydrationWarning>Bir tarih seçin</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      locale={tr}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span suppressHydrationWarning>Notlar (İsteğe Bağlı)</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ateşli silahla ilgili ek notlar..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <span suppressHydrationWarning>Kaydediliyor...</span> : (firearm ? <span suppressHydrationWarning>Ateşli Silahı Güncelle</span> : <span suppressHydrationWarning>Ateşli Silah Ekle</span>)}
        </Button>
      </form>
    </Form>
  );
}
