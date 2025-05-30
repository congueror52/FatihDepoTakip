
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { OtherMaterial, Depot } from "@/types/inventory";
import { otherMaterialFormSchema, otherMaterialStatuses, type OtherMaterialFormValues } from "./other-material-form-schema";
import { addOtherMaterialAction, updateOtherMaterialAction } from "@/lib/actions/inventory.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface OtherMaterialFormProps {
  material?: OtherMaterial;
  depots: Depot[];
}

export function OtherMaterialForm({ material, depots }: OtherMaterialFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!material;

  const defaultValues: Partial<OtherMaterialFormValues> = material ? {
    ...material,
    purchaseDate: material.purchaseDate ? format(new Date(material.purchaseDate), 'yyyy-MM-dd') : undefined,
    notes: material.notes || "",
    category: material.category || "",
    manufacturer: material.manufacturer || "",
    quantity: material.quantity, // Keep original quantity for editing (individual item)
  } : {
    name: "",
    category: "",
    quantity: 1,
    status: 'Depoda',
    depotId: depots.length > 0 ? depots[0].id : "",
    manufacturer: "",
    purchaseDate: undefined,
    notes: "",
  };

  const form = useForm<OtherMaterialFormValues>({
    resolver: zodResolver(otherMaterialFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: OtherMaterialFormValues) {
    try {
      const payload = {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : undefined,
      };

      if (isEditing && material) {
        // Ensure quantity is not changed via this form if it's an update to a single item
        await updateOtherMaterialAction({ ...material, ...payload, quantity: material.quantity });
        toast({ variant: "success", title: "Başarılı", description: "Malzeme başarıyla güncellendi." });
      } else {
        await addOtherMaterialAction(payload);
        toast({ variant: "success", title: "Başarılı", description: `${payload.quantity} adet malzeme başarıyla eklendi.` });
      }
      router.push("/inventory/other-materials");
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || `Malzeme ${isEditing ? 'güncellenirken' : 'eklenirken'} hata oluştu.` });
      console.error("Form gönderme hatası:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Malzeme Adı/Tanımı</span></FormLabel>
                <FormControl>
                  <Input placeholder="örn. Çelik Yelek Seviye IV, Taktik Gözlük" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Kategori (İsteğe Bağlı)</span></FormLabel>
                <FormControl>
                  <Input placeholder="örn. Koruyucu Ekipman, Eğitim Malzemesi" {...field} />
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
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
           {isEditing && material && (
             <FormItem>
                <FormLabel><span suppressHydrationWarning>Miktar</span></FormLabel>
                <FormControl>
                  <Input type="number" value={material.quantity} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
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
                    {depots.length === 0 && <SelectItem value="" disabled><span suppressHydrationWarning>Depo bulunamadı</span></SelectItem>}
                    {depots.map(depot => (
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
                    {otherMaterialStatuses.map(status => (
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
                  <Input placeholder="Üretici firma adı" {...field} />
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
                <Textarea placeholder="Malzeme ile ilgili ek notlar..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? <span suppressHydrationWarning>Kaydediliyor...</span> : (isEditing ? <span suppressHydrationWarning>Malzemeyi Güncelle</span> : <span suppressHydrationWarning>Malzeme Ekle</span>)}
        </Button>
      </form>
    </Form>
  );
}
