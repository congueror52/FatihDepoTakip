
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
import type { AmmunitionStandardConsumptionRate } from "@/types/inventory";
import { SUPPORTED_CALIBERS } from "@/types/inventory";
import { consumptionRatesFormSchema, type ConsumptionRatesFormValues } from "./consumption-rates-form-schema";
import { updateAmmunitionStandardConsumptionRatesAction } from "@/lib/actions/inventory.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConsumptionRatesFormProps {
  initialRates: AmmunitionStandardConsumptionRate[];
}

export function ConsumptionRatesForm({ initialRates }: ConsumptionRatesFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  // Ensure all supported calibers are present in the form, even if not in initialRates
  const defaultFormRates = SUPPORTED_CALIBERS.map(caliber => {
    const existingRate = initialRates.find(r => r.caliber === caliber);
    return existingRate || { caliber, roundsPerPerson: 0 };
  });

  const form = useForm<ConsumptionRatesFormValues>({
    resolver: zodResolver(consumptionRatesFormSchema),
    defaultValues: { rates: defaultFormRates },
    mode: "onChange",
  });

  async function onSubmit(data: ConsumptionRatesFormValues) {
    try {
      await updateAmmunitionStandardConsumptionRatesAction(data.rates);
      toast({ variant: "success", title: "Başarılı", description: "Standart fişek sarfiyat oranları başarıyla güncellendi." });
      router.refresh(); // Re-fetch data on the page if needed or redirect
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || "Sarfiyat oranları güncellenirken bir hata oluştu." });
      console.error("Form submission error:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {form.getValues('rates').map((rate, index) => (
            <Card key={rate.caliber} className="shadow">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-md"><span suppressHydrationWarning>{rate.caliber}</span></CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name={`rates.${index}.roundsPerPerson`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only"><span suppressHydrationWarning>{rate.caliber} Kişi Başı Sarfiyat</span></FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}
        </div>
        <FormDescription>
          <span suppressHydrationWarning>Burada tanımlanan oranlar, bir kişinin standart bir durumda ilgili kalibredeki mühimmattan ne kadar tüketeceğini belirtir. Dashboard'daki yeterlilik tahminlerinde kullanılacaktır.</span>
        </FormDescription>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? <span suppressHydrationWarning>Kaydediliyor...</span> : <><Save className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Oranları Kaydet</span></>}
        </Button>
      </form>
    </Form>
  );
}
