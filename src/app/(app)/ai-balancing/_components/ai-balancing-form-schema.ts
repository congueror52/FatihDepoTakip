import { z } from "zod";

const itemRequirementSchema = z.object({
  nameOrCaliber: z.string().min(1, "Item name or caliber is required."),
  quantity: z.number().int().positive("Quantity must be a positive integer."),
  itemType: z.enum(["firearm", "magazine", "ammunition"], {
    errorMap: () => ({ message: "Invalid item type." }),
  }),
});

export const upcomingRequirementsSchema = z.object({
  description: z.string().min(5, "Description must be at least 5 characters.").max(500, "Description too long."),
  requiredItems: z.array(itemRequirementSchema).min(1, "At least one required item must be specified."),
  depotId: z.enum(["depotA", "depotB", "any"]).optional(),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid start date."}),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid end date."}),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date cannot be before start date.",
  path: ["endDate"], // useful for react-hook-form to highlight the correct field
});


export const aiBalancingFormSchema = z.object({
  depotAInventory: z.string().min(1, "Depot A inventory data is required."), // Will be stringified JSON
  depotBInventory: z.string().min(1, "Depot B inventory data is required."), // Will be stringified JSON
  historicalUsageData: z.string().min(1, "Historical usage data is required."), // Will be stringified JSON
  upcomingRequirements: upcomingRequirementsSchema.optional(),
});

export type AiBalancingFormValues = z.infer<typeof aiBalancingFormSchema>;
export type UpcomingRequirementsFormValues = z.infer<typeof upcomingRequirementsSchema>;
