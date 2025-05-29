
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
import type { Firearm, Magazine, MaintenanceItemStatus, FirearmDefinition } from "@/types/inventory";
import { firearmStatuses } from "@/app/(app)/inventory/firearms/_components/firearm-form-schema";
import { magazineStatuses } from "@/app/(app)/inventory/magazines/_components/magazine-form-schema";
import { useEffect, useState } from "react";

interface MaintenanceLogFormProps {
  firearms: Firearm[];
  magazines: Magazine[];
  firearmDefinitions: FirearmDefinition[];
}

export function MaintenanceLogForm({ firearms, magazines, firearmDefinitions }: MaintenanceLogFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedItemType, setSelectedItemType] = useState<'firearm' | 'magazine' | undefined>(undefined);
  const [availableItems, setAvailableItems] = useState<(Firearm | Magazine)[]>([]);
  const [currentStatuses, setCurrentStatuses] = useState<readonly string[]>([]);
  const [selectedFirearmDefId, setSelectedFirearmDefId] = useState<string | undefined>(undefined);
  const [filteredFirearms, setFilteredFirearms] = useState<Firearm[]>([]);


  const defaultValues: Partial<MaintenanceLogFormValues> = {
    itemId: undefined,
    itemType: undefined,
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
  const watchedFirearmDefIdForFilter = form.watch("selectedFirearmDefIdForFilter"); // Temporary field in form state

  useEffect(() => {
    setSelectedItemType(watchedItemType);
    form.resetField("itemId");
    form.setValue("statusChangeFrom", "");
    form.resetField("statusChangeTo");
    setSelectedFirearmDefId(undefined); // Reset firearm definition filter
    setFilteredFirearms([]);

    if (watchedItemType === 'firearm') {
      setCurrentStatuses(firearmStatuses);
    } else if (watchedItemType === 'magazine') {
      setAvailableItems(magazines); // For magazines, list all directly
      setCurrentStatuses(magazineStatuses);
    } else {
      setAvailableItems([]);
      setCurrentStatuses([]);
    }
  }, [watchedItemType, firearms, magazines, form]);
  
  useEffect(() => {
    if (watchedItemType === 'firearm' && watchedFirearmDefIdForFilter) {
      setFilteredFirearms(firearms.filter(f => f.definitionId === watchedFirearmDefIdForFilter));
      form.resetField("itemId"); // Reset item when definition changes
    } else if (watchedItemType === 'firearm') {
      setFilteredFirearms([]); // No definition selected, so no firearms to show for item selection
    }
  }, [watchedItemType, watchedFirearmDefIdForFilter, firearms, form]);


  useEffect(() => {
    if (watchedItemId) {
      let item: Firearm | Magazine | undefined;
      if (selectedItemType === 'firearm') {
        item = filteredFirearms.find(i => i.id === watchedItemId);
      } else if (selectedItemType === 'magazine') {
        item = magazines.find(i => i.id === watchedItemId);
      }
      
      if (item) {
        form.setValue("statusChangeFrom", item.status as MaintenanceItemStatus);
        form.setValue("itemType", item.itemType as 'firearm' | 'magazine'); // ensure itemType is set
      }
    } else {
      form.setValue("statusChangeFrom", "");
    }
  }, [watchedItemId, selectedItemType, filteredFirearms, magazines, form]);


  async function onSubmit(data: MaintenanceLogFormValues) {
    if (!data.itemType || !data.itemId) {
        toast({ variant: "destructive", title: "Hata", description: "Lütfen bir öğe türü ve öğe seçin." });
        return;
    }
    try {
      await addMaintenanceLogToItemAction(data.itemId, data.itemType, {
        date: new Date(data.date).toISOString(),
        description: data.description,
        statusChangeFrom: data.statusChangeFrom as MaintenanceItemStatus,
        statusChangeTo: data.statusChangeTo as MaintenanceItemStatus,
        technician: data.technician,
        partsUsed: data.partsUsed,
      });
      toast({ variant: "success", title: "Başarılı", description: "Bakım kaydı başarıyla eklendi." });
      router.push(`/inventory/${data.itemType === 'firearm' ? 'firearms' : 'magazines'}/${data.itemId}`);
      router.refresh();
    } catch (error: any) {
      if (error.message.startsWith('Bakım kaydı için geçersiz veri') ||
        error.message.includes('bulunamadı') ||
        error.message.startsWith('Geçersiz öğe türü')) throw error;
      await logAction({ actionType: "LOG_MAINTENANCE", entityType: "MaintenanceLog", entityId: data.itemId, status: "FAILURE", details: data, errorMessage: error.message });
      throw error;
    }
  }

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
                  onValueChange={(value: 'firearm' | 'magazine' | undefined) => {
                    field.onChange(value);
                    // setSelectedItemType(value); // This is handled by watchedItemType useEffect
                  }}
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
                    </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
          )}
        />

        {watchedItemType === 'firearm' && (
           <FormField
            control={form.control}
            name="selectedFirearmDefIdForFilter" // Use a temporary form field for this filter
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Silah Türü Seçin</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Önce silah türünü seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="" disabled><span suppressHydrationWarning>Bir silah türü seçin...</span></SelectItem>
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
                <Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedItemType || (watchedItemType === 'firearm' && !watchedFirearmDefIdForFilter)}>
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
                     <SelectItem value="" disabled><span suppressHydrationWarning>Bir öğe seçin...</span></SelectItem>
                    {(watchedItemType === 'firearm' ? filteredFirearms : magazines).map(item => (
                    <SelectItem key={item.id} value={item.id}>
                        <span suppressHydrationWarning>{watchedItemType === 'firearm' ? `${(item as Firearm).name} (SN: ${(item as Firearm).serialNumber})` : `${(item as Magazine).name} (ID: ${item.id.substring(0,6)})`}</span>
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
                        <Input {...field} readOnly className="bg-muted/50" />
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={!watchedItemId}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Yeni durumu seçin" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {currentStatuses.map(status => (
                        <SelectItem key={status} value={status}><span suppressHydrationWarning>{status}</span></SelectItem>
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
