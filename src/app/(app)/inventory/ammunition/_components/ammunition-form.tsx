
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
import type { Ammunition } from "@/types/inventory";
import { DEPOT_LOCATIONS, SUPPORTED_CALIBERS } from "@/types/inventory";
import { ammunitionFormSchema, ammunitionStatuses, type AmmunitionFormValues } from "./ammunition-form-schema";
import { addAmmunitionAction, updateAmmunitionAction } from "@/lib/actions/inventory.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface AmmunitionFormProps {
  ammunition?: Ammunition;
}

export function AmmunitionForm({ ammunition }: AmmunitionFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const defaultValues: Partial<AmmunitionFormValues> = ammunition ? {
    ...ammunition,
    purchaseDate: ammunition.purchaseDate ? format(new Date(ammunition.purchaseDate), 'yyyy-MM-dd') : undefined,
  } : {
    name: "",
    caliber: SUPPORTED_CALIBERS[0],
    quantity: 0,
    status: 'Mevcut',
    depotId: DEPOT_LOCATIONS[0].id,
  };
  
  const form = useForm<AmmunitionFormValues>({
    resolver: zodResolver(ammunitionFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: AmmunitionFormValues) {
    try {
      const payload = {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : undefined,
      };

      if (ammunition) {
        await updateAmmunitionAction({ ...ammunition, ...payload });
        toast({ variant: "success", title: "Başarılı", description: "Mühimmat başarıyla güncellendi." });
      } else {
        await addAmmunitionAction(payload);
        toast({ variant: "success", title: "Başarılı", description: "Mühimmat başarıyla eklendi." });
      }
      router.push("/inventory/ammunition");
      router.refresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Hata", description: `Mühimmat ${ammunition ? 'güncellenirken' : 'eklenirken'} hata oluştu.` });
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
                <FormLabel><span suppressHydrationWarning>Mühimmat Adı/Tanımı</span></FormLabel>
                <FormControl>
                  <Input placeholder="örn. 9mm FMJ MKE" {...field} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Bir kalibre seçin" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SUPPORTED_CALIBERS.map(cal => (
                      <SelectItem key={cal} value={cal}><span suppressHydrationWarning>{cal}</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Miktar (Adet)</span></FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1000" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
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
                    <SelectTrigger><SelectValue placeholder="Bir depo seçin" /></SelectTrigger>
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
                    <SelectTrigger><SelectValue placeholder="Durum seçin" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ammunitionStatuses.map(status => (
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
            name="bulletType"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Fişek Tipi (İsteğe Bağlı)</span></FormLabel>
                <FormControl>
                  <Input placeholder="örn. FMJ, HP, AP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lotNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Lot Numarası (İsteğe Bağlı)</span></FormLabel>
                <FormControl>
                  <Input placeholder="LOT123XYZ" {...field} />
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
                  <Input placeholder="örn. MKE, Sterling" {...field} />
                </FormControl>
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
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(new Date(field.value), "PPP", { locale: tr }) : <span suppressHydrationWarning>Bir tarih seçin</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
                <Textarea placeholder="Mühimmatla ilgili ek notlar..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? <span suppressHydrationWarning>Kaydediliyor...</span> : (ammunition ? <span suppressHydrationWarning>Mühimmatı Güncelle</span> : <span suppressHydrationWarning>Mühimmat Ekle</span>)}
        </Button>
      </form>
    </Form>
  );
}
