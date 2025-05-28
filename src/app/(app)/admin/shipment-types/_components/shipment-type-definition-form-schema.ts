
import { z } from "zod";

export const shipmentTypeDefinitionFormSchema = z.object({
  id: z.string().optional(), // Optional for new, present for edit
  name: z.string().min(2, { message: "Tür adı en az 2 karakter olmalıdır." }).max(100),
  description: z.string().max(255).optional(),
  requiresSourceDepot: z.boolean().default(false),
  requiresDestinationDepot: z.boolean().default(true),
});

export type ShipmentTypeDefinitionFormValues = z.infer<typeof shipmentTypeDefinitionFormSchema>;
