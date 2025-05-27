
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
import { Textarea } from "@/components/ui/textarea";
import { ammunitionDailyUsageFormSchema, type AmmunitionDailyUsageFormValues } from "./usage-log-form-schema";
import { addAmmunitionDailyUsageLogAction } from "@/lib/actions/inventory.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useEffect } from "react";
import type { SupportedCaliberForConsumption } from "@/types/inventory";

interface AmmunitionDailyUsageFormProps {
  consumptionRates: Record<SupportedCaliberForConsumption, number>;
}

export function AmmunitionDailyUsageForm({ consumptionRates }: AmmunitionDailyUsageFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const defaultValues: Partial<AmmunitionDailyUsageFormValues> = {
    date: format(new Date(), 'yyyy-MM-dd'),
    personnelCount: 0,
    used_9x19mm: 0,
    used_5_56x45mm: 0,
    used_7_62x39mm: 0,
    used_7_62x51mm: 0,
    notes: "",
  };
  
  const form = useForm<AmmunitionDailyUsageFormValues>({
    resolver: zodResolver(ammunitionDailyUsageFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const personnelCount = form.watch("personnelCount");

  useEffect(() => {
    if (personnelCount > 0 && consumptionRates) {
      form.setValue("used_9x19mm", Math.round(personnelCount * (consumptionRates["9x19mm"] || 0)));
      form.setValue("used_5_56x45mm", Math.round(personnelCount * (consumptionRates["5.56x45mm"] || 0)));
      form.setValue("used_7_62x39mm", Math.round(personnelCount * (consumptionRates["7.62x39mm"] || 0)));
      form.setValue("used_7_62x51mm", Math.round(personnelCount * (consumptionRates["7.62x51mm"] || 0)));
    } else if (personnelCount === 0) {
        form.setValue("used_9x19mm", 0);
        form.setValue("used_5_56x45mm", 0);
        form.setValue("used_7_62x39mm", 0);
        form.setValue("used_7_62x51mm", 0);
    }
  }, [personnelCount, consumptionRates, form]);


  async function onSubmit(data: AmmunitionDailyUsageFormValues) {
    try {
      await addAmmunitionDailyUsageLogAction(data);
      toast({ title: "Başarılı", description: "Günlük fişek kullanım kaydı başarıyla eklendi." });
      router.push("/daily-ammo-usage");
      router.refresh(); 
    } catch (error) {
      toast({ variant: "destructive", title: "Hata", description: "Kayıt eklenirken hata oluştu." });
      console.error("Form gönderme hatası:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel><span suppressHydrationWarning>Tarih</span></FormLabel>
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
                      disabled={(date) => date > new Date()}
                      initialFocus
                      locale={tr}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="personnelCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Kişi Sayısı</span></FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormDescription><span suppressHydrationWarning>Fişek miktarları otomatik hesaplanacaktır.</span></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <h3 className="text-lg font-medium border-b pb-2" suppressHydrationWarning>Kullanılan Fişek Miktarları (Otomatik Hesaplandı)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField
            control={form.control}
            name="used_9x19mm"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>9x19mm (Adet)</span></FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="used_5_56x45mm"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>5.56x45mm (Adet)</span></FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="used_7_62x39mm"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>7.62x39mm (Adet)</span></FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="used_7_62x51mm"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>7.62x51mm (Adet)</span></FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
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
                  placeholder="Kullanımla ilgili ek notlar..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? <span suppressHydrationWarning>Kaydediliyor...</span> : <span suppressHydrationWarning>Kullanım Kaydı Ekle</span>}
        </Button>
      </form>
    </Form>
  );
}
