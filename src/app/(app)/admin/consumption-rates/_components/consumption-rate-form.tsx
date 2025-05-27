
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AmmunitionStandardConsumptionRate, SupportedCaliberForConsumption } from "@/types/inventory";
import { SUPPORTED_CALIBERS_FOR_CONSUMPTION } from "@/types/inventory";
import { ammunitionStandardConsumptionRateFormSchema, type AmmunitionStandardConsumptionRateFormValues } from "./consumption-rate-form-schema";
import { addAmmunitionStandardConsumptionRateAction, updateAmmunitionStandardConsumptionRateAction } from "@/lib/actions/inventory.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AmmunitionStandardConsumptionRateFormProps {
  rate?: AmmunitionStandardConsumptionRate;
}

export function AmmunitionStandardConsumptionRateForm({ rate }: AmmunitionStandardConsumptionRateFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const defaultValues: Partial<AmmunitionStandardConsumptionRateFormValues> = rate ? {
    ...rate,
  } : {
    caliber: undefined, 
    roundsPerPerson: 0,
  };
  
  const form = useForm<AmmunitionStandardConsumptionRateFormValues>({
    resolver: zodResolver(ammunitionStandardConsumptionRateFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: AmmunitionStandardConsumptionRateFormValues) {
    try {
      if (rate) {
        await updateAmmunitionStandardConsumptionRateAction({ ...data, id: rate.id, lastUpdated: rate.lastUpdated });
        toast({ title: "Başarılı", description: "Fişek sarfiyat oranı başarıyla güncellendi." });
      } else {
        await addAmmunitionStandardConsumptionRateAction(data);
        toast({ title: "Başarılı", description: "Fişek sarfiyat oranı başarıyla eklendi." });
      }
      router.push("/admin/consumption-rates");
      router.refresh(); 
    } catch (error: any) {
       toast({ variant: "destructive", title: "Hata", description: error.message || `Fişek sarfiyat oranı ${rate ? 'güncellenirken' : 'eklenirken'} hata oluştu.` });
      console.error("Form gönderme hatası:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="caliber"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span suppressHydrationWarning>Fişek Kalibresi</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!rate}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Bir kalibre seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SUPPORTED_CALIBERS_FOR_CONSUMPTION.map(cal => (
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
          name="roundsPerPerson"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span suppressHydrationWarning>Kişi Başı Fişek Adedi</span></FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? <span suppressHydrationWarning>Kaydediliyor...</span> : (rate ? <span suppressHydrationWarning>Oranı Güncelle</span> : <span suppressHydrationWarning>Oran Ekle</span>)}
        </Button>
      </form>
    </Form>
  );
}
