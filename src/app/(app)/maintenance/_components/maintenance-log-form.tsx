
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { maintenanceLogFormSchema, type MaintenanceLogFormValues } from "./maintenance-log-form-schema";
import { addMaintenanceLogToItemAction } from "@/lib/actions/inventory.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CalendarIcon, Loader2, Wrench } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { Firearm, Magazine, OtherMaterial, MaintenanceItemStatus, FirearmDefinition, MagazineStatus, FirearmStatus, OtherMaterialStatus } from "@/types/inventory"; // Added OtherMaterial, OtherMaterialStatus
import { firearmStatuses as firearmStatusesArray } from "@/app/(app)/inventory/firearms/_components/firearm-form-schema";
import { magazineStatuses as magazineStatusesArray } from "@/app/(app)/inventory/magazines/_components/magazine-form-schema";
import { otherMaterialStatuses as otherMaterialStatusesArray } from "@/app/(app)/inventory/other-materials/_components/other-material-form-schema"; // New import
import { useEffect, useState } from "react";

interface MaintenanceLogFormProps {
  firearms: Firearm[];
  magazines: Magazine[];
  otherMaterials: OtherMaterial[]; // New prop
  firearmDefinitions: FirearmDefinition[];
}

const allPossibleStatuses = [...new Set([...firearmStatusesArray, ...magazineStatusesArray, ...otherMaterialStatusesArray])] as [string, ...string[]];

