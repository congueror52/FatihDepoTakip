
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
import type { SupportedCaliber, UsageScenario } from "@/types/inventory";
import { SUPPORTED_CALIBERS } from "@/types/inventory";

interface AmmunitionDailyUsageFormProps {
  usageScenarios: UsageScenario[];
}

type CaliberCheckboxState = Record<SupportedCaliber, boolean>;
type ScenarioConsumptionRates = Record<SupportedCaliber, number>;

export function AmmunitionDailyUsageForm({ usageScenarios }: AmmunitionDailyUsageFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const initialCheckboxState = SUPPORTED_CALIBERS.reduce((acc, caliber) => {
    acc[caliber] = false; // Default to unchecked
    return acc;
  }, {} as CaliberCheckboxState);

  const [checkedCalibers, setCheckedCalibers] = useState<CaliberCheckboxState>(initialCheckboxState);
  const [currentScenarioRates, setCurrentScenarioRates] = useState<ScenarioConsumptionRates | null>(null);

  const defaultValues: Partial<AmmunitionDailyUsageFormValues> = {
    date: format(new Date(), 'yyyy-MM-dd'),
    personnelCount: 0,
    usageScenarioId: undefined,
    used_9x19mm: 0,
    used_5_56x45mm: 0,
    used_7_62x39mm: 0,
    used_7_62x51mm: 0,
    // Add other calibers if SUPPORTED_CALIBERS is extended
    "used_12 Kalibre": 0,
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
        const newCheckedState = { ...initialCheckboxState };
        const scenarioRates: ScenarioConsumptionRates = {} as ScenarioConsumptionRates;

        scenario.consumptionRatesPerCaliber.forEach(rate => {
          if (SUPPORTED_CALIBERS.includes(rate.caliber)) {
            newCheckedState[rate.caliber] = true;
            scenarioRates[rate.caliber] = rate.roundsPerPerson;
          }
        });
        setCheckedCalibers(newCheckedState);
        setCurrentScenarioRates(scenarioRates);
      }
    } else {
      // No scenario selected, clear scenario-specific rates and uncheck all
      setCurrentScenarioRates(null);
      setCheckedCalibers(initialCheckboxState);
    }
  }, [selectedScenarioId, usageScenarios, initialCheckboxState]);

  const handleCheckboxChange = (caliber: SupportedCaliber, isChecked: boolean) => {
    setCheckedCalibers(prevState => ({ ...prevState, [caliber]: isChecked }));
  };

  useEffect(() => {
    const count = personnelCount > 0 ? personnelCount : 0;

    SUPPORTED_CALIBERS.forEach(caliber => {
      let formFieldName: keyof AmmunitionDailyUsageFormValues;
      switch (caliber) {
        case "9x19mm": formFieldName = "used_9x19mm"; break;
        case "5.56x45mm": formFieldName = "used_5_56x45mm"; break;
        case "7.62x39mm": formFieldName = "used_7_62x39mm"; break;
        case "7.62x51mm": formFieldName = "used_7_62x51mm"; break;
        case "12 Kalibre": formFieldName = "used_12 Kalibre"; break;
        default: return;
      }

      if (checkedCalibers[caliber] && currentScenarioRates && currentScenarioRates[caliber] !== undefined) {
        form.setValue(formFieldName, Math.round(count * currentScenarioRates[caliber]));
      } else if (checkedCalibers[caliber] && !currentScenarioRates) {
        // Caliber checked, but no scenario or rate in scenario: keep manual input or default to 0.
        // For now, if no scenario, assume manual entry or 0.
         if (form.getValues(formFieldName) === 0 && count > 0) { // Only overwrite if it was 0, to allow manual override
           // Potentially prompt user or have a default "manual mode" rate if desired
         }
      }
      else {
        form.setValue(formFieldName, 0);
      }
    });

  }, [personnelCount, currentScenarioRates, form, checkedCalibers]);


  async function onSubmit(data: AmmunitionDailyUsageFormValues) {
    try {
      await addAmmunitionDailyUsageLogAction(data);
      toast({ variant: "success", title: "Başarılı", description: "Günlük fişek kullanım kaydı başarıyla eklendi." });
      router.push("/daily-ammo-usage");
      router.refresh(); 
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || "Kayıt eklenirken hata oluştu." });
      console.error("Form gönderme hatası:", error);
    }
  }

  const caliberFields: {name: keyof AmmunitionDailyUsageFormValues, label: string, caliberKey: SupportedCaliber }[] = [
    { name: "used_9x19mm", label: "9x19mm (Adet)", caliberKey: "9x19mm" },
    { name: "used_5_56x45mm", label: "5.56x45mm (Adet)", caliberKey: "5.56x45mm" },
    { name: "used_7_62x39mm", label: "7.62x39mm (Adet)", caliberKey: "7.62x39mm" },
    { name: "used_7_62x51mm", label: "7.62x51mm (Adet)", caliberKey: "7.62x51mm" },
    { name: "used_12 Kalibre", label: "12 Kalibre (Adet)", caliberKey: "12 Kalibre" },
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
                  <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} />
                </FormControl>
                <FormDescription><span suppressHydrationWarning>Fişek miktarları seçili senaryo ve kalibreler için otomatik hesaplanacaktır.</span></FormDescription>
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
                onValueChange={(value) => {
                  if (value === "clear_scenario_selection") {
                    field.onChange(undefined);
                  } else {
                    field.onChange(value);
                  }
                }} 
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Bir senaryo seçin veya manuel devam edin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="clear_scenario_selection" disabled={!field.value}>
                    <span suppressHydrationWarning>Senaryo Seçimini Temizle</span>
                  </SelectItem>
                  {usageScenarios.map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      <span suppressHydrationWarning>{scenario.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription><span suppressHydrationWarning>Bir senaryo seçmek ilgili fişek kalibrelerini ve oranlarını otomatik olarak yükleyecektir.</span></FormDescription>
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
              render={({ field: valueField }) => ( 
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
                    <Input type="number" placeholder="0" {...valueField} onChange={e => valueField.onChange(parseInt(e.target.value, 10) || 0)} />
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
