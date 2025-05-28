
import { z } from "zod";
import { DEPOT_LOCATIONS, SUPPORTED_CALIBERS } from "@/types/inventory";

export const magazineStatuses = ['Hizmette', 'Bakımda', 'Arızalı', 'Kayıp', 'Hizmet Dışı'] as const;

export const magazineFormSchema = z.object({
  name: z.string().min(2, { message: "Şarjör adı en az 2 karakter olmalıdır." }).max(100),
  serialNumber: z.string().max(50).optional(),
  caliber: z.enum(SUPPORTED_CALIBERS, {
    errorMap: () => ({ message: "Lütfen geçerli bir kalibre seçin." }),
  }),
  capacity: z.coerce.number().int().min(1, { message: "Kapasite en az 1 olmalıdır." }),
  quantity: z.coerce.number().int().min(1, { message: "Miktar en az 1 olmalıdır." }).default(1), // For batch adding
  depotId: z.enum(DEPOT_LOCATIONS.map(d => d.id) as [string, ...string[]], {
    errorMap: () => ({ message: "Lütfen geçerli bir depo seçin." }),
  }),
  status: z.enum(magazineStatuses, {
    errorMap: () => ({ message: "Lütfen geçerli bir durum seçin." }),
  }),
  manufacturer: z.string().max(100).optional(),
  purchaseDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Satın alma tarihi için geçersiz tarih formatı.",
  }),
  notes: z.string().max(500).optional(),
  compatibleFirearmDefinitionId: z.string().optional(), // Added this to schema based on previous implementation
});

export type MagazineFormValues = z.infer<typeof magazineFormSchema>;
