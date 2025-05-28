
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
import type { Magazine, FirearmDefinition } from "@/types/inventory";
import { DEPOT_LOCATIONS, SUPPORTED_CALIBERS } from "@/types/inventory";
import { magazineFormSchema, magazineStatuses, type MagazineFormValues } from "./magazine-form-schema";
import { addMagazineAction, updateMagazineAction } from "@/lib/actions/inventory.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useState, useEffect } from "react";

interface MagazineFormProps {
  magazine?: Magazine;
  firearmDefinitions: FirearmDefinition[];
}

export function MagazineForm({ magazine, firearmDefinitions }: MagazineFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedFirearmDefId, setSelectedFirearmDefId] = useState<string | undefined>(magazine?.compatibleFirearmDefinitionId || undefined);
  const [isNameCaliberReadOnly, setIsNameCaliberReadOnly] = useState<boolean>(!!magazine?.compatibleFirearmDefinitionId);

  const isEditing = !!magazine;

  const defaultValues: Partial<MagazineFormValues> = magazine ? {
    ...magazine,
    quantity: 1, // Quantity is 1 when editing an existing magazine
    purchaseDate: magazine.purchaseDate ? format(new Date(magazine.purchaseDate), 'yyyy-MM-dd') : undefined,
    compatibleFirearmDefinitionId: magazine.compatibleFirearmDefinitionId,
  } : {
    name: "",
    caliber: SUPPORTED_CALIBERS[0],
    capacity: 30,
    quantity: 1, // Default quantity for new magazines
    status: 'Hizmette',
    depotId: DEPOT_LOCATIONS[0].id,
    compatibleFirearmDefinitionId: undefined,
  };
  
  const form = useForm<MagazineFormValues>({
    resolver: zodResolver(magazineFormSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (selectedFirearmDefId) {
      const definition = firearmDefinitions.find(def => def.id === selectedFirearmDefId);
      if (definition) {
        form.setValue('name', `${definition.name} Şarjörü`);
        form.setValue('caliber', definition.caliber as typeof SUPPORTED_CALIBERS[number]);
        form.setValue('compatibleFirearmDefinitionId', definition.id);
        setIsNameCaliberReadOnly(true);
      }
    } else {
        if (!magazine) { 
            form.setValue('name', defaultValues.name || "");
            form.setValue('caliber', defaultValues.caliber || SUPPORTED_CALIBERS[0]);
            form.setValue('compatibleFirearmDefinitionId', undefined);
        }
        setIsNameCaliberReadOnly(false);
    }
  }, [selectedFirearmDefId, firearmDefinitions, form, magazine, defaultValues.name, defaultValues.caliber]);


  async function onSubmit(data: MagazineFormValues) {
    try {
      const payload = {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : undefined,
        compatibleFirearmDefinitionId: selectedFirearmDefId, 
      };

      if (magazine) {
        await updateMagazineAction({ ...magazine, ...payload, quantity: 1 }); // Ensure quantity is 1 for updates
        toast({ variant: "success", title: "Başarılı", description: "Şarjör başarıyla güncellendi." });
      } else {
        await addMagazineAction(payload); // addMagazineAction will handle the quantity
        toast({ variant: "success", title: "Başarılı", description: `${payload.quantity} adet şarjör başarıyla eklendi.` });
      }
      router.push("/inventory/magazines");
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || `Şarjör ${magazine ? 'güncellenirken' : 'eklenirken'} hata oluştu.` });
      console.error("Form gönderme hatası:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormItem>
            <FormLabel><span suppressHydrationWarning>Ait Olduğu Silah Türü (İsteğe Bağlı)</span></FormLabel>
            <Select 
                onValueChange={(value) => {
                    if (value === "clear_selection") {
                        setSelectedFirearmDefId(undefined);
                    } else {
                        setSelectedFirearmDefId(value);
                    }
                }} 
                value={selectedFirearmDefId || ""}
            >
                <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Bir silah türü seçin (Ad ve Kalibreyi otomatik doldurur)" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="clear_selection" disabled={!selectedFirearmDefId}>
                        <span suppressHydrationWarning>Silah Türü Seçimini Temizle</span>
                    </SelectItem>
                    {firearmDefinitions.map(def => (
                        <SelectItem key={def.id} value={def.id}>
                            <span suppressHydrationWarning>{def.name} ({def.model} - {def.caliber})</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <FormDescription><span suppressHydrationWarning>Bir silah türü seçmek, şarjör adı ve kalibresini otomatik olarak dolduracaktır.</span></FormDescription>
        </FormItem>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Şarjör Adı/Tanımı</span></FormLabel>
                <FormControl>
                  <Input placeholder="örn. Standart Piyade Tüfeği Şarjörü" {...field} readOnly={isNameCaliberReadOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serialNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Seri Numarası (İsteğe Bağlı)</span></FormLabel>
                <FormControl>
                  <Input placeholder="MAG-SN12345" {...field} disabled={!isEditing && form.getValues("quantity") > 1} />
                </FormControl>
                {!isEditing && form.getValues("quantity") > 1 && <FormDescription className="text-xs"><span suppressHydrationWarning>Toplu eklemede seri numarası girilemez.</span></FormDescription>}
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
                <Select onValueChange={field.onChange} value={field.value} disabled={isNameCaliberReadOnly}>
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
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Kapasite (Fişek Adedi)</span></FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!isEditing && (
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel><span suppressHydrationWarning>Eklenecek Miktar</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="1" 
                      {...field} 
                      onChange={e => {
                        const val = parseInt(e.target.value, 10) || 1;
                        field.onChange(val);
                        if (val > 1) {
                          form.setValue('serialNumber', ''); // Clear serial number if quantity > 1
                        }
                      }} 
                    />
                  </FormControl>
                  <FormDescription><span suppressHydrationWarning>Aynı özelliklerde kaç adet şarjör eklenecek?</span></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
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
                    {magazineStatuses.map(status => (
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
            name="manufacturer"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Üretici (İsteğe Bağlı)</span></FormLabel>
                <FormControl>
                  <Input placeholder="örn. MKE, Mec-Gar" {...field} />
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
                <Textarea placeholder="Şarjörle ilgili ek notlar..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? <span suppressHydrationWarning>Kaydediliyor...</span> : (magazine ? <span suppressHydrationWarning>Şarjörü Güncelle</span> : <span suppressHydrationWarning>Şarjör Ekle</span>)}
        </Button>
      </form>
    </Form>
  );
}
