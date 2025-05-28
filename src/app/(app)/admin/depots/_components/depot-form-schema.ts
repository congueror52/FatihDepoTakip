
import { z } from "zod";

export const depotFormSchema = z.object({
  id: z.string().min(1, { message: "Depo ID gereklidir." }).max(50, {message: "Depo ID en fazla 50 karakter olabilir."}),
  name: z.string().min(2, { message: "Depo adı en az 2 karakter olmalıdır." }).max(100),
  address: z.string().max(255).optional(),
  contactPerson: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export type DepotFormValues = z.infer<typeof depotFormSchema>;
