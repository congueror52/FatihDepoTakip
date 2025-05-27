
import { z } from "zod";
import { DEPOT_LOCATIONS } from "@/types/inventory";

export const firearmStatuses = ['Hizmette', 'Bakımda', 'Arızalı', 'Onarım Bekliyor', 'Onarıldı', 'Hizmet Dışı'] as const;

export const firearmFormSchema = z.object({
  definitionId: z.string().min(1, { message: "Lütfen bir silah türü seçin." }),
  // name, model, manufacturer, caliber will be auto-filled from definition
  // but we can keep them in schema if needed for validation display, though they won't be user-editable directly
  name: z.string().optional(), // Will be auto-filled
  model: z.string().optional(), // Will be auto-filled
  manufacturer: z.string().optional(), // Will be auto-filled
  caliber: z.string().optional(), // Will be auto-filled
  serialNumber: z.string().min(2, { message: "Seri numarası en az 2 karakter olmalıdır." }).max(50),
  depotId: z.enum(DEPOT_LOCATIONS.map(d => d.id) as [string, ...string[]], {
    errorMap: () => ({ message: "Lütfen geçerli bir depo seçin." }),
  }),
  status: z.enum(firearmStatuses, {
    errorMap: () => ({ message: "Lütfen geçerli bir durum seçin." }),
  }),
  purchaseDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Satın alma tarihi için geçersiz tarih formatı.",
  }),
  notes: z.string().max(500).optional(),
});

export type FirearmFormValues = z.infer<typeof firearmFormSchema>;
