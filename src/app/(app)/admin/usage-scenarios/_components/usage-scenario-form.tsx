
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
import { Checkbox } from "@/components/ui/checkbox";
import type { UsageScenario, SupportedCaliberForConsumption } from "@/types/inventory";
import { SUPPORTED_CALIBERS_FOR_CONSUMPTION } from "@/types/inventory";
import { usageScenarioFormSchema, type UsageScenarioFormValues } from "./usage-scenario-form-schema";
import { addUsageScenarioAction, updateUsageScenarioAction } from "@/lib/actions/inventory.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UsageScenarioFormProps {
  scenario?: UsageScenario;
}

export function UsageScenarioForm({ scenario }: UsageScenarioFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const defaultValues: Partial<UsageScenarioFormValues> = scenario ? {
    ...scenario,
  } : {
    name: "",
    description: "",
    preselectedCalibers: [],
  };
  
  const form = useForm<UsageScenarioFormValues>({
    resolver: zodResolver(usageScenarioFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: UsageScenarioFormValues) {
    try {
      if (scenario) {
        await updateUsageScenarioAction({ ...data, id: scenario.id, lastUpdated: scenario.lastUpdated });
        toast({ title: "Başarılı", description: "Kullanım senaryosu başarıyla güncellendi." });
      } else {
        await addUsageScenarioAction(data);
        toast({ title: "Başarılı", description: "Kullanım senaryosu başarıyla eklendi." });
      }
      router.push("/admin/usage-scenarios");
      router.refresh(); 
    } catch (error: any) {
       toast({ variant: "destructive", title: "Hata", description: error.message || `Kullanım senaryosu ${scenario ? 'güncellenirken' : 'eklenirken'} hata oluştu.` });
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
              <FormLabel><span suppressHydrationWarning>Senaryo Adı</span></FormLabel>
              <FormControl>
                <Input placeholder="örn. Kadro Atışı, ACM Eğitimi" {...field} />
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
                <Textarea
                  placeholder="Senaryo hakkında ek bilgiler..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
            <CardHeader>
                <CardTitle className="text-base"><span suppressHydrationWarning>Önceden Seçilecek Kalibreler</span></CardTitle>
                <CardDescription><span suppressHydrationWarning>Bu senaryo seçildiğinde günlük kullanım formunda otomatik olarak işaretlenecek fişek kalibrelerini seçin.</span></CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                 <FormField
                    control={form.control}
                    name="preselectedCalibers"
                    render={() => ( // Removed field from render as we manage array directly
                        <FormItem>
                        {SUPPORTED_CALIBERS_FOR_CONSUMPTION.map((caliber) => (
                            <FormField
                            key={caliber}
                            control={form.control}
                            name="preselectedCalibers"
                            render={({ field }) => {
                                return (
                                <FormItem
                                    key={caliber}
                                    className="flex flex-row items-center space-x-3 space-y-0"
                                >
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(caliber)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...(field.value || []), caliber])
                                            : field.onChange(
                                                (field.value || []).filter(
                                                (value) => value !== caliber
                                                )
                                            );
                                        }}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                    <span suppressHydrationWarning>{caliber}</span>
                                    </FormLabel>
                                </FormItem>
                                );
                            }}
                            />
                        ))}
                        <FormMessage /> 
                        </FormItem>
                    )}
                    />
            </CardContent>
        </Card>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? <span suppressHydrationWarning>Kaydediliyor...</span> : (scenario ? <span suppressHydrationWarning>Senaryoyu Güncelle</span> : <span suppressHydrationWarning>Senaryo Ekle</span>)}
        </Button>
      </form>
    </Form>
  );
}
