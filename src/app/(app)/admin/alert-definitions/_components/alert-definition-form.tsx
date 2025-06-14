
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
  useFormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AlertDefinition, AlertEntityType, AlertConditionType, SupportedCaliber, Depot, DepotId } from "@/types/inventory";
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
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface AlertDefinitionFormProps {
  definition?: AlertDefinition;
  depots: Depot[];
}

const ALL_CALIBERS_OPTION_VALUE = "__ALL_CALIBERS__"; 
const ALL_DEPOTS_OPTION_VALUE = "__ALL_DEPOTS__";

const availablePlaceholders = [
  { label: "Öğe Adı", value: "{itemName}" },
  { label: "Depo Adı", value: "{depotName}" },
  { label: "Mevcut Değer", value: "{currentValue}" },
  { label: "Eşik Değer", value: "{threshold}" },
  { label: "Durum", value: "{status}" },
  { label: "Kalibre", value: "{caliber}" },
  { label: "Seri Numarası", value: "{serialNumber}" },
];

export function AlertDefinitionForm({ definition, depots }: AlertDefinitionFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!definition;

  const [currentEntityType, setCurrentEntityType] = useState<AlertEntityType | undefined>(definition?.entityType);
  const [currentConditionType, setCurrentConditionType] = useState<AlertConditionType | undefined>(definition?.conditionType);
  const messageTemplateTextareaRef = useRef<HTMLTextAreaElement>(null);

  const defaultValues: Partial<AlertDefinitionFormValues> = definition ? {
    ...definition,
    depotId: definition.depotId || undefined, // Ensure undefined if not set
  } : {
    name: "",
    description: "",
    entityType: undefined,
    conditionType: undefined,
    depotId: undefined,
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
        form.resetField("depotId");
    }
  }, [watchedEntityType, currentEntityType, form]);

  useEffect(() => {
    setCurrentConditionType(watchedConditionType);
    if (watchedConditionType !== 'low_stock') {
        form.setValue('caliberFilter', undefined); 
        form.setValue('thresholdValue', undefined);
        // Keep depotId as is unless explicitly reset logic is needed
    }
    if (watchedConditionType !== 'status_is') {
        form.setValue('statusFilter', undefined);
    }
     if (watchedEntityType === 'firearm' || watchedEntityType === 'magazine') {
        form.setValue('depotId', undefined); // Depot filter not applicable for firearm/magazine status alerts
    }
  }, [watchedConditionType, watchedEntityType, form]);

  const handleInsertPlaceholder = (placeholder: string) => {
    const textarea = messageTemplateTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = form.getValues("messageTemplate") || "";
    const newValue = currentValue.substring(0, start) + placeholder + currentValue.substring(end);

    form.setValue("messageTemplate", newValue, { shouldValidate: true, shouldDirty: true });

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
    }, 0);
  };

  async function onSubmit(data: AlertDefinitionFormValues) {
    try {
      const payload = { ...data };
      if (payload.depotId === ALL_DEPOTS_OPTION_VALUE) {
        payload.depotId = undefined;
      }
       if (payload.caliberFilter === ALL_CALIBERS_OPTION_VALUE) {
        payload.caliberFilter = undefined;
      }

      if (isEditing && definition) {
        await updateAlertDefinitionAction({ ...definition, ...payload });
        toast({ variant: "success", title: "Başarılı", description: "Uyarı tanımı başarıyla güncellendi." });
      } else {
        await addAlertDefinitionAction(payload);
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

  const showDepotFilter = watchedEntityType === 'ammunition' && watchedConditionType === 'low_stock';

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
                <Select onValueChange={field.onChange} value={field.value || undefined} disabled={!watchedEntityType}>
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

        {showDepotFilter && (
            <FormField
                control={form.control}
                name="depotId"
                render={({ field }) => (
                <FormItem>
                    <FormLabel><span suppressHydrationWarning>Depo Filtresi (İsteğe Bağlı)</span></FormLabel>
                    <Select
                        onValueChange={(value) => {
                            if (value === ALL_DEPOTS_OPTION_VALUE) {
                                field.onChange(undefined);
                            } else {
                                field.onChange(value as DepotId);
                            }
                        }}
                        value={field.value || ALL_DEPOTS_OPTION_VALUE}
                    >
                    <FormControl><SelectTrigger><SelectValue placeholder="Tüm depolar" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value={ALL_DEPOTS_OPTION_VALUE}><span suppressHydrationWarning>-- Tüm Depolar --</span></SelectItem>
                        {depots.map(depot => (
                        <SelectItem key={depot.id} value={depot.id}><span suppressHydrationWarning>{depot.name}</span></SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormDescription className="text-xs"><span suppressHydrationWarning>Belirli bir depo için uyarı. Boş bırakırsanız tümü için geçerli olur.</span></FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
        )}

        {watchedConditionType === 'low_stock' && watchedEntityType === 'ammunition' && (
          <div className={cn("grid grid-cols-1 gap-6 p-4 border rounded-md", showDepotFilter ? "md:grid-cols-2" : "md:grid-cols-2")}>
             {!showDepotFilter && <div></div>} {/* Placeholder if depot filter is not shown for alignment */}
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
                        field.onChange(value as SupportedCaliber);
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
                  <FormControl><Input type="number" placeholder="100" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value,10) || undefined)} /></FormControl>
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
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
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
          render={({ field }) => {
            const { formDescriptionId } = useFormField(); 
            return (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Mesaj Şablonu</span></FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Aşağıdaki 'Hızlı Ekle' butonlarını kullanarak veya manuel olarak mesaj şablonunuzu oluşturun. Örn: Dikkat! {depotName} deposundaki..."
                    className="resize-none" 
                    {...field}
                    ref={(e) => {
                      field.ref(e);
                      messageTemplateTextareaRef.current = e;
                    }}
                    rows={4} 
                    aria-describedby={formDescriptionId}
                  />
                </FormControl>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground self-center"><span suppressHydrationWarning>Hızlı Ekle:</span></span>
                  {availablePlaceholders.map(p => (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      key={p.value}
                      onClick={() => handleInsertPlaceholder(p.value)}
                      className="text-xs"
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
                <div id={formDescriptionId} className={cn("text-xs text-muted-foreground space-y-1 mt-2")}>
                    <span suppressHydrationWarning>Uyarı mesajınızda aşağıdaki yer tutucuları kullanabilirsiniz. Bunlar, uyarı oluştuğunda gerçek değerlerle değiştirilecektir:</span>
                    <ul className="list-disc list-inside text-muted-foreground">
                        <li suppressHydrationWarning><code className="font-mono text-xs bg-muted p-0.5 rounded-sm">{"{itemName}"}</code>: Öğenin adı (örn. "9mm Fişek", "Sar 223 P").</li>
                        <li suppressHydrationWarning><code className="font-mono text-xs bg-muted p-0.5 rounded-sm">{"{depotName}"}</code>: Öğenin bulunduğu depo.</li>
                        <li suppressHydrationWarning><code className="font-mono text-xs bg-muted p-0.5 rounded-sm">{"{currentValue}"}</code>: Koşulu tetikleyen mevcut değer (örn. stok için "50", durum için "Arızalı").</li>
                        <li suppressHydrationWarning><code className="font-mono text-xs bg-muted p-0.5 rounded-sm">{"{threshold}"}</code>: Tanımlanan eşik değer (örn. "100", sadece düşük stok uyarısı için).</li>
                        <li suppressHydrationWarning><code className="font-mono text-xs bg-muted p-0.5 rounded-sm">{"{status}"}</code>: Öğenin mevcut durumu (durum uyarısı için).</li>
                        <li suppressHydrationWarning><code className="font-mono text-xs bg-muted p-0.5 rounded-sm">{"{caliber}"}</code>: Kalibre (mühimmat, şarjör veya silah için).</li>
                        <li suppressHydrationWarning><code className="font-mono text-xs bg-muted p-0.5 rounded-sm">{"{serialNumber}"}</code>: Seri numarası (silah için).</li>
                    </ul>
                    <p className="font-semibold" suppressHydrationWarning>Örnek Şablon Kullanımı:</p>
                    <code className="block text-xs bg-muted p-1 rounded-sm w-full" suppressHydrationWarning>
                        Dikkat! {"{depotName}"} deposundaki {"{itemName}"} ({'{caliber}'}) stok miktarı ({'{currentValue}'} adet), belirlenen eşik ({'{threshold}'} adet) altına düştü.
                    </code>
                </div>
                <FormMessage />
              </FormItem>
            )
          }}
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
