
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
import type { FirearmDefinition } from "@/types/inventory";
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
    caliber: "",
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
        toast({ title: "Başarılı", description: "Silah tanımı başarıyla güncellendi." });
      } else {
        await addFirearmDefinitionAction(data);
        toast({ title: "Başarılı", description: "Silah tanımı başarıyla eklendi." });
      }
      router.push("/admin/firearms-definitions");
      router.refresh(); 
    } catch (error) {
      toast({ variant: "destructive", title: "Hata", description: `Silah tanımı ${definition ? 'güncellenirken' : 'eklenirken'} hata oluştu.` });
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
                <FormControl>
                  <Input placeholder="örn. 7.62x51mm, 9x19mm" {...field} />
                </FormControl>
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
