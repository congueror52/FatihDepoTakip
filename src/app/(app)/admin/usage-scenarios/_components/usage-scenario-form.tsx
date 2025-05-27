
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UsageScenario, SupportedCaliber } from "@/types/inventory";
import { SUPPORTED_CALIBERS } from "@/types/inventory";
import { usageScenarioFormSchema, type UsageScenarioFormValues, type ScenarioCaliberConsumptionFormValues } from "./usage-scenario-form-schema";
import { addUsageScenarioAction, updateUsageScenarioAction } from "@/lib/actions/inventory.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UsageScenarioFormProps {
  scenario?: UsageScenario;
}

export function UsageScenarioForm({ scenario }: UsageScenarioFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const defaultValues: Partial<UsageScenarioFormValues> = scenario ? {
    ...scenario,
    consumptionRatesPerCaliber: scenario.consumptionRatesPerCaliber.map(rate => ({
      ...rate,
      roundsPerPerson: rate.roundsPerPerson || 0, // Ensure number
    }))
  } : {
    name: "",
    description: "",
    consumptionRatesPerCaliber: [{ caliber: SUPPORTED_CALIBERS[0], roundsPerPerson: 0 }],
  };
  
  const form = useForm<UsageScenarioFormValues>({
    resolver: zodResolver(usageScenarioFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "consumptionRatesPerCaliber",
  });

  async function onSubmit(data: UsageScenarioFormValues) {
    try {
      const payload = {
        ...data,
        consumptionRatesPerCaliber: data.consumptionRatesPerCaliber.map(rate => ({
          ...rate,
          roundsPerPerson: Number(rate.roundsPerPerson) // Ensure it's a number
        }))
      };

      if (scenario) {
        await updateUsageScenarioAction({ ...payload, id: scenario.id, lastUpdated: scenario.lastUpdated });
        toast({ title: "Başarılı", description: "Kullanım senaryosu başarıyla güncellendi." });
      } else {
        await addUsageScenarioAction(payload);
        toast({ title: "Başarılı", description: "Kullanım senaryosu başarıyla eklendi." });
      }
      router.push("/admin/usage-scenarios");
      router.refresh(); 
    } catch (error: any) {
       toast({ variant: "destructive", title: "Hata", description: error.message || `Kullanım senaryosu ${scenario ? 'güncellenirken' : 'eklenirken'} hata oluştu.` });
      console.error("Form gönderme hatası:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span suppressHydrationWarning>Senaryo Adı</span></FormLabel>
              <FormControl>
                <Input placeholder="örn. Kadro Atışı - Tabanca, ACM Eğitimi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span suppressHydrationWarning>Açıklama (İsteğe Bağlı)</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Senaryo hakkında ek bilgiler..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
            <CardHeader>
                <CardTitle className="text-lg"><span suppressHydrationWarning>Kalibre Bazlı Sarfiyat Oranları</span></CardTitle>
                <CardDescription><span suppressHydrationWarning>Bu senaryo için kullanılacak her bir fişek kalibresi için kişi başı standart sarfiyat miktarını girin.</span></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {fields.map((item, index) => (
                   <div key={item.id} className="flex items-end gap-2 p-3 border rounded-md">
                     <FormField
                        control={form.control}
                        name={`consumptionRatesPerCaliber.${index}.caliber`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel><span suppressHydrationWarning>Fişek Kalibresi</span></FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Bir kalibre seçin" />
                                  </SelectTrigger>
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
                        name={`consumptionRatesPerCaliber.${index}.roundsPerPerson`}
                        render={({ field }) => (
                          <FormItem className="w-40">
                             <FormLabel><span suppressHydrationWarning>Kişi Başı Adet</span></FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                         <span className="sr-only" suppressHydrationWarning>Kalibre Oranını Sil</span>
                      </Button>
                   </div>
                 ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ caliber: SUPPORTED_CALIBERS[0], roundsPerPerson: 0 })}
                    className="mt-2"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Kalibre ve Oran Ekle</span>
                </Button>
                <FormField
                    control={form.control}
                    name="consumptionRatesPerCaliber"
                    render={() => <FormMessage />} 
                />
            </CardContent>
        </Card>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? <span suppressHydrationWarning>Kaydediliyor...</span> : (scenario ? <span suppressHydrationWarning>Senaryoyu Güncelle</span> : <span suppressHydrationWarning>Senaryo Ekle</span>)}
        </Button>
      </form>
    </Form>
  );
}
