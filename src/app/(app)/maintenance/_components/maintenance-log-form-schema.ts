
import { z } from "zod";
import { firearmStatuses } from "@/app/(app)/inventory/firearms/_components/firearm-form-schema";
import { magazineStatuses } from "@/app/(app)/inventory/magazines/_components/magazine-form-schema";
import { otherMaterialStatuses } from "@/app/(app)/inventory/other-materials/_components/other-material-form-schema"; // New import

// Combined and unique statuses for maintenance log options
const allPossibleStatuses = [...new Set([...firearmStatuses, ...magazineStatuses, ...otherMaterialStatuses])] as [string, ...string[]];

export const maintenanceLogFormSchema = z.object({
  itemId: z.string().min(1, { message: "Bakım yapılacak öğe seçilmelidir." }),
  itemType: z.enum(["firearm", "magazine", "other"], { // Added "other"
    errorMap: () => ({ message: "Geçerli bir öğe türü seçin." }),
  }),
  selectedFirearmDefIdForFilter: z.string().optional(),
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Geçerli bir tarih giriniz.",
  }),
  description: z.string().min(5, { message: "Açıklama en az 5 karakter olmalıdır." }).max(1000),
  statusChangeFrom: z.enum(allPossibleStatuses, {
    errorMap: () => ({ message: "Geçerli bir önceki durum seçin." }),
  }).or(z.literal("")),
  statusChangeTo: z.enum(allPossibleStatuses, {
    errorMap: () => ({ message: "Geçerli bir yeni durum seçin." }),
  }),
  technician: z.string().max(100).optional(),
  partsUsed: z.string().max(500).optional(),
});

export type MaintenanceLogFormValues = z.infer<typeof maintenanceLogFormSchema>;
