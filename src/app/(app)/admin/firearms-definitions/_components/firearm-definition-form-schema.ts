
import { z } from "zod";
import { SUPPORTED_CALIBERS } from "@/types/inventory";

export const firearmDefinitionFormSchema = z.object({
  name: z.string().min(2, { message: "İsim en az 2 karakter olmalıdır." }).max(100),
  model: z.string().min(1, { message: "Model gereklidir." }).max(100),
  manufacturer: z.string().optional(),
  caliber: z.enum(SUPPORTED_CALIBERS, {
    errorMap: () => ({ message: "Lütfen geçerli bir kalibre seçin." }),
  }),
  description: z.string().max(500).optional(),
});

export type FirearmDefinitionFormValues = z.infer<typeof firearmDefinitionFormSchema>;
