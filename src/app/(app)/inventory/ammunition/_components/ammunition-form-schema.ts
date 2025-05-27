
import { z } from "zod";
import { DEPOT_LOCATIONS, SUPPORTED_CALIBERS } from "@/types/inventory";

export const ammunitionStatuses = ['Mevcut', 'Düşük Stok', 'Kritik Stok', 'Tükenmek Üzere'] as const;

export const ammunitionFormSchema = z.object({
  name: z.string().min(2, { message: "Mühimmat adı en az 2 karakter olmalıdır." }).max(100),
  caliber: z.enum(SUPPORTED_CALIBERS, {
    errorMap: () => ({ message: "Lütfen geçerli bir kalibre seçin." }),
  }),
  quantity: z.coerce.number().int().min(0, { message: "Miktar 0 veya daha büyük olmalıdır." }),
  depotId: z.enum(DEPOT_LOCATIONS.map(d => d.id) as [string, ...string[]], {
    errorMap: () => ({ message: "Lütfen geçerli bir depo seçin." }),
  }),
  status: z.enum(ammunitionStatuses, {
    errorMap: () => ({ message: "Lütfen geçerli bir durum seçin." }),
  }),
  bulletType: z.string().max(50).optional(),
  lotNumber: z.string().max(50).optional(),
  manufacturer: z.string().max(100).optional(),
  purchaseDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Satın alma tarihi için geçersiz tarih formatı.",
  }),
  notes: z.string().max(500).optional(),
});

export type AmmunitionFormValues = z.infer<typeof ammunitionFormSchema>;
