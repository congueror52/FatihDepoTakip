
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
import type { FirearmDefinition, SupportedCaliber } from "@/types/inventory";
import { SUPPORTED_CALIBERS } from "@/types/inventory";
import { firearmDefinitionFormSchema, type FirearmDefinitionFormValues } from "./firearm-definition-form-schema";
import { addFirearmDefinitionAction, updateFirearmDefinitionAction } from "@/lib/actions/inventory.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface FirearmDefinitionFormProps {
  definition?: FirearmDefinition; // Optional: for editing existing definition
}

export function FirearmDefinitionForm({ definition }: FirearmDefinitionFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const defaultValues: Partial<FirearmDefinitionFormValues> = definition ? {
    ...definition,
  } : {
    name: "",
    model: "",
    manufacturer: "",
    caliber: SUPPORTED_CALIBERS[0], // Default to first supported caliber
    description: "",
  };
  
  const form = useForm<FirearmDefinitionFormValues>({
    resolver: zodResolver(firearmDefinitionFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: FirearmDefinitionFormValues) {
    try {
      if (definition) {
        await updateFirearmDefinitionAction({ ...data, id: definition.id, lastUpdated: definition.lastUpdated });
        toast({ variant: "success", title: "Başarılı", description: "Silah tanımı başarıyla güncellendi." });
      } else {
        await addFirearmDefinitionAction(data);
        toast({ variant: "success", title: "Başarılı", description: "Silah tanımı başarıyla eklendi." });
      }
      router.push("/admin/firearms-definitions");
      router.refresh(); 
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || `Silah tanımı ${definition ? 'güncellenirken' : 'eklenirken'} hata oluştu.` });
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
                <FormLabel><span suppressHydrationWarning>Tanım Adı</span></FormLabel>
                <FormControl>
                  <Input placeholder="örn. Piyade Tüfeği, Hizmet Tabancası" {...field} />
                </FormControl>
                <FormDescription><span suppressHydrationWarning>Silah türünü tanımlayan genel ad.</span></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Model</span></FormLabel>
                <FormControl>
                  <Input placeholder="örn. MPT-76, SAR9" {...field} />
                </FormControl>
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
                  <Input placeholder="örn. MKE, Sarsılmaz" {...field} />
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
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span suppressHydrationWarning>Açıklama (İsteğe Bağlı)</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Silah tanımıyla ilgili ek notlar..."
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
          {form.formState.isSubmitting ? <span suppressHydrationWarning>Kaydediliyor...</span> : (definition ? <span suppressHydrationWarning>Tanımı Güncelle</span> : <span suppressHydrationWarning>Tanım Ekle</span>)}
        </Button>
      </form>
    </Form>
  );
}
