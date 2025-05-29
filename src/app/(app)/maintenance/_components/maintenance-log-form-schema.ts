
import { z } from "zod";
import { firearmStatuses } from "@/app/(app)/inventory/firearms/_components/firearm-form-schema";
import { magazineStatuses } from "@/app/(app)/inventory/magazines/_components/magazine-form-schema";

const allStatuses = [...new Set([...firearmStatuses, ...magazineStatuses])] as [string, ...string[]];

export const maintenanceLogFormSchema = z.object({
  itemId: z.string().min(1, { message: "Bakım yapılacak öğe seçilmelidir." }),
  itemType: z.enum(["firearm", "magazine"], {
    errorMap: () => ({ message: "Geçerli bir öğe türü seçin." }),
  }),
  selectedFirearmDefIdForFilter: z.string().optional(), // Temporary field for UI logic, not part of final data
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Geçerli bir tarih giriniz.",
  }),
  description: z.string().min(5, { message: "Açıklama en az 5 karakter olmalıdır." }).max(1000),
  statusChangeFrom: z.enum(allStatuses, {
    errorMap: () => ({ message: "Geçerli bir önceki durum seçin." }),
  }).or(z.literal("")), // Allow empty string initially
  statusChangeTo: z.enum(allStatuses, {
    errorMap: () => ({ message: "Geçerli bir yeni durum seçin." }),
  }),
  technician: z.string().max(100).optional(),
  partsUsed: z.string().max(500).optional(),
});

export type MaintenanceLogFormValues = z.infer<typeof maintenanceLogFormSchema>;
