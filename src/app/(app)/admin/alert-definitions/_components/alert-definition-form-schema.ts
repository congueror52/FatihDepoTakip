
import { z } from "zod";
import { 
  ALERT_ENTITY_TYPES, 
  ALERT_CONDITION_TYPES, 
  ALERT_SEVERITIES,
  SUPPORTED_CALIBERS
} from "@/types/inventory";
import { firearmStatuses } from "@/app/(app)/inventory/firearms/_components/firearm-form-schema";
import { magazineStatuses } from "@/app/(app)/inventory/magazines/_components/magazine-form-schema";

const allItemStatuses = [...new Set([...firearmStatuses, ...magazineStatuses])] as [string, ...string[]];


export const alertDefinitionFormSchema = z.object({
  name: z.string().min(3, { message: "Uyarı adı en az 3 karakter olmalıdır." }).max(100),
  description: z.string().max(255).optional(),
  entityType: z.enum(ALERT_ENTITY_TYPES.map(et => et.value) as [string, ...string[]], {
    errorMap: () => ({ message: "Lütfen geçerli bir varlık türü seçin." }),
  }),
  conditionType: z.enum(ALERT_CONDITION_TYPES.map(ct => ct.value) as [string, ...string[]],{
    errorMap: () => ({ message: "Lütfen geçerli bir koşul türü seçin." }),
  }),
  caliberFilter: z.enum(SUPPORTED_CALIBERS).optional(),
  thresholdValue: z.coerce.number().int().min(0).optional(),
  statusFilter: z.enum(allItemStatuses).optional(),
  // daysBeforeMaintenance: z.coerce.number().int().min(0).optional(), // Future
  severity: z.enum(ALERT_SEVERITIES as [string, ...string[]], {
    errorMap: () => ({ message: "Lütfen geçerli bir ciddiyet seviyesi seçin." }),
  }),
  messageTemplate: z.string().min(10, { message: "Mesaj şablonu en az 10 karakter olmalıdır." }).max(500),
  isActive: z.boolean().default(true),
}).superRefine((data, ctx) => {
  const applicableConditions = ALERT_CONDITION_TYPES.find(ct => ct.value === data.conditionType)?.applicableTo;
  if (applicableConditions && !applicableConditions.includes(data.entityType)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Bu koşul türü seçilen varlık türü için geçerli değil.`,
      path: ["conditionType"],
    });
  }

  if (data.conditionType === 'low_stock') {
    if (data.entityType !== 'ammunition') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Düşük stok koşulu sadece mühimmat için geçerlidir.", path: ["conditionType"] });
    }
    if (data.thresholdValue === undefined || data.thresholdValue < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Düşük stok için eşik değer girilmelidir.", path: ["thresholdValue"] });
    }
    // caliberFilter is optional for low_stock
  }

  if (data.conditionType === 'status_is') {
    if (data.entityType !== 'firearm' && data.entityType !== 'magazine') {
         ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Durum koşulu sadece silah veya şarjör için geçerlidir.", path: ["conditionType"] });
    }
    if (!data.statusFilter) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Durum filtresi seçilmelidir.", path: ["statusFilter"] });
    }
  }
  // Add more refinements as other condition types are implemented
});


export type AlertDefinitionFormValues = z.infer<typeof alertDefinitionFormSchema>;

    