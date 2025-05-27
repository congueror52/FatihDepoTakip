
import { z } from "zod";

export const ammunitionDailyUsageFormSchema = z.object({
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Geçerli bir tarih giriniz.",
  }),
  personnelCount: z.coerce.number().int().min(0, { message: "Kişi sayısı 0 veya daha büyük olmalıdır." }),
  usageScenarioId: z.string().optional(),
  used_9x19mm: z.coerce.number().int().min(0, { message: "Kullanılan miktar 0 veya daha büyük olmalıdır." }).default(0),
  used_5_56x45mm: z.coerce.number().int().min(0, { message: "Kullanılan miktar 0 veya daha büyük olmalıdır." }).default(0),
  used_7_62x39mm: z.coerce.number().int().min(0, { message: "Kullanılan miktar 0 veya daha büyük olmalıdır." }).default(0),
  used_7_62x51mm: z.coerce.number().int().min(0, { message: "Kullanılan miktar 0 veya daha büyük olmalıdır." }).default(0),
  "used_12 Kalibre": z.coerce.number().int().min(0, { message: "Kullanılan miktar 0 veya daha büyük olmalıdır." }).default(0), // New caliber
  notes: z.string().max(500, "Notlar en fazla 500 karakter olabilir.").optional(),
});

export type AmmunitionDailyUsageFormValues = z.infer<typeof ammunitionDailyUsageFormSchema>;
