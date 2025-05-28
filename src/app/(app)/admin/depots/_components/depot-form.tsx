
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
import type { Depot } from "@/types/inventory";
import { depotFormSchema, type DepotFormValues } from "./depot-form-schema";
import { addDepotAction, updateDepotAction } from "@/lib/actions/inventory.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface DepotFormProps {
  depot?: Depot; 
}

export function DepotForm({ depot }: DepotFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const defaultValues: Partial<DepotFormValues> = depot ? {
    ...depot,
  } : {
    id: "",
    name: "",
    address: "",
    contactPerson: "",
    notes: "",
  };
  
  const form = useForm<DepotFormValues>({
    resolver: zodResolver(depotFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: DepotFormValues) {
    try {
      if (depot) {
        await updateDepotAction({ ...data, id: depot.id, lastUpdated: depot.lastUpdated });
        toast({ variant: "success", title: "Başarılı", description: "Depo başarıyla güncellendi." });
      } else {
        await addDepotAction(data);
        toast({ variant: "success", title: "Başarılı", description: "Depo başarıyla eklendi." });
      }
      router.push("/admin/depots");
      router.refresh(); 
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || `Depo ${depot ? 'güncellenirken' : 'eklenirken'} hata oluştu.` });
      console.error("Form gönderme hatası:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span suppressHydrationWarning>Depo ID</span></FormLabel>
              <FormControl>
                <Input placeholder="örn. depoA, depo_ana_merkez" {...field} disabled={!!depot} />
              </FormControl>
              <FormDescription><span suppressHydrationWarning>Depo için benzersiz bir tanıtıcı. (örn. depoA, depoB). Değiştirilemez.</span></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span suppressHydrationWarning>Depo Adı</span></FormLabel>
              <FormControl>
                <Input placeholder="örn. Ana Depo, Bölge Deposu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span suppressHydrationWarning>Adres (İsteğe Bağlı)</span></FormLabel>
              <FormControl>
                <Textarea placeholder="Deponun tam adresi..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactPerson"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span suppressHydrationWarning>İlgili Kişi (İsteğe Bağlı)</span></FormLabel>
              <FormControl>
                <Input placeholder="örn. Ali Veli" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span suppressHydrationWarning>Notlar (İsteğe Bağlı)</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Depo ile ilgili ek notlar..."
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
          {form.formState.isSubmitting ? <span suppressHydrationWarning>Kaydediliyor...</span> : (depot ? <span suppressHydrationWarning>Depoyu Güncelle</span> : <span suppressHydrationWarning>Depo Ekle</span>)}
        </Button>
      </form>
    </Form>
  );
}
