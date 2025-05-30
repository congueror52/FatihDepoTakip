
import { z } from "zod";

export const otherMaterialStatuses = ['Depoda', 'Kullanımda', 'Arızalı', 'Bakımda', 'Hizmet Dışı'] as const;
export type OtherMaterialStatus = typeof otherMaterialStatuses[number];

export const otherMaterialFormSchema = z.object({
  name: z.string().min(2, { message: "Malzeme adı en az 2 karakter olmalıdır." }).max(150),
  category: z.string().max(100).optional().default(""),
  quantity: z.coerce.number().int().min(1, { message: "Miktar en az 1 olmalıdır." }).default(1),
  depotId: z.string().min(1, { message: "Lütfen geçerli bir depo seçin." }),
  status: z.enum(otherMaterialStatuses, {
    errorMap: () => ({ message: "Lütfen geçerli bir durum seçin." }),
  }),
  purchaseDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Satın alma tarihi için geçersiz tarih formatı.",
  }),
  notes: z.string().max(500).optional().default(""),
  manufacturer: z.string().max(100).optional().default(""),
});

export type OtherMaterialFormValues = z.infer<typeof otherMaterialFormSchema>;
