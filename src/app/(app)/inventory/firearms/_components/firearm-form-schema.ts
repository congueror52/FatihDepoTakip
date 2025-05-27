import { z } from "zod";
import { DEPOT_LOCATIONS } from "@/types/inventory";

export const firearmStatuses = ['Hizmette', 'Bakımda', 'Arızalı', 'Onarım Bekliyor', 'Onarıldı', 'Hizmet Dışı'] as const;

export const firearmFormSchema = z.object({
  name: z.string().min(2, { message: "İsim en az 2 karakter olmalıdır." }).max(100),
  serialNumber: z.string().min(2, { message: "Seri numarası en az 2 karakter olmalıdır." }).max(50),
  model: z.string().min(1, { message: "Model gereklidir." }).max(100),
  manufacturer: z.string().optional(),
  caliber: z.string().min(1, { message: "Kalibre gereklidir." }).max(50),
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
