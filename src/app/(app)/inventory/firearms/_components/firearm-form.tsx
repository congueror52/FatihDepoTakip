
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
import type { Firearm, FirearmDefinition, Depot } from "@/types/inventory"; // Added Depot
// import { DEPOT_LOCATIONS } from "@/types/inventory"; // Removed
import { firearmFormSchema, firearmStatuses, type FirearmFormValues } from "./firearm-form-schema";
import { addFirearmAction, updateFirearmAction } from "@/lib/actions/inventory.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FirearmFormProps {
  firearm?: Firearm; 
  firearmDefinitions: FirearmDefinition[];
  depots: Depot[]; // Added depots prop
}

export function FirearmForm({ firearm, firearmDefinitions, depots }: FirearmFormProps) { // Added depots to props
  const { toast } = useToast();
  const router = useRouter();
  const [selectedDefinition, setSelectedDefinition] = useState<FirearmDefinition | null>(null);

  const defaultValues: FirearmFormValues = firearm ? {
    ...firearm,
    purchaseDate: firearm.purchaseDate ? format(new Date(firearm.purchaseDate), 'yyyy-MM-dd') : undefined,
    notes: firearm.notes || "", 
  } : {
    definitionId: "", 
    serialNumber: "", 
    status: 'Hizmette',
    depotId: depots.length > 0 ? depots[0].id : "", // Default to first available depot
    purchaseDate: undefined,
    notes: "", 
    name: "",
    model: "",
    manufacturer: "",
    caliber: "",
  };
  
  const form = useForm<FirearmFormValues>({
    resolver: zodResolver(firearmFormSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (firearm && firearm.definitionId) {
      const definition = firearmDefinitions.find(def => def.id === firearm.definitionId);
      if (definition) {
        setSelectedDefinition(definition);
        form.setValue('name', definition.name);
        form.setValue('model', definition.model);
        form.setValue('manufacturer', definition.manufacturer || "");
        form.setValue('caliber', definition.caliber);
      }
    }
  }, [firearm, firearmDefinitions, form]);


  const handleDefinitionChange = (definitionId: string) => {
    const definition = firearmDefinitions.find(def => def.id === definitionId);
    if (definition) {
      setSelectedDefinition(definition);
      form.setValue('definitionId', definition.id);
      form.setValue('name', definition.name);
      form.setValue('model', definition.model);
      form.setValue('manufacturer', definition.manufacturer || "");
      form.setValue('caliber', definition.caliber);
      form.clearErrors(['name', 'model', 'manufacturer', 'caliber']);
    } else {
      setSelectedDefinition(null);
      form.setValue('name', '');
      form.setValue('model', '');
      form.setValue('manufacturer', '');
      form.setValue('caliber', '');
    }
  };

  async function onSubmit(data: FirearmFormValues) {
    try {
      if (firearm) {
        const firearmToUpdate: Firearm = {
          ...firearm, 
          serialNumber: data.serialNumber,
          depotId: data.depotId,
          status: data.status,
          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : undefined,
          notes: data.notes,
        };
        await updateFirearmAction(firearmToUpdate);
        toast({ variant: "success", title: "Başarılı", description: "Silah başarıyla güncellendi." });
      } else {
         if (!data.definitionId) {
          toast({ variant: "destructive", title: "Hata", description: "Lütfen bir silah türü seçin." });
          return;
        }
        await addFirearmAction({
          definitionId: data.definitionId,
          serialNumber: data.serialNumber,
          depotId: data.depotId,
          status: data.status,
          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : undefined,
          notes: data.notes,
        });
        toast({ variant: "success", title: "Başarılı", description: "Silah başarıyla eklendi." });
      }
      router.push("/inventory/firearms");
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || `Silah ${firearm ? 'güncellenirken' : 'eklenirken'} hata oluştu.` });
      console.error("Form gönderme hatası:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="definitionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel><span suppressHydrationWarning>Silah Türü</span></FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  handleDefinitionChange(value);
                }} 
                defaultValue={field.value}
                disabled={!!firearm} 
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Bir silah türü seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {firearmDefinitions.length === 0 && <SelectItem value="loading" disabled><span suppressHydrationWarning>Yükleniyor...</span></SelectItem>}
                  {firearmDefinitions.map(def => (
                    <SelectItem key={def.id} value={def.id}><span suppressHydrationWarning>{def.name} ({def.model} - {def.caliber})</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription><span suppressHydrationWarning>Sisteme eklenecek silahın önceden tanımlanmış türünü seçin.</span></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedDefinition && (
          <Card className="bg-muted/50">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-base"><span suppressHydrationWarning>Seçilen Silah Türü Bilgileri</span></CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm pb-4">
              <div><strong><span suppressHydrationWarning>Ad:</span></strong> <span suppressHydrationWarning>{selectedDefinition.name}</span></div>
              <div><strong><span suppressHydrationWarning>Model:</span></strong> <span suppressHydrationWarning>{selectedDefinition.model}</span></div>
              <div><strong><span suppressHydrationWarning>Kalibre:</span></strong> <span suppressHydrationWarning>{selectedDefinition.caliber}</span></div>
              {selectedDefinition.manufacturer && <div><strong><span suppressHydrationWarning>Üretici:</span></strong> <span suppressHydrationWarning>{selectedDefinition.manufacturer}</span></div>}
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="serialNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel><span suppressHydrationWarning>Seri Numarası</span></FormLabel>
                <FormControl>
                  <Input placeholder="SN123456789" {...field} />
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
                    <SelectTrigger>
                      <SelectValue placeholder="Bir depo seçin" />
                    </SelectTrigger>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {firearmStatuses.map(status => (
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
            name="purchaseDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel><span suppressHydrationWarning>Satın Alma Tarihi (İsteğe Bağlı)</span></FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP", { locale: tr })
                        ) : (
                          <span suppressHydrationWarning>Bir tarih seçin</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
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
                <Textarea
                  placeholder="Silahla ilgili ek notlar..."
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
          {form.formState.isSubmitting ? <span suppressHydrationWarning>Kaydediliyor...</span> : (firearm ? <span suppressHydrationWarning>Silahı Güncelle</span> : <span suppressHydrationWarning>Silah Ekle</span>)}
        </Button>
      </form>
    </Form>
  );
}
