
import { z } from "zod";

// Updated firearm statuses
export const firearmStatuses = ['Depoda', 'Destekte', 'Depoda Arızalı', 'Poligonda', 'Onarıldı', 'Rapor Bekliyor'] as const;

export const firearmFormSchema = z.object({
  definitionId: z.string().min(1, { message: "Lütfen bir silah türü seçin." }),
  name: z.string().optional(), 
  model: z.string().optional(), 
  manufacturer: z.string().optional(), 
  caliber: z.string().optional(), 
  serialNumber: z.string().min(2, { message: "Seri numarası en az 2 karakter olmalıdır." }).max(50),
  depotId: z.string().min(1, { message: "Lütfen geçerli bir depo seçin." }), 
  status: z.enum(firearmStatuses, {
    errorMap: () => ({ message: "Lütfen geçerli bir durum seçin." }),
  }),
  purchaseDate: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.string()
      .refine(
        (val) => {
          if (!val) return true; // Allow undefined after preprocessing
          try {
            return !isNaN(new Date(val).getTime());
          } catch (e) {
            return false;
          }
        },
        {
          message: "Satın alma tarihi için geçersiz tarih formatı. (YYYY-MM-DD bekleniyor)",
        }
      )
      .optional()
  ),
  notes: z.string().max(500).optional(),
});

export type FirearmFormValues = z.infer<typeof firearmFormSchema>;

