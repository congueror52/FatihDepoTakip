import { z } from "zod";

const itemRequirementSchema = z.object({
  nameOrCaliber: z.string().min(1, "Öğe adı veya kalibresi gereklidir."),
  quantity: z.number().int().positive("Miktar pozitif bir tam sayı olmalıdır."),
  itemType: z.enum(["firearm", "magazine", "ammunition"], { // These are keys, display handled in form
    errorMap: () => ({ message: "Geçersiz öğe türü." }),
  }),
});

export const upcomingRequirementsSchema = z.object({
  description: z.string().min(5, "Açıklama en az 5 karakter olmalıdır.").max(500, "Açıklama çok uzun."),
  requiredItems: z.array(itemRequirementSchema).min(1, "En az bir gerekli öğe belirtilmelidir."),
  depotId: z.enum(["depotA", "depotB", "any"]).optional(), // These are keys
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Geçersiz başlangıç tarihi."}),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Geçersiz bitiş tarihi."}),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: "Bitiş tarihi başlangıç tarihinden önce olamaz.",
  path: ["endDate"], 
});


export const aiBalancingFormSchema = z.object({
  depotAInventory: z.string().min(1, "Depo Alfa envanter verileri gereklidir."), 
  depotBInventory: z.string().min(1, "Depo Bravo envanter verileri gereklidir."), 
  historicalUsageData: z.string().min(1, "Geçmiş kullanım verileri gereklidir."), 
  upcomingRequirements: upcomingRequirementsSchema.optional(),
});

export type AiBalancingFormValues = z.infer<typeof aiBalancingFormSchema>;
export type UpcomingRequirementsFormValues = z.infer<typeof upcomingRequirementsSchema>;
