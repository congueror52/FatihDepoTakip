
import { z } from "zod";

export const firearmDefinitionFormSchema = z.object({
  name: z.string().min(2, { message: "İsim en az 2 karakter olmalıdır." }).max(100),
  model: z.string().min(1, { message: "Model gereklidir." }).max(100),
  manufacturer: z.string().optional(),
  caliber: z.string().min(1, { message: "Kalibre gereklidir." }).max(50),
  description: z.string().max(500).optional(),
});

export type FirearmDefinitionFormValues = z.infer<typeof firearmDefinitionFormSchema>;
