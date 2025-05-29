
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AlertDefinition, AlertEntityType, AlertConditionType } from "@/types/inventory";
import { 
    ALERT_ENTITY_TYPES, 
    ALERT_CONDITION_TYPES, 
    ALERT_SEVERITIES, 
    SUPPORTED_CALIBERS,
} from "@/types/inventory";
import { firearmStatuses } from "@/app/(app)/inventory/firearms/_components/firearm-form-schema";
import { magazineStatuses } from "@/app/(app)/inventory/magazines/_components/magazine-form-schema";
import { alertDefinitionFormSchema, type AlertDefinitionFormValues } from "./alert-definition-form-schema";
import { addAlertDefinitionAction, updateAlertDefinitionAction } from "@/lib/actions/inventory.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface AlertDefinitionFormProps {
  definition?: AlertDefinition;
}

const ALL_CALIBERS_OPTION_VALUE = "__ALL_CALIBERS__"; 

export function AlertDefinitionForm({ definition }: AlertDefinitionFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!definition;

  const [currentEntityType, setCurrentEntityType] = useState<AlertEntityType | undefined>(definition?.entityType);
  const [currentConditionType, setCurrentConditionType] = useState<AlertConditionType | undefined>(definition?.conditionType);

  const defaultValues: Partial<AlertDefinitionFormValues> = definition ? {
    ...definition,
  } : {
    name: "",
    description: "",
    entityType: undefined,
    conditionType: undefined,
    caliberFilter: undefined,
    thresholdValue: 0,
    statusFilter: undefined,
    severity: 'Orta',
    messageTemplate: "",
    isActive: true,
  };
  
  const form = useForm<AlertDefinitionFormValues>({
    resolver: zodResolver(alertDefinitionFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const watchedEntityType = form.watch("entityType");
  const watchedConditionType = form.watch("conditionType");

  useEffect(() => {
    setCurrentEntityType(watchedEntityType);
    if (watchedEntityType !== currentEntityType) {
        form.resetField("conditionType");
        form.resetField("caliberFilter");
        form.resetField("thresholdValue");
        form.resetField("statusFilter");
    }
  }, [watchedEntityType, currentEntityType, form]);

  useEffect(() => {
    setCurrentConditionType(watchedConditionType);
    if (watchedConditionType !== 'low_stock') {
        form.setValue('caliberFilter', undefined); 
        form.setValue('thresholdValue', undefined);
    }
    if (watchedConditionType !== 'status_is') {
        form.setValue('statusFilter', undefined);
    }
  }, [watchedConditionType, form]);

  async function onSubmit(data: AlertDefinitionFormValues) {
    try {
      if (isEditing && definition) {
        await updateAlertDefinitionAction({ ...definition, ...data });
        toast({ variant: "success", title: "Başarılı", description: "Uyarı tanımı başarıyla güncellendi." });
      } else {
        await addAlertDefinitionAction(data);
        toast({ variant: "success", title: "Başarılı", description: "Uyarı tanımı başarıyla eklendi." });
      }
      router.push("/admin/alert-definitions");
      router.refresh(); 
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || `Uyarı tanımı ${isEditing ? 'güncellenirken' : 'eklenirken'} hata oluştu.` });
      console.error("Form gönderme hatası:", error);
    }
  }

  const getApplicableConditionTypes = () => {
    if (!watchedEntityType) return ALERT_CONDITION_TYPES;
    return ALERT_CONDITION_TYPES.filter(ct => ct.applicableTo.includes(watchedEntityType));
  };

  const getApplicableStatusFilters = () => {
    if (watchedEntityType === 'firearm') return firearmStatuses;
    if (watchedEntityType === 'magazine') return magazineStatuses;
    return [];
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span suppressHydrationWarning>Uyarı Adı</span></FormLabel>
              <FormControl><Input placeholder="örn. 9mm Düşük Stok" {...field} /></FormControl>
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
              <FormControl><Textarea placeholder="Bu uyarı kuralı hakkında kısa bir açıklama..." className="resize-none" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="entityType"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Varlık Türü</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Bir varlık türü seçin" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {ALERT_ENTITY_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}><span suppressHydrationWarning>{type.label}</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="conditionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Koşul Türü</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!watchedEntityType}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Bir koşul türü seçin" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {getApplicableConditionTypes().map(type => (
                      <SelectItem key={type.value} value={type.value}><span suppressHydrationWarning>{type.label}</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!watchedEntityType && <FormDescription className="text-xs"><span suppressHydrationWarning>Lütfen önce varlık türü seçin.</span></FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {watchedConditionType === 'low_stock' && watchedEntityType === 'ammunition' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md">
            <FormField
              control={form.control}
              name="caliberFilter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel><span suppressHydrationWarning>Kalibre Filtresi (İsteğe Bağlı)</span></FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      if (value === ALL_CALIBERS_OPTION_VALUE) {
                        field.onChange(undefined); 
                      } else {
                        field.onChange(value);
                      }
                    }} 
                    value={field.value || ALL_CALIBERS_OPTION_VALUE} 
                  >
                    <FormControl><SelectTrigger><SelectValue placeholder="Tüm kalibreler" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value={ALL_CALIBERS_OPTION_VALUE}><span suppressHydrationWarning>-- Tüm Kalibreler --</span></SelectItem>
                      {SUPPORTED_CALIBERS.map(cal => (
                        <SelectItem key={cal} value={cal}><span suppressHydrationWarning>{cal}</span></SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs"><span suppressHydrationWarning>Belirli bir kalibre için düşük stok uyarısı. Boş bırakırsanız tümü için geçerli olur.</span></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thresholdValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel><span suppressHydrationWarning>Eşik Değer (Adet)</span></FormLabel>
                  <FormControl><Input type="number" placeholder="100" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl>
                  <FormDescription className="text-xs"><span suppressHydrationWarning>Bu değerin altına düştüğünde uyarı tetiklenir.</span></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {watchedConditionType === 'status_is' && (watchedEntityType === 'firearm' || watchedEntityType === 'magazine') && (
          <div className="p-4 border rounded-md">
            <FormField
              control={form.control}
              name="statusFilter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel><span suppressHydrationWarning>Hedef Durum</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Bir durum seçin" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {getApplicableStatusFilters().map(status => (
                        <SelectItem key={status} value={status}><span suppressHydrationWarning>{status}</span></SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs"><span suppressHydrationWarning>Öğe bu duruma geçtiğinde uyarı tetiklenir.</span></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span suppressHydrationWarning>Ciddiyet Seviyesi</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Ciddiyet seçin" /></SelectTrigger></FormControl>
                <SelectContent>
                  {ALERT_SEVERITIES.map(sev => (
                    <SelectItem key={sev} value={sev}><span suppressHydrationWarning>{sev}</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="messageTemplate"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span suppressHydrationWarning>Mesaj Şablonu</span></FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Örnek: {depotName} deposundaki {itemName} ({caliber}) stok miktarı ({currentValue} adet), belirlenen eşik ({threshold} adet) altına düştü." 
                  className="resize-none" 
                  {...field} 
                  rows={3} 
                />
              </FormControl>
              <FormDescription className="text-xs space-y-1">
                <span suppressHydrationWarning>Uyarı mesajınızda aşağıdaki yer tutucuları kullanabilirsiniz. Bunlar, uyarı oluştuğunda gerçek değerlerle değiştirilecektir:</span>
                <ul className="list-disc list-inside text-muted-foreground">
                    <li suppressHydrationWarning><code className="font-mono text-xs bg-muted p-0.5 rounded-sm">{'{itemName}'}</code>: Öğenin adı (örn. "9mm Fişek", "Sar 223 P").</li>
                    <li suppressHydrationWarning><code className="font-mono text-xs bg-muted p-0.5 rounded-sm">{'{depotName}'}</code>: Öğenin bulunduğu depo.</li>
                    <li suppressHydrationWarning><code className="font-mono text-xs bg-muted p-0.5 rounded-sm">{'{currentValue}'}</code>: Koşulu tetikleyen mevcut değer (örn. stok için "50", durum için "Arızalı").</li>
                    <li suppressHydrationWarning><code className="font-mono text-xs bg-muted p-0.5 rounded-sm">{'{threshold}'}</code>: Tanımlanan eşik değer (örn. "100", sadece düşük stok uyarısı için).</li>
                    <li suppressHydrationWarning><code className="font-mono text-xs bg-muted p-0.5 rounded-sm">{'{status}'}</code>: Öğenin mevcut durumu (durum uyarısı için).</li>
                    <li suppressHydrationWarning><code className="font-mono text-xs bg-muted p-0.5 rounded-sm">{'{caliber}'}</code>: Kalibre (mühimmat, şarjör veya silah için).</li>
                    <li suppressHydrationWarning><code className="font-mono text-xs bg-muted p-0.5 rounded-sm">{'{serialNumber}'}</code>: Seri numarası (silah için).</li>
                </ul>
                <p className="font-semibold" suppressHydrationWarning>Örnek Şablon Kullanımı:</p>
                <code className="block text-xs bg-muted p-1 rounded-sm w-full" suppressHydrationWarning>
                  Dikkat! {"{depotName}"} deposundaki {"{itemName}"} ({'{caliber}'}) stok miktarı ({'{currentValue}'} adet), belirlenen eşik ({'{threshold}'} adet) altına düştü.
                </code>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal"><span suppressHydrationWarning>Bu uyarı kuralı aktif mi?</span></FormLabel>
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? <span suppressHydrationWarning>Kaydediliyor...</span> : (isEditing ? <span suppressHydrationWarning>Tanımı Güncelle</span> : <span suppressHydrationWarning>Tanım Ekle</span>)}
        </Button>
      </form>
    </Form>
  );
}

    