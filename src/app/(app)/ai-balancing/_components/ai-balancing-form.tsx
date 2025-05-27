
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, PlusCircle, Trash2, CalendarIcon } from "lucide-react";
import { type DepotInventorySnapshot, type HistoricalUsageSnapshot, type UpcomingRequirementsSnapshot, DEPOT_LOCATIONS, type DepotId } from "@/types/inventory";
import { suggestRebalancing } from "@/lib/actions/inventory.actions";
import type { AiBalancingFormValues, UpcomingRequirementsFormValues } from "./ai-balancing-form-schema";
import { aiBalancingFormSchema, upcomingRequirementsSchema } from "./ai-balancing-form-schema";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";


interface AiBalancingFormProps {
  initialDepotAInventory: DepotInventorySnapshot;
  initialDepotBInventory: DepotInventorySnapshot;
  initialHistoricalUsage: HistoricalUsageSnapshot;
}

export function AiBalancingForm({ 
  initialDepotAInventory, 
  initialDepotBInventory, 
  initialHistoricalUsage 
}: AiBalancingFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any | null>(null); 
  const [showUpcomingReqForm, setShowUpcomingReqForm] = useState(false);

  const form = useForm<AiBalancingFormValues>({
    resolver: zodResolver(aiBalancingFormSchema),
    defaultValues: {
      depotAInventory: JSON.stringify(initialDepotAInventory, null, 2),
      depotBInventory: JSON.stringify(initialDepotBInventory, null, 2),
      historicalUsageData: JSON.stringify(initialHistoricalUsage, null, 2),
      upcomingRequirements: undefined, // This will hold data structured by upcomingRequirementsSchema
    },
  });
  
  const upcomingReqForm = useForm<UpcomingRequirementsFormValues>({
    resolver: zodResolver(upcomingRequirementsSchema),
    defaultValues: {
      description: "",
      requiredItems: [{ nameOrCaliber: "", quantity: 1, itemType: "ammunition" }],
      depotId: "any",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), 
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: upcomingReqForm.control,
    name: "requiredItems",
  });

  useEffect(() => {
    form.setValue("depotAInventory", JSON.stringify(initialDepotAInventory, null, 2));
    form.setValue("depotBInventory", JSON.stringify(initialDepotBInventory, null, 2));
    form.setValue("historicalUsageData", JSON.stringify(initialHistoricalUsage, null, 2));
  }, [initialDepotAInventory, initialDepotBInventory, initialHistoricalUsage, form]);


  async function onUpcomingReqSubmit(data: UpcomingRequirementsFormValues) {
     // data is from upcomingReqForm and matches upcomingRequirementsSchema (with startDate, endDate)
     form.setValue("upcomingRequirements", data); 
     toast({ variant: "success", title: "Başarılı", description: "Yaklaşan gereksinimler kaydedildi. Yapay zeka dengelemesi için göndermeye hazır." });
     setShowUpcomingReqForm(false);
  }

  async function onSubmit(formData: AiBalancingFormValues) { // formData.upcomingRequirements matches upcomingRequirementsSchema
    setIsLoading(true);
    setAiSuggestion(null);
    try {
      let actualUpcomingRequirementsForAI: UpcomingRequirementsSnapshot;

      if (formData.upcomingRequirements) {
        actualUpcomingRequirementsForAI = {
          description: formData.upcomingRequirements.description,
          requiredItems: formData.upcomingRequirements.requiredItems,
          depotId: formData.upcomingRequirements.depotId === 'any' || !formData.upcomingRequirements.depotId ? undefined : formData.upcomingRequirements.depotId as DepotId,
          dateRange: {
            start: new Date(formData.upcomingRequirements.startDate).toISOString(),
            end: new Date(formData.upcomingRequirements.endDate).toISOString(),
          }
        };
      } else {
        // Provide a default if no upcoming requirements are entered by the user,
        // as the AI flow currently expects this field as a non-optional string.
        actualUpcomingRequirementsForAI = {
          description: "Yaklaşan özel bir gereksinim belirtilmedi.",
          requiredItems: [],
          depotId: undefined,
          dateRange: { 
            start: new Date().toISOString(), 
            end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Default to today and tomorrow
          }
        };
      }

      const result = await suggestRebalancing(
        JSON.parse(formData.depotAInventory) as DepotInventorySnapshot,
        JSON.parse(formData.depotBInventory) as DepotInventorySnapshot,
        JSON.parse(formData.historicalUsageData) as HistoricalUsageSnapshot,
        actualUpcomingRequirementsForAI // This is now correctly typed as UpcomingRequirementsSnapshot
      );

      if (result.success) {
        setAiSuggestion(result.data);
        toast({ variant: "success", title: "Yapay Zeka Önerisi Alındı", description: "Aşağıdaki yeniden dengeleme planını inceleyin." });
      } else {
        toast({ variant: "destructive", title: "Hata", description: result.error });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || "Beklenmedik bir hata oluştu." });
    } finally {
      setIsLoading(false);
    }
  }

  const itemTypeTranslations: { [key: string]: string } = {
    ammunition: "Mühimmat",
    firearm: "Ateşli Silah",
    magazine: "Şarjör",
  };

  const depotTranslations: { [key: string]: string } = {
    any: "Herhangi Bir Depo",
    ...DEPOT_LOCATIONS.reduce((acc, depot) => {
      acc[depot.id] = depot.name;
      return acc;
    }, {} as { [key: string]: string })
  };


  return (
    <div className="space-y-6">
      {!showUpcomingReqForm ? (
         <Button type="button" variant="outline" onClick={() => setShowUpcomingReqForm(true)} className="mb-4">
          <span suppressHydrationWarning>Yaklaşan Gereksinimleri Ekle/Düzenle</span>
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle><span suppressHydrationWarning>Yaklaşan Gereksinimler (İsteğe Bağlı)</span></CardTitle>
            <CardDescription><span suppressHydrationWarning>Daha doğru öneriler için bilinen gelecekteki ihtiyaçları belirtin.</span></CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...upcomingReqForm}>
              <form onSubmit={upcomingReqForm.handleSubmit(onUpcomingReqSubmit)} className="space-y-4">
                <FormField
                  control={upcomingReqForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel><span suppressHydrationWarning>Açıklama</span></FormLabel>
                      <FormControl><Input placeholder="örn. Büyük ölçekli eğitim tatbikatı" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={upcomingReqForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel><span suppressHydrationWarning>Başlangıç Tarihi</span></FormLabel>
                           <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className={cn("justify-start text-left font-normal",!field.value && "text-muted-foreground")}>
                                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                  {field.value ? format(new Date(field.value), "PPP", { locale: tr }) : <span suppressHydrationWarning>Bir tarih seçin</span>}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(d) => field.onChange(d ? format(d, "yyyy-MM-dd") : undefined)} initialFocus locale={tr} />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={upcomingReqForm.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel><span suppressHydrationWarning>Bitiş Tarihi</span></FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className={cn("justify-start text-left font-normal",!field.value && "text-muted-foreground")}>
                                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                  {field.value ? format(new Date(field.value), "PPP", { locale: tr }) : <span suppressHydrationWarning>Bir tarih seçin</span>}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(d) => field.onChange(d ? format(d, "yyyy-MM-dd") : undefined)} initialFocus locale={tr} />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={upcomingReqForm.control}
                      name="depotId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel><span suppressHydrationWarning>Belirli Depo (İsteğe Bağlı)</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Depo seçin veya herhangi biri" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="any"><span suppressHydrationWarning>{depotTranslations["any"]}</span></SelectItem>
                              {DEPOT_LOCATIONS.map(d => <SelectItem key={d.id} value={d.id}><span suppressHydrationWarning>{depotTranslations[d.id]}</span></SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>

                <div>
                  <FormLabel><span suppressHydrationWarning>Gerekli Öğeler</span></FormLabel>
                  {fields.map((item, index) => (
                    <div key={item.id} className="flex items-end gap-2 mt-2 p-2 border rounded-md">
                       <FormField
                        control={upcomingReqForm.control}
                        name={`requiredItems.${index}.nameOrCaliber`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            {index === 0 && <FormLabel className="text-xs"><span suppressHydrationWarning>Ad/Kalibre</span></FormLabel>}
                            <FormControl><Input placeholder="örn. 5.56mm veya M4 Tüfek" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={upcomingReqForm.control}
                        name={`requiredItems.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            {index === 0 && <FormLabel className="text-xs"><span suppressHydrationWarning>Miktar</span></FormLabel>}
                            <FormControl><Input type="number" placeholder="Miktar" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={upcomingReqForm.control}
                        name={`requiredItems.${index}.itemType`}
                        render={({ field }) => (
                           <FormItem className="w-40">
                            {index === 0 && <FormLabel className="text-xs"><span suppressHydrationWarning>Öğe Türü</span></FormLabel>}
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Tür" /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="ammunition"><span suppressHydrationWarning>{itemTypeTranslations.ammunition}</span></SelectItem>
                                <SelectItem value="firearm"><span suppressHydrationWarning>{itemTypeTranslations.firearm}</span></SelectItem>
                                <SelectItem value="magazine"><span suppressHydrationWarning>{itemTypeTranslations.magazine}</span></SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ nameOrCaliber: "", quantity: 1, itemType: "ammunition"})} className="mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Öğe Ekle</span>
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button type="submit"><span suppressHydrationWarning>Gereksinimleri Kaydet</span></Button>
                  <Button type="button" variant="ghost" onClick={() => setShowUpcomingReqForm(false)}><span suppressHydrationWarning>İptal</span></Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="depotAInventory"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Depo Alfa Envanteri (JSON)</span></FormLabel>
                <FormControl><Textarea rows={8} {...field} /></FormControl>
                <FormDescription><span suppressHydrationWarning>Depo Alfa için JSON formatında mevcut envanter verileri.</span></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="depotBInventory"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Depo Bravo Envanteri (JSON)</span></FormLabel>
                <FormControl><Textarea rows={8} {...field} /></FormControl>
                <FormDescription><span suppressHydrationWarning>Depo Bravo için JSON formatında mevcut envanter verileri.</span></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="historicalUsageData"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Geçmiş Kullanım Verileri (JSON)</span></FormLabel>
                <FormControl><Textarea rows={8} {...field} /></FormControl>
                <FormDescription><span suppressHydrationWarning>Her iki depo için JSON formatında geçmiş kullanım verileri.</span></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
           {form.watch("upcomingRequirements") && ( // This watches the form field that holds upcomingRequirementsSchema structure
            <Card className="bg-secondary/50">
              <CardHeader><CardTitle className="text-base"><span suppressHydrationWarning>Yaklaşan Gereksinimler Belirtildi</span></CardTitle></CardHeader>
              <CardContent><pre className="text-xs whitespace-pre-wrap">{JSON.stringify(form.getValues("upcomingRequirements"), null, 2)}</pre></CardContent>
            </Card>
           )}

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <span suppressHydrationWarning>Yapay Zeka Önerisi Al</span>
          </Button>
        </form>
      </Form>

      {aiSuggestion && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle><span suppressHydrationWarning>Yapay Zeka Yeniden Dengeleme Önerisi</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1"><span suppressHydrationWarning>Gerekçe:</span></h3>
              <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md whitespace-pre-wrap">{aiSuggestion.reasoning}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1"><span suppressHydrationWarning>Yeniden Dengeleme Planı:</span></h3>
              <pre className="text-sm p-3 bg-muted/50 rounded-md whitespace-pre-wrap">
                {typeof aiSuggestion.rebalancingSuggestion === 'string' ? JSON.stringify(JSON.parse(aiSuggestion.rebalancingSuggestion), null, 2) : JSON.stringify(aiSuggestion.rebalancingSuggestion, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    
