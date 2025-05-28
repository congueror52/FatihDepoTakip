
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import type { Shipment, ShipmentItem, DepotId, Depot, ShipmentTypeDefinition } from "@/types/inventory";
import { INVENTORY_ITEM_TYPES, SUPPORTED_CALIBERS } from "@/types/inventory";
import { shipmentFormSchema, type ShipmentFormValues, type ShipmentItemFormValues } from "./shipment-form-schema";
import { addShipmentAction, updateShipmentAction } from "@/lib/actions/inventory.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CalendarIcon, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from "react";

interface ShipmentFormProps {
  shipment?: Shipment;
  depots: Depot[];
  shipmentTypeDefs: ShipmentTypeDefinition[];
}

export function ShipmentForm({ shipment, depots, shipmentTypeDefs }: ShipmentFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditing = !!shipment;
  const [selectedShipmentType, setSelectedShipmentType] = useState<ShipmentTypeDefinition | undefined>(
    isEditing && shipment ? shipmentTypeDefs.find(st => st.id === shipment.typeId) : undefined
  );


  const defaultValues: Partial<ShipmentFormValues> = shipment ? {
    ...shipment,
    date: format(new Date(shipment.date), 'yyyy-MM-dd'),
    items: shipment.items.map(item => ({ ...item, id: item.id || uuidv4() })), 
  } : {
    date: format(new Date(), 'yyyy-MM-dd'),
    typeId: shipmentTypeDefs.length > 0 ? shipmentTypeDefs[0].id : "", // Default to first available type
    items: [{ id: uuidv4(), name: "", itemType: "ammunition", quantity: 1 }],
    sourceDepotId: undefined,
    destinationDepotId: undefined,
    supplier: "",
    trackingNumber: "",
    notes: "",
  };
  
  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const currentTypeId = form.watch("typeId");

  useEffect(() => {
    const typeDef = shipmentTypeDefs.find(st => st.id === currentTypeId);
    setSelectedShipmentType(typeDef);
    if (typeDef) {
        if (!typeDef.requiresSourceDepot) form.setValue('sourceDepotId', undefined);
        if (!typeDef.requiresDestinationDepot) form.setValue('destinationDepotId', undefined);
    }
  }, [currentTypeId, shipmentTypeDefs, form]);


  async function onSubmit(data: ShipmentFormValues) {
    try {
      const payload = {
        ...data,
        date: new Date(data.date).toISOString(),
      };

      if (isEditing && shipment) {
        await updateShipmentAction({ ...payload, id: shipment.id, lastUpdated: shipment.lastUpdated });
        toast({ variant: "success", title: "Başarılı", description: "Malzeme kaydı başarıyla güncellendi." });
      } else {
        await addShipmentAction(payload);
        toast({ variant: "success", title: "Başarılı", description: "Malzeme kaydı başarıyla eklendi." });
      }
      router.push("/shipments");
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || `Malzeme kaydı ${isEditing ? 'güncellenirken' : 'eklenirken'} hata oluştu.` });
      console.error("Form gönderme hatası:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel><span suppressHydrationWarning>Kayıt Tarihi</span></FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        {field.value ? format(new Date(field.value), "PPP", { locale: tr }) : <span suppressHydrationWarning>Bir tarih seçin</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)} initialFocus locale={tr} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="typeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Kayıt Türü</span></FormLabel>
                <Select 
                    onValueChange={(value) => {
                        field.onChange(value);
                        const typeDef = shipmentTypeDefs.find(st => st.id === value);
                        setSelectedShipmentType(typeDef);
                    }} 
                    defaultValue={field.value}
                >
                  <FormControl><SelectTrigger><SelectValue placeholder="Kayıt türünü seçin" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {shipmentTypeDefs.map(typeDef => (
                        <SelectItem key={typeDef.id} value={typeDef.id}><span suppressHydrationWarning>{typeDef.name}</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedShipmentType?.description && <FormDescription className="text-xs pt-1">{selectedShipmentType.description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {selectedShipmentType?.requiresSourceDepot && (
          <FormField
            control={form.control}
            name="sourceDepotId"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Kaynak Depo</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Kaynak depoyu seçin" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {depots.map(depot => <SelectItem key={depot.id} value={depot.id}><span suppressHydrationWarning>{depot.name}</span></SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selectedShipmentType?.requiresDestinationDepot && (
          <FormField
            control={form.control}
            name="destinationDepotId"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Hedef Depo</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Hedef depoyu seçin" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {depots.map(depot => <SelectItem key={depot.id} value={depot.id}><span suppressHydrationWarning>{depot.name}</span></SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}


        <Card>
          <CardHeader>
            <CardTitle><span suppressHydrationWarning>Malzeme Öğeleri</span></CardTitle>
            <CardDescription><span suppressHydrationWarning>Kayda dahil edilecek malzeme öğelerini ekleyin.</span></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((item, index) => {
              const currentItemType = form.watch(`items.${index}.itemType`);
              return (
                <div key={item.id} className="p-4 border rounded-md space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-md"><span suppressHydrationWarning>Malzeme #{index + 1}</span></h4>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                      <Trash2 className="h-4 w-4 text-destructive" /> <span className="sr-only" suppressHydrationWarning>Malzemeyi Sil</span>
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel><span suppressHydrationWarning>Ad/Açıklama</span></FormLabel>
                          <FormControl><Input placeholder="örn. MPT-76 veya 9mm MKE Fişek" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.itemType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel><span suppressHydrationWarning>Malzeme Türü</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Tür seçin" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {INVENTORY_ITEM_TYPES.map(type => <SelectItem key={type.value} value={type.value}><span suppressHydrationWarning>{type.label}</span></SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel><span suppressHydrationWarning>Miktar</span></FormLabel>
                          <FormControl><Input type="number" placeholder="1" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {(currentItemType === 'ammunition' || currentItemType === 'magazine') && (
                      <FormField
                        control={form.control}
                        name={`items.${index}.caliber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel><span suppressHydrationWarning>Kalibre</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Kalibre seçin" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {SUPPORTED_CALIBERS.map(cal => <SelectItem key={cal} value={cal}><span suppressHydrationWarning>{cal}</span></SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {currentItemType === 'firearm' && (
                      <FormField
                        control={form.control}
                        name={`items.${index}.model`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel><span suppressHydrationWarning>Model</span></FormLabel>
                            <FormControl><Input placeholder="örn. SAR9, MPT-76" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                     {currentItemType === 'firearm' && (
                      <FormField
                        control={form.control}
                        name={`items.${index}.serialNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel><span suppressHydrationWarning>Seri Numarası (İsteğe Bağlı)</span></FormLabel>
                            <FormControl><Input placeholder="Seri No" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {currentItemType === 'magazine' && (
                      <FormField
                        control={form.control}
                        name={`items.${index}.capacity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel><span suppressHydrationWarning>Kapasite</span></FormLabel>
                            <FormControl><Input type="number" placeholder="30" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              )
            })}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ id: uuidv4(), name: "", itemType: "ammunition", quantity: 1 })}>
              <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Malzeme Öğesi Ekle</span>
            </Button>
            <FormField control={form.control} name="items" render={() => <FormMessage />} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                <FormItem>
                    <FormLabel><span suppressHydrationWarning>Tedarikçi (İsteğe Bağlı)</span></FormLabel>
                    <FormControl><Input placeholder="Tedarikçi firma adı" {...field} /></FormControl>
                    <FormDescription><span suppressHydrationWarning>Gelen malzeme için tedarikçi bilgisi.</span></FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="trackingNumber"
                render={({ field }) => (
                <FormItem>
                    <FormLabel><span suppressHydrationWarning>Takip Numarası (İsteğe Bağlı)</span></FormLabel>
                    <FormControl><Input placeholder="Kargo takip numarası" {...field} /></FormControl>
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
              <FormControl><Textarea placeholder="Malzeme kaydı ile ilgili ek notlar..." className="resize-none" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? <span suppressHydrationWarning>Kaydediliyor...</span> : (isEditing ? <span suppressHydrationWarning>Kaydı Güncelle</span> : <span suppressHydrationWarning>Yeni Kayıt Ekle</span>)}
        </Button>
      </form>
    </Form>
  );
}
