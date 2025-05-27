
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { useEffect, useState } from "react";
import type { SupportedCaliberForConsumption, UsageScenario } from "@/types/inventory";
import { SUPPORTED_CALIBERS_FOR_CONSUMPTION } from "@/types/inventory";

interface AmmunitionDailyUsageFormProps {
  consumptionRates: Record<SupportedCaliberForConsumption, number>;
  usageScenarios: UsageScenario[];
}

type CaliberCheckboxState = Record<SupportedCaliberForConsumption, boolean>;

export function AmmunitionDailyUsageForm({ consumptionRates, usageScenarios }: AmmunitionDailyUsageFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const initialCheckboxState: CaliberCheckboxState = {
    "9x19mm": true,
    "5.56x45mm": true,
    "7.62x39mm": true,
    "7.62x51mm": true,
  };
  const [checkedCalibers, setCheckedCalibers] = useState<CaliberCheckboxState>(initialCheckboxState);

  const defaultValues: Partial<AmmunitionDailyUsageFormValues> = {
    date: format(new Date(), 'yyyy-MM-dd'),
    personnelCount: 0,
    usageScenarioId: undefined,
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
  const selectedScenarioId = form.watch("usageScenarioId");

  useEffect(() => {
    if (selectedScenarioId) {
      const scenario = usageScenarios.find(s => s.id === selectedScenarioId);
      if (scenario) {
        const newCheckedState = { ...initialCheckboxState }; // Start with all true or false based on preference
        SUPPORTED_CALIBERS_FOR_CONSUMPTION.forEach(caliber => {
          newCheckedState[caliber] = scenario.preselectedCalibers.includes(caliber);
        });
        setCheckedCalibers(newCheckedState);
      }
    } else {
      // If no scenario is selected, or cleared, reset to default or last manual state.
      // For simplicity, let's allow manual override to persist unless a new scenario is chosen.
      // Or reset to initial state if desired: setCheckedCalibers(initialCheckboxState);
    }
  }, [selectedScenarioId, usageScenarios]);

  const handleCheckboxChange = (caliber: SupportedCaliberForConsumption, isChecked: boolean) => {
    // When a checkbox is manually changed, we might want to clear the selected scenario
    // to indicate that the user is now in manual mode.
    // form.setValue("usageScenarioId", undefined, { shouldValidate: true }); // Optional: clear scenario on manual check
    
    setCheckedCalibers(prevState => ({ ...prevState, [caliber]: isChecked }));
    
    // No need to re-trigger calculation here, it's handled by the personnelCount useEffect
  };

  useEffect(() => {
    if (personnelCount > 0 && consumptionRates) {
      (SUPPORTED_CALIBERS_FOR_CONSUMPTION as readonly SupportedCaliberForConsumption[]).forEach(caliber => {
        let formFieldName: keyof AmmunitionDailyUsageFormValues;
        switch (caliber) {
          case "9x19mm": formFieldName = "used_9x19mm"; break;
          case "5.56x45mm": formFieldName = "used_5_56x45mm"; break;
          case "7.62x39mm": formFieldName = "used_7_62x39mm"; break;
          case "7.62x51mm": formFieldName = "used_7_62x51mm"; break;
          default: return;
        }
        if (checkedCalibers[caliber]) {
          form.setValue(formFieldName, Math.round(personnelCount * (consumptionRates[caliber] || 0)));
        } else {
          form.setValue(formFieldName, 0);
        }
      });
    } else if (personnelCount === 0) {
        form.setValue("used_9x19mm", 0);
        form.setValue("used_5_56x45mm", 0);
        form.setValue("used_7_62x39mm", 0);
        form.setValue("used_7_62x51mm", 0);
    }
  }, [personnelCount, consumptionRates, form, checkedCalibers]);


  async function onSubmit(data: AmmunitionDailyUsageFormValues) {
    try {
      await addAmmunitionDailyUsageLogAction(data);
      toast({ title: "Başarılı", description: "Günlük fişek kullanım kaydı başarıyla eklendi." });
      router.push("/daily-ammo-usage");
      router.refresh(); 
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || "Kayıt eklenirken hata oluştu." });
      console.error("Form gönderme hatası:", error);
    }
  }

  const caliberFields: {name: keyof AmmunitionDailyUsageFormValues, label: string, caliberKey: SupportedCaliberForConsumption }[] = [
    { name: "used_9x19mm", label: "9x19mm (Adet)", caliberKey: "9x19mm" },
    { name: "used_5_56x45mm", label: "5.56x45mm (Adet)", caliberKey: "5.56x45mm" },
    { name: "used_7_62x39mm", label: "7.62x39mm (Adet)", caliberKey: "7.62x39mm" },
    { name: "used_7_62x51mm", label: "7.62x51mm (Adet)", caliberKey: "7.62x51mm" },
  ];

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
                <FormDescription><span suppressHydrationWarning>Fişek miktarları seçili kalibreler için otomatik hesaplanacaktır.</span></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

         <FormField
          control={form.control}
          name="usageScenarioId"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span suppressHydrationWarning>Kullanım Senaryosu (İsteğe Bağlı)</span></FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Bir senaryo seçin veya manuel devam edin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="clear_scenario_selection" disabled={!field.value} onClick={() => form.setValue('usageScenarioId', undefined)}>
                    <span suppressHydrationWarning>Senaryo Seçimini Temizle</span>
                  </SelectItem>
                  {usageScenarios.map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      <span suppressHydrationWarning>{scenario.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription><span suppressHydrationWarning>Bir senaryo seçmek ilgili fişek kalibrelerini otomatik olarak işaretleyecektir.</span></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <h3 className="text-lg font-medium border-b pb-2" suppressHydrationWarning>Kullanılan Fişek Miktarları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {caliberFields.map((item) => (
            <FormField
              key={item.name}
              control={form.control}
              name={item.name} // This field still holds the calculated or manual value
              render={({ field: valueField }) => ( // Renamed field to avoid conflict
                <FormItem>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`checkbox_${item.caliberKey}`}
                      checked={checkedCalibers[item.caliberKey]}
                      onCheckedChange={(checked) => {
                        handleCheckboxChange(item.caliberKey, !!checked);
                      }}
                    />
                    <FormLabel htmlFor={`checkbox_${item.caliberKey}`} className="font-normal cursor-pointer">
                      <span suppressHydrationWarning>{item.label}</span>
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input type="number" placeholder="0" {...valueField} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
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
