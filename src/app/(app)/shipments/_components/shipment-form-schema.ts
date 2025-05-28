
import { z } from "zod";
import { INVENTORY_ITEM_TYPES, SUPPORTED_CALIBERS } from "@/types/inventory";

const shipmentItemSchema = z.object({
  id: z.string(), // for useFieldArray key
  name: z.string().min(2, { message: "Malzeme adı en az 2 karakter olmalıdır." }).max(150),
  itemType: z.enum(INVENTORY_ITEM_TYPES.map(type => type.value) as [string, ...string[]], {
    errorMap: () => ({ message: "Geçerli bir malzeme türü seçin." }),
  }),
  quantity: z.coerce.number().int().min(1, { message: "Miktar en az 1 olmalıdır." }),
  caliber: z.string().optional(), 
  model: z.string().max(100).optional(),
  serialNumber: z.string().max(50).optional(),
  capacity: z.coerce.number().int().min(1).optional(),
});

export const shipmentFormSchema = z.object({
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Geçerli bir tarih giriniz.",
  }),
  typeId: z.string().min(1, { message: "Lütfen bir kayıt türü seçin." }), // Changed from 'type' to 'typeId'
  items: z.array(shipmentItemSchema).min(1, { message: "En az bir malzeme öğesi eklenmelidir." }),
  sourceDepotId: z.string().optional(),
  destinationDepotId: z.string().optional(),
  supplier: z.string().max(100).optional(),
  trackingNumber: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});
// Complex conditional validation for depots will be handled in the server action
// based on the properties of the selected ShipmentTypeDefinition.

export type ShipmentFormValues = z.infer<typeof shipmentFormSchema>;
export type ShipmentItemFormValues = z.infer<typeof shipmentItemSchema>;
