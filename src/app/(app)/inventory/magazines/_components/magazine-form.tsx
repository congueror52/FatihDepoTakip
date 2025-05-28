
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
import type { Magazine, FirearmDefinition } from "@/types/inventory"; // Added FirearmDefinition
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
  firearmDefinitions: FirearmDefinition[]; // Added firearmDefinitions prop
}

export function MagazineForm({ magazine, firearmDefinitions }: MagazineFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedFirearmDefId, setSelectedFirearmDefId] = useState<string | undefined>(magazine?.compatibleFirearmDefinitionId || undefined);
  const [isNameCaliberReadOnly, setIsNameCaliberReadOnly] = useState<boolean>(!!magazine?.compatibleFirearmDefinitionId);


  const defaultValues: Partial<MagazineFormValues> = magazine ? {
    ...magazine,
    purchaseDate: magazine.purchaseDate ? format(new Date(magazine.purchaseDate), 'yyyy-MM-dd') : undefined,
  } : {
    name: "",
    caliber: SUPPORTED_CALIBERS[0],
    capacity: 30,
    status: 'Hizmette',
    depotId: DEPOT_LOCATIONS[0].id,
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
        setIsNameCaliberReadOnly(true);
      }
    } else {
        // If no firearm definition is selected, make fields editable (unless it's an existing magazine that wasn't linked)
        // For new magazines, if no def is selected, they are editable.
        // For existing magazines, if they were not linked, they should remain editable.
        if (!magazine?.id) { // Only for new magazines, allow reverting to manual
            setIsNameCaliberReadOnly(false);
        } else {
            // For existing magazines, if it had a link, it stays read-only until selection is cleared.
            // If it didn't have a link, it's already editable by default state of isNameCaliberReadOnly.
            // This logic needs to ensure that if the user clears the selection, it becomes editable
            // and reverts to original name/caliber if it's an edit.
             setIsNameCaliberReadOnly(false); // Default to editable if selection cleared
             if (magazine) { // If editing, revert to original values if selection cleared
                form.setValue('name', magazine.name);
                form.setValue('caliber', magazine.caliber as typeof SUPPORTED_CALIBERS[number]);
             }
        }
    }
  }, [selectedFirearmDefId, firearmDefinitions, form, magazine]);


  async function onSubmit(data: MagazineFormValues) {
    try {
      const payload = {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : undefined,
        compatibleFirearmDefinitionId: selectedFirearmDefId // Store the link
      };

      if (magazine) {
        await updateMagazineAction({ ...magazine, ...payload });
        toast({ variant: "success", title: "Başarılı", description: "Şarjör başarıyla güncellendi." });
      } else {
        await addMagazineAction(payload);
        toast({ variant: "success", title: "Başarılı", description: "Şarjör başarıyla eklendi." });
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
                        if (!magazine) { // If new form, clear name/caliber
                           form.setValue('name', "");
                           form.setValue('caliber', SUPPORTED_CALIBERS[0]);
                        }
                    } else {
                        setSelectedFirearmDefId(value);
                    }
                }} 
                defaultValue={selectedFirearmDefId}
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
                  <Input placeholder="MAG-SN12345" {...field} />
                </FormControl>
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
                <FormLabel><span suppressHydrationWarning>Kapasite (Adet)</span></FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