export function MaintenanceLogForm({ firearms, magazines, otherMaterials, firearmDefinitions }: MaintenanceLogFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [filteredFirearms, setFilteredFirearms] = useState<Firearm[]>([]);
  const [currentStatuses, setCurrentStatuses] = useState<readonly string[]>([]);


  const defaultValues: Partial<MaintenanceLogFormValues> = {
    itemId: undefined,
    itemType: undefined,
    selectedFirearmDefIdForFilter: undefined,
    date: format(new Date(), 'yyyy-MM-dd'),
    description: "",
    statusChangeFrom: "",
    statusChangeTo: undefined,
    technician: "",
    partsUsed: "",
  };

  const form = useForm<MaintenanceLogFormValues>({
    resolver: zodResolver(maintenanceLogFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const watchedItemType = form.watch("itemType");
  const watchedItemId = form.watch("itemId");
  const watchedFirearmDefIdForFilter = form.watch("selectedFirearmDefIdForFilter");

  useEffect(() => {
    form.resetField("itemId");
    form.setValue("statusChangeFrom", "");
    form.resetField("statusChangeTo");

    if (watchedItemType === 'firearm') {
      setCurrentStatuses(firearmStatusesArray);
    } else if (watchedItemType === 'magazine') {
      setCurrentStatuses(magazineStatusesArray);
      form.setValue("selectedFirearmDefIdForFilter", undefined);
      setFilteredFirearms([]);
    } else if (watchedItemType === 'other') { // Added 'other'
      setCurrentStatuses(otherMaterialStatusesArray);
      form.setValue("selectedFirearmDefIdForFilter", undefined);
      setFilteredFirearms([]);
    } else {
      setCurrentStatuses([]);
      form.setValue("selectedFirearmDefIdForFilter", undefined);
      setFilteredFirearms([]);
    }
  }, [watchedItemType, form]);

  useEffect(() => {
    if (watchedItemType === 'firearm' && watchedFirearmDefIdForFilter) {
      setFilteredFirearms(firearms.filter(f => f.definitionId === watchedFirearmDefIdForFilter));
      form.resetField("itemId");
    } else if (watchedItemType === 'firearm' && !watchedFirearmDefIdForFilter) {
      setFilteredFirearms([]);
      form.resetField("itemId");
    }
  }, [watchedItemType, watchedFirearmDefIdForFilter, firearms, form]);


  useEffect(() => {
    if (watchedItemId) {
      let item: Firearm | Magazine | OtherMaterial | undefined; // Added OtherMaterial
      if (watchedItemType === 'firearm') {
        item = (watchedFirearmDefIdForFilter ? filteredFirearms : firearms).find(i => i.id === watchedItemId);
      } else if (watchedItemType === 'magazine') {
        item = magazines.find(i => i.id === watchedItemId);
      } else if (watchedItemType === 'other') { // Added 'other'
        item = otherMaterials.find(i => i.id === watchedItemId);
      }

      if (item) {
        const currentItemStatus = item.status as MaintenanceItemStatus;
        if (allPossibleStatuses.includes(currentItemStatus)) {
            form.setValue("statusChangeFrom", currentItemStatus, { shouldValidate: true });
        } else {
            form.setValue("statusChangeFrom", "", { shouldValidate: true });
        }
      }
    } else {
      form.setValue("statusChangeFrom", "", { shouldValidate: true });
    }
  }, [watchedItemId, watchedItemType, filteredFirearms, firearms, magazines, otherMaterials, form, watchedFirearmDefIdForFilter]);


  async function onSubmit(data: MaintenanceLogFormValues) {
    if (!data.itemType || !data.itemId) {
        toast({ variant: "destructive", title: "Hata", description: "Lütfen bir öğe türü ve öğe seçin." });
        return;
    }
    let logEntryId: string | undefined = undefined;
    try {
      const { selectedFirearmDefIdForFilter, ...logSubmitData } = data;

      const result = await addMaintenanceLogToItemAction(logSubmitData.itemId, logSubmitData.itemType, {
        date: new Date(logSubmitData.date).toISOString(),
        description: logSubmitData.description,
        statusChangeFrom: logSubmitData.statusChangeFrom as MaintenanceItemStatus,
        statusChangeTo: logSubmitData.statusChangeTo as MaintenanceItemStatus,
        technician: logSubmitData.technician,
        partsUsed: logSubmitData.partsUsed,
      });
      logEntryId = result.id;
      toast({ variant: "success", title: "Başarılı", description: "Bakım kaydı başarıyla eklendi." });
      router.push(`/inventory/${data.itemType === 'other' ? 'other-materials' : data.itemType + 's'}/${data.itemId}`);
      router.refresh();
    } catch (error: any) {
      await logAction({
        actionType: "LOG_MAINTENANCE",
        entityType: "MaintenanceLog",
        entityId: logEntryId || data.itemId,
        status: "FAILURE",
        details: data,
        errorMessage: error.message
      });
      toast({ variant: "destructive", title: "Hata", description: error.message || "Bakım kaydı eklenirken bir hata oluştu." });
      console.error("Bakım kaydı gönderme hatası:", error);
    }
  }

  const getDisplayLabel = (statusValue: string) => {
    const itemTypeSuffix = watchedItemType === 'firearm' ? ' Silahlar' : (watchedItemType === 'magazine' ? ' Şarjörler' : (watchedItemType === 'other' ? ' Malzemeler' : ''));
    switch (statusValue) {
        case "Depoda Arızalı": return `Depoda Arızalı${itemTypeSuffix.trim()}`;
        case "Depoda": return `Depodaki${itemTypeSuffix.trim()}`;
        case "Destekte": return "Desteğe Teslim Edilenler";
        case "Poligonda": return `Poligondaki${itemTypeSuffix.trim()}`;
        case "Rapor Bekliyor": return "Rapor Yazılacaklar";
        case "Kullanımda": return `Kullanımdaki${itemTypeSuffix.trim()}`;
        case "Bakımda": return `Bakımdaki${itemTypeSuffix.trim()}`;
        case "Hizmet Dışı": return `Hizmet Dışı${itemTypeSuffix.trim()}`;
        default: return statusValue;
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="itemType"
          render={({ field }) => (
            <FormItem>
                <FormLabel><span suppressHydrationWarning>Öğe Türü</span></FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value as 'firearm' | 'magazine' | 'other' | undefined)}
                  value={field.value}
                >
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Bakım yapılacak öğe türünü seçin" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="firearm"><span suppressHydrationWarning>Silah</span></SelectItem>
                        <SelectItem value="magazine"><span suppressHydrationWarning>Şarjör</span></SelectItem>
                        <SelectItem value="other"><span suppressHydrationWarning>Diğer Malzeme</span></SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
          )}
        />

        {watchedItemType === 'firearm' && (
           <FormField
            control={form.control}
            name="selectedFirearmDefIdForFilter"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Silah Türü Seçin</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Bakımı yapılacak silahın türünü seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {firearmDefinitions.map(def => (
                      <SelectItem key={def.id} value={def.id}>
                        <span suppressHydrationWarning>{def.name} ({def.model})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
            control={form.control}
            name="itemId"
            render={({ field }) => (
            <FormItem>
                <FormLabel><span suppressHydrationWarning>Bakım Yapılacak Öğe</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? undefined} disabled={!watchedItemType || (watchedItemType === 'firearm' && !watchedFirearmDefIdForFilter)}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder={
                        !watchedItemType ? "Önce öğe türü seçin" :
                        (watchedItemType === 'firearm' && !watchedFirearmDefIdForFilter) ? "Önce silah türü seçin" :
                        "Öğeyi seçin"
                    } />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {(watchedItemType === 'firearm' ? (watchedFirearmDefIdForFilter ? filteredFirearms : []) : // Show empty if type selected but def not
                     watchedItemType === 'magazine' ? magazines :
                     watchedItemType === 'other' ? otherMaterials : []
                    ).map(item => (
                    <SelectItem key={item.id} value={item.id}>
                        <span suppressHydrationWarning>{
                            watchedItemType === 'firearm' ? `${(item as Firearm).name} (SN: ${(item as Firearm).serialNumber || 'N/A'})` :
                            watchedItemType === 'magazine' ? `${(item as Magazine).name} (Kapasite: ${(item as Magazine).capacity}, Kalibre: ${(item as Magazine).caliber})` :
                            (item as OtherMaterial).name
                        }</span>
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}
        />


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel><span suppressHydrationWarning>Bakım Tarihi</span></FormLabel>
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
                name="technician"
                render={({ field }) => (
                <FormItem>
                    <FormLabel><span suppressHydrationWarning>Teknisyen (İsteğe Bağlı)</span></FormLabel>
                    <FormControl><Input placeholder="örn. İlyas Usta" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span suppressHydrationWarning>Yapılan İşlemin Açıklaması</span></FormLabel>
              <FormControl>
                <Textarea placeholder="Detaylı açıklama girin..." className="resize-none" {...field} rows={4}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={form.control}
                name="statusChangeFrom"
                render={({ field }) => (
                <FormItem>
                    <FormLabel><span suppressHydrationWarning>Önceki Durum</span></FormLabel>
                    <FormControl>
                        <Input {...field} readOnly className="bg-muted/50" value={getDisplayLabel(field.value || '')} />
                    </FormControl>
                    <FormDescription><span suppressHydrationWarning>Bu alan öğe seçildiğinde otomatik dolar.</span></FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="statusChangeTo"
                render={({ field }) => (
                <FormItem>
                    <FormLabel><span suppressHydrationWarning>Yeni Durum</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? undefined} disabled={!watchedItemId}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Yeni durumu seçin" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {currentStatuses.map(status => (
                        <SelectItem key={status} value={status}><span suppressHydrationWarning>{getDisplayLabel(status)}</span></SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <FormField
            control={form.control}
            name="partsUsed"
            render={({ field }) => (
                <FormItem>
                <FormLabel><span suppressHydrationWarning>Kullanılan Parçalar (İsteğe Bağlı)</span></FormLabel>
                <FormControl>
                    <Textarea placeholder="Kullanılan parçaları listeleyin..." className="resize-none" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? <span suppressHydrationWarning>Kaydediliyor...</span> : <span suppressHydrationWarning>Bakım Kaydı Ekle</span>}
        </Button>
      </form>
    </Form>
  );
}
