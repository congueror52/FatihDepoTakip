
import { z } from "zod";
import { SUPPORTED_CALIBERS } from "@/types/inventory";

// Updated magazine statuses
export const magazineStatuses = ['Depoda', 'Destekte', 'Depoda Arızalı', 'Poligonda', 'Rapor Bekliyor'] as const;

export const magazineFormSchema = z.object({
  name: z.string().min(2, { message: "Şarjör adı en az 2 karakter olmalıdır." }).max(100),
  serialNumber: z.string().max(50).optional().default(""), 
  caliber: z.enum(SUPPORTED_CALIBERS, {
    errorMap: () => ({ message: "Lütfen geçerli bir kalibre seçin." }),
  }),
  capacity: z.coerce.number().int().min(1, { message: "Kapasite en az 1 olmalıdır." }),
  quantity: z.coerce.number().int().min(1, { message: "Miktar en az 1 olmalıdır." }).default(1),
  depotId: z.string().min(1, { message: "Lütfen geçerli bir depo seçin." }),
  status: z.enum(magazineStatuses, {
    errorMap: () => ({ message: "Lütfen geçerli bir durum seçin." }),
  }),
  manufacturer: z.string().max(100).optional().default(""), 
  purchaseDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Satın alma tarihi için geçersiz tarih formatı.",
  }),
  notes: z.string().max(500).optional().default(""), 
  compatibleFirearmDefinitionId: z.string().optional(),
});

export type MagazineFormValues = z.infer<typeof magazineFormSchema>;

