
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { ShipmentTypeDefinition } from "@/types/inventory";
import { shipmentTypeDefinitionFormSchema, type ShipmentTypeDefinitionFormValues } from "./shipment-type-definition-form-schema";
import { addShipmentTypeDefinitionAction, updateShipmentTypeDefinitionAction } from "@/lib/actions/inventory.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ShipmentTypeDefinitionFormProps {
  definition?: ShipmentTypeDefinition;
}

export function ShipmentTypeDefinitionForm({ definition }: ShipmentTypeDefinitionFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!definition;

  const defaultValues: Partial<ShipmentTypeDefinitionFormValues> = definition ? {
    ...definition,
  } : {
    name: "",
    description: "",
    requiresSourceDepot: false,
    requiresDestinationDepot: true,
  };
  
  const form = useForm<ShipmentTypeDefinitionFormValues>({
    resolver: zodResolver(shipmentTypeDefinitionFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: ShipmentTypeDefinitionFormValues) {
    try {
      if (isEditing && definition) {
        await updateShipmentTypeDefinitionAction({ ...definition, ...data });
        toast({ variant: "success", title: "Başarılı", description: "Malzeme kayıt türü başarıyla güncellendi." });
      } else {
        await addShipmentTypeDefinitionAction(data);
        toast({ variant: "success", title: "Başarılı", description: "Malzeme kayıt türü başarıyla eklendi." });
      }
      router.push("/admin/shipment-types");
      router.refresh(); 
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || `Malzeme kayıt türü ${isEditing ? 'güncellenirken' : 'eklenirken'} hata oluştu.` });
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
              <FormLabel><span suppressHydrationWarning>Tür Adı</span></FormLabel>
              <FormControl>
                <Input placeholder="örn. Gelen Malzeme, Depo Transferi" {...field} />
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
                <Textarea placeholder="Bu kayıt türü hakkında kısa bir açıklama..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-4">
            <FormField
            control={form.control}
            name="requiresSourceDepot"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                    <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    />
                </FormControl>
                <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal">
                    <span suppressHydrationWarning>Kaynak Depo Gerektirir mi?</span>
                    </FormLabel>
                </div>
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="requiresDestinationDepot"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                    <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    />
                </FormControl>
                <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal">
                    <span suppressHydrationWarning>Hedef Depo Gerektirir mi?</span>
                    </FormLabel>
                </div>
                </FormItem>
            )}
            />
        </div>
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? <span suppressHydrationWarning>Kaydediliyor...</span> : (isEditing ? <span suppressHydrationWarning>Türü Güncelle</span> : <span suppressHydrationWarning>Tür Ekle</span>)}
        </Button>
      </form>
    </Form>
  );
}
