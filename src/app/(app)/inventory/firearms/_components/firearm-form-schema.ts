
import { z } from "zod";
// import { DEPOT_LOCATIONS } from "@/types/inventory"; // Removed as depots are now dynamic

export const firearmStatuses = ['Hizmette', 'Bakımda', 'Arızalı', 'Onarım Bekliyor', 'Onarıldı', 'Hizmet Dışı'] as const;

export const firearmFormSchema = z.object({
  definitionId: z.string().min(1, { message: "Lütfen bir silah türü seçin." }),
  name: z.string().optional(), 
  model: z.string().optional(), 
  manufacturer: z.string().optional(), 
  caliber: z.string().optional(), 
  serialNumber: z.string().min(2, { message: "Seri numarası en az 2 karakter olmalıdır." }).max(50),
  depotId: z.string().min(1, { message: "Lütfen geçerli bir depo seçin." }), // Changed to generic string validation
  status: z.enum(firearmStatuses, {
    errorMap: () => ({ message: "Lütfen geçerli bir durum seçin." }),
  }),
  purchaseDate: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val), // Convert empty/whitespace-only strings to undefined
    z.string()
      .refine(
        (val) => {
          // This refine is now only called if val is a non-empty string or undefined (optional handles undefined)
          // If val is a non-empty string, try to parse it.
          try {
            return !isNaN(new Date(val).getTime());
          } catch (e) {
            return false; // Should not happen if string is valid date-like, but good to have
          }
        },
        {
          message: "Satın alma tarihi için geçersiz tarih formatı. (YYYY-MM-DD bekleniyor)",
        }
      )
      .optional() // Allows the field to be undefined after preprocessing
  ),
  notes: z.string().max(500).optional(),
});

export type FirearmFormValues = z.infer<typeof firearmFormSchema>;
