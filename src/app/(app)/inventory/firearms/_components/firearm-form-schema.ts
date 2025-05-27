import { z } from "zod";
import { DEPOT_LOCATIONS } from "@/types/inventory";

export const firearmStatuses = ['In Service', 'Under Maintenance', 'Defective', 'Awaiting Repair', 'Repaired', 'Out of Service'] as const;

export const firearmFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100),
  serialNumber: z.string().min(2, { message: "Serial number must be at least 2 characters." }).max(50),
  model: z.string().min(1, { message: "Model is required." }).max(100),
  manufacturer: z.string().optional(),
  caliber: z.string().min(1, { message: "Caliber is required." }).max(50),
  depotId: z.enum(DEPOT_LOCATIONS.map(d => d.id) as [string, ...string[]], {
    errorMap: () => ({ message: "Please select a valid depot." }),
  }),
  status: z.enum(firearmStatuses, {
    errorMap: () => ({ message: "Please select a valid status." }),
  }),
  purchaseDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format for purchase date.",
  }),
  notes: z.string().max(500).optional(),
});

export type FirearmFormValues = z.infer<typeof firearmFormSchema>;
