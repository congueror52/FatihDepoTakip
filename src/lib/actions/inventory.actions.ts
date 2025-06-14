
'use server';

import { revalidatePath } from 'next/cache';
import { unstable_noStore as noStore } from 'next/cache';
import type { Firearm, Magazine, Ammunition, Shipment, ShipmentItem, FirearmDefinition, AmmunitionDailyUsageLog, UsageScenario, ScenarioCaliberConsumption, SupportedCaliber, MagazineStatus, AmmunitionStatus, Depot, MaintenanceLog, MaintenanceItemStatus, FirearmStatus, InventoryItemType, ShipmentTypeDefinition, AlertDefinition, OtherMaterial, OtherMaterialStatus, ActiveAlert, TriggeredAlertContext, AlertSeverity } from '@/types/inventory';
import { readData, writeData, generateId } from '@/lib/data-utils';
import { logAction } from '@/lib/log-service';
import { firearmFormSchema, firearmStatuses as firearmStatusesArray } from '@/app/(app)/inventory/firearms/_components/firearm-form-schema';
import { firearmDefinitionFormSchema, type FirearmDefinitionFormValues } from '@/app/(app)/admin/firearms-definitions/_components/firearm-definition-form-schema';
import { ammunitionDailyUsageFormSchema } from '@/app/(app)/daily-ammo-usage/_components/usage-log-form-schema';
import { usageScenarioFormSchema } from '@/app/(app)/admin/usage-scenarios/_components/usage-scenario-form-schema';
import { magazineFormSchema, type MagazineFormValues } from '@/app/(app)/inventory/magazines/_components/magazine-form-schema';
import { ammunitionFormSchema } from '@/app/(app)/inventory/ammunition/_components/ammunition-form-schema';
import { otherMaterialFormSchema, type OtherMaterialFormValues, otherMaterialStatuses } from '@/app/(app)/inventory/other-materials/_components/other-material-form-schema';
import { depotFormSchema } from '@/app/(app)/admin/depots/_components/depot-form-schema';
import { maintenanceLogFormSchema } from '@/app/(app)/maintenance/_components/maintenance-log-form-schema';
import { shipmentFormSchema } from '@/app/(app)/shipments/_components/shipment-form-schema';
import { alertDefinitionFormSchema } from '@/app/(app)/admin/alert-definitions/_components/alert-definition-form-schema';

import type { AuditLogEntry } from '@/types/audit';
import { format, parseISO, getMonth, getYear } from 'date-fns';
import { tr } from 'date-fns/locale';
import { SUPPORTED_CALIBERS } from '@/types/inventory';


// Firearm Definitions
export async function getFirearmDefinitions(): Promise<FirearmDefinition[]> {
  noStore();
  return readData<FirearmDefinition>('firearm_definitions.json');
}

export async function getFirearmDefinitionById(id: string): Promise<FirearmDefinition | undefined> {
  noStore();
  const definitions = await getFirearmDefinitions();
  return definitions.find(d => d.id === id);
}

export async function addFirearmDefinitionAction(data: FirearmDefinitionFormValues): Promise<FirearmDefinition> {
  try {
    const validatedData = firearmDefinitionFormSchema.safeParse(data);
    if (!validatedData.success) {
      const errorMsg = 'Geçersiz silah tanımı verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "CREATE", entityType: "FirearmDefinition", status: "FAILURE", details: data, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const definitions = await getFirearmDefinitions();
    const newDefinition: FirearmDefinition = {
      ...validatedData.data,
      id: await generateId(),
      lastUpdated: new Date().toISOString(),
    };
    definitions.push(newDefinition);
    await writeData('firearm_definitions.json', definitions);
    await logAction({ actionType: "CREATE", entityType: "FirearmDefinition", entityId: newDefinition.id, status: "SUCCESS", details: newDefinition });

    revalidatePath('/admin/firearms-definitions');
    revalidatePath('/admin/firearms-definitions', 'layout');
    revalidatePath('/dashboard');
    return newDefinition;
  } catch (error: any) {
    if (error.message.startsWith('Geçersiz silah tanımı verisi')) throw error;
    await logAction({ actionType: "CREATE", entityType: "FirearmDefinition", status: "FAILURE", details: data, errorMessage: error.message });
    throw error;
  }
}

export async function updateFirearmDefinitionAction(definition: FirearmDefinition) {
  try {
    const validatedData = firearmDefinitionFormSchema.safeParse(definition);
    if (!validatedData.success) {
      const errorMsg = 'Güncelleme için geçersiz silah tanımı verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "UPDATE", entityType: "FirearmDefinition", entityId: definition.id, status: "FAILURE", details: definition, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    let definitions = await getFirearmDefinitions();
    const index = definitions.findIndex(d => d.id === definition.id);
    if (index === -1) {
      const errorMsg = 'Güncellenecek silah tanımı bulunamadı.';
      await logAction({ actionType: "UPDATE", entityType: "FirearmDefinition", entityId: definition.id, status: "FAILURE", details: definition, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const updatedDefinition = {
      ...definitions[index],
      ...validatedData.data,
      lastUpdated: new Date().toISOString(),
    };

    definitions[index] = updatedDefinition;
    await writeData('firearm_definitions.json', definitions);
    await logAction({ actionType: "UPDATE", entityType: "FirearmDefinition", entityId: updatedDefinition.id, status: "SUCCESS", details: updatedDefinition });

    revalidatePath('/admin/firearms-definitions');
    revalidatePath('/admin/firearms-definitions', 'layout');
    revalidatePath(`/admin/firearms-definitions/${definition.id}/edit`);
    revalidatePath('/dashboard');
    return updatedDefinition;
  } catch (error: any) {
     if (error.message.startsWith('Güncelleme için geçersiz silah tanımı verisi') || error.message.startsWith('Güncellenecek silah tanımı bulunamadı')) throw error;
    await logAction({ actionType: "UPDATE", entityType: "FirearmDefinition", entityId: definition.id, status: "FAILURE", details: definition, errorMessage: error.message });
    throw error;
  }
}

export async function deleteFirearmDefinitionAction(id: string): Promise<void> {
  try {
    let definitions = await getFirearmDefinitions();
    const firearms = await getFirearms();
    if (firearms.some(f => f.definitionId === id)) {
      const errorMsg = 'Bu silah tanımını kullanan silahlar mevcut. Önce bu silahları silin veya farklı bir tanıma taşıyın.';
      await logAction({ actionType: "DELETE", entityType: "FirearmDefinition", entityId: id, status: "FAILURE", errorMessage: errorMsg });
      throw new Error(errorMsg);
    }
    definitions = definitions.filter(d => d.id !== id);
    await writeData('firearm_definitions.json', definitions);
    await logAction({ actionType: "DELETE", entityType: "FirearmDefinition", entityId: id, status: "SUCCESS" });

    revalidatePath('/admin/firearms-definitions');
    revalidatePath('/admin/firearms-definitions', 'layout');
    revalidatePath('/dashboard');
  } catch (error: any) {
    if (error.message.startsWith('Bu silah tanımını kullanan silahlar mevcut')) throw error;
    await logAction({ actionType: "DELETE", entityType: "FirearmDefinition", entityId: id, status: "FAILURE", errorMessage: error.message });
    throw error;
  }
}

export async function exportFirearmDefinitionsToCsvAction(): Promise<string> {
  noStore();
  const definitions = await getFirearmDefinitions();
  if (definitions.length === 0) {
    return "";
  }
  const header = ["id", "name", "model", "manufacturer", "caliber", "description", "lastUpdated"];

  const escapeCsvField = (field: string | undefined | null): string => {
    if (field === null || field === undefined) return "";
    let strField = String(field);
    strField = strField.replace(/"/g, '""'); // Escape double quotes
    if (strField.includes(';') || strField.includes('"') || strField.includes('\n') || strField.includes('\r')) {
      return `"${strField}"`; // Enclose in double quotes if it contains separator or quotes
    }
    return strField;
  };

  const rows = definitions.map(def =>
    [
      escapeCsvField(def.id),
      escapeCsvField(def.name),
      escapeCsvField(def.model),
      escapeCsvField(def.manufacturer),
      escapeCsvField(def.caliber),
      escapeCsvField(def.description),
      escapeCsvField(def.lastUpdated)
    ].join(';')
  );

  return [header.join(';'), ...rows].join('\n');
}


// Firearms (Instances)
export async function getFirearms(): Promise<Firearm[]> {
  noStore();
  return readData<Firearm>('firearms.json');
}

export async function getFirearmById(id: string): Promise<Firearm | undefined> {
  noStore();
  const firearms = await getFirearms();
  return firearms.find(f => f.id === id);
}

export async function addFirearmAction(data: Omit<Firearm, 'id' | 'lastUpdated' | 'itemType' | 'maintenanceHistory' | 'name' | 'model' | 'manufacturer' | 'caliber'> & { definitionId: string }) {
  try {
    const validatedData = firearmFormSchema.safeParse(data);
    if (!validatedData.success) {
      const errorMsg = 'Geçersiz silah verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "CREATE", entityType: "Firearm", status: "FAILURE", details: data, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const definition = await getFirearmDefinitionById(validatedData.data.definitionId);
    if (!definition) {
      const errorMsg = 'Geçersiz silah tanım IDsi.';
      await logAction({ actionType: "CREATE", entityType: "Firearm", status: "FAILURE", details: data, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const firearms = await getFirearms();
    const newFirearm: Firearm = {
      ...validatedData.data,
      id: await generateId(),
      itemType: 'firearm',
      name: definition.name,
      model: definition.model,
      manufacturer: definition.manufacturer,
      caliber: definition.caliber,
      lastUpdated: new Date().toISOString(),
      maintenanceHistory: []
    };
    firearms.push(newFirearm);
    await writeData('firearms.json', firearms);
    await logAction({ actionType: "CREATE", entityType: "Firearm", entityId: newFirearm.id, status: "SUCCESS", details: newFirearm });

    revalidatePath('/inventory/firearms');
    revalidatePath('/inventory/firearms', 'layout');
    revalidatePath('/dashboard');
    return newFirearm;
  } catch (error: any) {
    if (error.message.startsWith('Geçersiz silah verisi') || error.message.startsWith('Geçersiz silah tanım IDsi')) throw error;
    await logAction({ actionType: "CREATE", entityType: "Firearm", status: "FAILURE", details: data, errorMessage: error.message });
    throw error;
  }
}

export async function updateFirearmAction(firearm: Firearm) {
  try {
    const validatedData = firearmFormSchema.safeParse({
      definitionId: firearm.definitionId,
      serialNumber: firearm.serialNumber,
      depotId: firearm.depotId,
      status: firearm.status,
      purchaseDate: firearm.purchaseDate,
      notes: firearm.notes,
      name: firearm.name,
      model: firearm.model,
      manufacturer: firearm.manufacturer,
      caliber: firearm.caliber,
    });

    if (!validatedData.success) {
      const errorMsg = 'Güncelleme için geçersiz silah verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "UPDATE", entityType: "Firearm", entityId: firearm.id, status: "FAILURE", details: firearm, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    let firearms = await getFirearms();
    const index = firearms.findIndex(f => f.id === firearm.id);
    if (index === -1) {
      const errorMsg = 'Güncellenecek silah bulunamadı.';
      await logAction({ actionType: "UPDATE", entityType: "Firearm", entityId: firearm.id, status: "FAILURE", details: firearm, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const currentFirearm = firearms[index];
    const updatedFirearm: Firearm = {
      ...currentFirearm,
      serialNumber: validatedData.data.serialNumber,
      depotId: validatedData.data.depotId,
      status: validatedData.data.status,
      purchaseDate: validatedData.data.purchaseDate,
      notes: validatedData.data.notes,
      lastUpdated: new Date().toISOString(),
    };

    firearms[index] = updatedFirearm;
    await writeData('firearms.json', firearms);
    await logAction({ actionType: "UPDATE", entityType: "Firearm", entityId: updatedFirearm.id, status: "SUCCESS", details: updatedFirearm });

    revalidatePath('/inventory/firearms');
    revalidatePath('/inventory/firearms', 'layout');
    revalidatePath(`/inventory/firearms/${firearm.id}`);
    revalidatePath(`/inventory/firearms/${firearm.id}/edit`);
    revalidatePath('/dashboard');
    return updatedFirearm;
  } catch (error: any) {
    if (error.message.startsWith('Güncelleme için geçersiz silah verisi') || error.message.startsWith('Güncellenecek silah bulunamadı')) throw error;
    await logAction({ actionType: "UPDATE", entityType: "Firearm", entityId: firearm.id, status: "FAILURE", details: firearm, errorMessage: error.message });
    throw error;
  }
}

export async function deleteFirearmAction(id: string): Promise<void> {
  try {
    let firearms = await getFirearms();
    firearms = firearms.filter(f => f.id !== id);
    await writeData('firearms.json', firearms);
    await logAction({ actionType: "DELETE", entityType: "Firearm", entityId: id, status: "SUCCESS" });

    revalidatePath('/inventory/firearms');
    revalidatePath('/inventory/firearms', 'layout');
    revalidatePath('/dashboard');
  } catch (error: any) {
    await logAction({ actionType: "DELETE", entityType: "Firearm", entityId: id, status: "FAILURE", errorMessage: error.message });
    throw error;
  }
}

export async function exportFirearmsToCsvAction(): Promise<string> {
  noStore();
  const firearms = await getFirearms();
  if (firearms.length === 0) {
    return "";
  }
  const header = [
    "id", "definitionId", "name", "model", "manufacturer", "caliber",
    "serialNumber", "depotId", "status", "purchaseDate", "notes", "lastUpdated"
  ];

  const escapeCsvField = (field: string | undefined | null): string => {
    if (field === null || field === undefined) return "";
    let strField = String(field);
    strField = strField.replace(/"/g, '""');
    if (strField.includes(';') || strField.includes('"') || strField.includes('\n') || strField.includes('\r')) {
      return `"${strField}"`;
    }
    return strField;
  };

  const rows = firearms.map(f =>
    [
      escapeCsvField(f.id),
      escapeCsvField(f.definitionId),
      escapeCsvField(f.name),
      escapeCsvField(f.model),
      escapeCsvField(f.manufacturer),
      escapeCsvField(f.caliber),
      escapeCsvField(f.serialNumber),
      escapeCsvField(f.depotId),
      escapeCsvField(f.status),
      escapeCsvField(f.purchaseDate ? f.purchaseDate.substring(0,10) : ""),
      escapeCsvField(f.notes),
      escapeCsvField(f.lastUpdated)
    ].join(';')
  );

  return [header.join(';'), ...rows].join('\n');
}


// Magazines
export async function getMagazines(): Promise<Magazine[]> {
  noStore();
  return readData<Magazine>('magazines.json');
}

export async function getMagazineById(id: string): Promise<Magazine | undefined> {
  noStore();
  const magazines = await getMagazines();
  return magazines.find(m => m.id === id);
}

export async function addMagazineAction(data: MagazineFormValues) {
  try {
    const validatedData = magazineFormSchema.safeParse(data);
    if (!validatedData.success) {
      const errorMsg = 'Geçersiz şarjör verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "CREATE", entityType: "Magazine", status: "FAILURE", details: data, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const magazines = await getMagazines();
    const quantity = validatedData.data.quantity || 1;
    const addedMagazines: Magazine[] = [];

    for (let i = 0; i < quantity; i++) {
      const newMagazine: Magazine = {
        name: validatedData.data.name,
        caliber: validatedData.data.caliber,
        capacity: validatedData.data.capacity,
        depotId: validatedData.data.depotId,
        status: validatedData.data.status,
        manufacturer: validatedData.data.manufacturer,
        purchaseDate: validatedData.data.purchaseDate,
        notes: validatedData.data.notes,
        compatibleFirearmDefinitionId: validatedData.data.compatibleFirearmDefinitionId,
        serialNumber: quantity > 1 ? undefined : validatedData.data.serialNumber, // Only set SN if quantity is 1
        id: await generateId(),
        itemType: 'magazine',
        lastUpdated: new Date().toISOString(),
        maintenanceHistory: [],
      };
      magazines.push(newMagazine);
      addedMagazines.push(newMagazine);
      await logAction({ actionType: "CREATE", entityType: "Magazine", entityId: newMagazine.id, status: "SUCCESS", details: newMagazine });
    }

    await writeData('magazines.json', magazines);

    revalidatePath('/inventory/magazines');
    revalidatePath('/inventory/magazines', 'layout');
    revalidatePath('/dashboard');
    return addedMagazines.length > 0 ? addedMagazines[0] : undefined;
  } catch (error: any) {
     if (error.message.startsWith('Geçersiz şarjör verisi')) throw error;
    await logAction({ actionType: "CREATE", entityType: "Magazine", status: "FAILURE", details: data, errorMessage: error.message });
    throw error;
  }
}

export async function updateMagazineAction(magazine: Magazine & { quantity?: number }) {
  try {
    const { quantity, ...magazineDataToValidate } = magazine;
    const validatedData = magazineFormSchema.omit({ quantity: true }).safeParse(magazineDataToValidate);

    if (!validatedData.success) {
      const errorMsg = 'Güncelleme için geçersiz şarjör verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "UPDATE", entityType: "Magazine", entityId: magazine.id, status: "FAILURE", details: magazine, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    let magazines = await getMagazines();
    const index = magazines.findIndex(m => m.id === magazine.id);
    if (index === -1) {
      const errorMsg = 'Güncellenecek şarjör bulunamadı.';
      await logAction({ actionType: "UPDATE", entityType: "Magazine", entityId: magazine.id, status: "FAILURE", details: magazine, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    magazines[index] = {
      ...magazines[index],
      ...validatedData.data,
      lastUpdated: new Date().toISOString(),
    };
    await writeData('magazines.json', magazines);
    await logAction({ actionType: "UPDATE", entityType: "Magazine", entityId: magazines[index].id, status: "SUCCESS", details: magazines[index] });

    revalidatePath('/inventory/magazines');
    revalidatePath('/inventory/magazines', 'layout');
    revalidatePath(`/inventory/magazines/${magazine.id}/edit`);
    revalidatePath('/dashboard');
    return magazines[index];
  } catch (error: any) {
    if (error.message.startsWith('Güncelleme için geçersiz şarjör verisi') || error.message.startsWith('Güncellenecek şarjör bulunamadı')) throw error;
    await logAction({ actionType: "UPDATE", entityType: "Magazine", entityId: magazine.id, status: "FAILURE", details: magazine, errorMessage: error.message });
    throw error;
  }
}

export async function deleteMagazineAction(id: string): Promise<void> {
  try {
    let magazines = await getMagazines();
    magazines = magazines.filter(m => m.id !== id);
    await writeData('magazines.json', magazines);
    await logAction({ actionType: "DELETE", entityType: "Magazine", entityId: id, status: "SUCCESS" });

    revalidatePath('/inventory/magazines');
    revalidatePath('/inventory/magazines', 'layout');
    revalidatePath('/dashboard');
  } catch (error: any) {
    await logAction({ actionType: "DELETE", entityType: "Magazine", entityId: id, status: "FAILURE", errorMessage: error.message });
    throw error;
  }
}


// Ammunition
export async function getAmmunition(): Promise<Ammunition[]> {
  noStore();
  return readData<Ammunition>('ammunition.json');
}

export async function getAmmunitionById(id: string): Promise<Ammunition | undefined> {
  noStore();
  const ammunition = await getAmmunition();
  return ammunition.find(a => a.id === id);
}

export async function addAmmunitionAction(data: Omit<Ammunition, 'id' | 'lastUpdated' | 'itemType'>) {
  try {
    const validatedData = ammunitionFormSchema.safeParse(data);
    if (!validatedData.success) {
      const errorMsg = 'Geçersiz mühimmat verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "CREATE", entityType: "Ammunition", status: "FAILURE", details: data, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const allAmmunition = await getAmmunition();
    const newAmmunition: Ammunition = {
      ...validatedData.data,
      id: await generateId(),
      itemType: 'ammunition',
      lastUpdated: new Date().toISOString(),
    };
    allAmmunition.push(newAmmunition);
    await writeData('ammunition.json', allAmmunition);
    await logAction({ actionType: "CREATE", entityType: "Ammunition", entityId: newAmmunition.id, status: "SUCCESS", details: newAmmunition });

    revalidatePath('/inventory/ammunition');
    revalidatePath('/inventory/ammunition', 'layout');
    revalidatePath('/dashboard');
    return newAmmunition;
  } catch (error: any) {
    if (error.message.startsWith('Geçersiz mühimmat verisi')) throw error;
    await logAction({ actionType: "CREATE", entityType: "Ammunition", status: "FAILURE", details: data, errorMessage: error.message });
    throw error;
  }
}

export async function updateAmmunitionAction(ammunition: Ammunition) {
  try {
    const validatedData = ammunitionFormSchema.safeParse(ammunition);
    if (!validatedData.success) {
      const errorMsg = 'Güncelleme için geçersiz mühimmat verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "UPDATE", entityType: "Ammunition", entityId: ammunition.id, status: "FAILURE", details: ammunition, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    let allAmmunition = await getAmmunition();
    const index = allAmmunition.findIndex(a => a.id === ammunition.id);
    if (index === -1) {
      const errorMsg = 'Güncellenecek mühimmat bulunamadı.';
      await logAction({ actionType: "UPDATE", entityType: "Ammunition", entityId: ammunition.id, status: "FAILURE", details: ammunition, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    allAmmunition[index] = {
      ...allAmmunition[index],
      ...validatedData.data,
      lastUpdated: new Date().toISOString(),
    };
    await writeData('ammunition.json', allAmmunition);
    await logAction({ actionType: "UPDATE", entityType: "Ammunition", entityId: allAmmunition[index].id, status: "SUCCESS", details: allAmmunition[index] });

    revalidatePath('/inventory/ammunition');
    revalidatePath('/inventory/ammunition', 'layout');
    revalidatePath(`/inventory/ammunition/${ammunition.id}/edit`);
    revalidatePath('/dashboard');
    return allAmmunition[index];
  } catch (error: any) {
    if (error.message.startsWith('Güncelleme için geçersiz mühimmat verisi') || error.message.startsWith('Güncellenecek mühimmat bulunamadı')) throw error;
    await logAction({ actionType: "UPDATE", entityType: "Ammunition", entityId: ammunition.id, status: "FAILURE", details: ammunition, errorMessage: error.message });
    throw error;
  }
}

export async function deleteAmmunitionAction(id: string): Promise<void> {
  try {
    let allAmmunition = await getAmmunition();
    allAmmunition = allAmmunition.filter(a => a.id !== id);
    await writeData('ammunition.json', allAmmunition);
    await logAction({ actionType: "DELETE", entityType: "Ammunition", entityId: id, status: "SUCCESS" });

    revalidatePath('/inventory/ammunition');
    revalidatePath('/inventory/ammunition', 'layout');
    revalidatePath('/dashboard');
  } catch (error: any) {
    await logAction({ actionType: "DELETE", entityType: "Ammunition", entityId: id, status: "FAILURE", errorMessage: error.message });
    throw error;
  }
}


// Other Materials
export async function getOtherMaterials(): Promise<OtherMaterial[]> {
  noStore();
  return readData<OtherMaterial>('other_materials.json');
}

export async function getOtherMaterialById(id: string): Promise<OtherMaterial | undefined> {
  noStore();
  const materials = await getOtherMaterials();
  return materials.find(m => m.id === id);
}

export async function addOtherMaterialAction(data: Omit<OtherMaterial, 'id' | 'lastUpdated' | 'itemType' | 'maintenanceHistory'> & { quantity: number }): Promise<OtherMaterial[]> {
  try {
    const validatedData = otherMaterialFormSchema.safeParse(data);
    if (!validatedData.success) {
      const errorMsg = 'Geçersiz diğer malzeme verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "CREATE", entityType: "OtherMaterial", status: "FAILURE", details: data, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const allMaterials = await getOtherMaterials();
    const quantityToAdd = validatedData.data.quantity;
    const addedMaterials: OtherMaterial[] = [];

    for (let i = 0; i < quantityToAdd; i++) {
      const newMaterial: OtherMaterial = {
        ...validatedData.data,
        quantity: 1,
        id: await generateId(),
        itemType: 'other',
        lastUpdated: new Date().toISOString(),
        maintenanceHistory: [],
      };
      allMaterials.push(newMaterial);
      addedMaterials.push(newMaterial);
      await logAction({ actionType: "CREATE", entityType: "OtherMaterial", entityId: newMaterial.id, status: "SUCCESS", details: newMaterial });
    }

    await writeData('other_materials.json', allMaterials);

    revalidatePath('/inventory/other-materials');
    revalidatePath('/inventory/other-materials', 'layout');
    revalidatePath('/dashboard');
    return addedMaterials;
  } catch (error: any) {
    if (error.message.startsWith('Geçersiz diğer malzeme verisi')) throw error;
    await logAction({ actionType: "CREATE", entityType: "OtherMaterial", status: "FAILURE", details: data, errorMessage: error.message });
    throw error;
  }
}

export async function updateOtherMaterialAction(material: OtherMaterial): Promise<OtherMaterial> {
  try {
    const validatedData = otherMaterialFormSchema.omit({ quantity: true }).safeParse(material);
    if (!validatedData.success) {
      const errorMsg = 'Güncelleme için geçersiz diğer malzeme verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "UPDATE", entityType: "OtherMaterial", entityId: material.id, status: "FAILURE", details: material, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    let allMaterials = await getOtherMaterials();
    const index = allMaterials.findIndex(m => m.id === material.id);
    if (index === -1) {
      const errorMsg = 'Güncellenecek diğer malzeme bulunamadı.';
      await logAction({ actionType: "UPDATE", entityType: "OtherMaterial", entityId: material.id, status: "FAILURE", details: material, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    allMaterials[index] = {
      ...allMaterials[index],
      ...validatedData.data,
      quantity: allMaterials[index].quantity,
      lastUpdated: new Date().toISOString(),
    };
    await writeData('other_materials.json', allMaterials);
    await logAction({ actionType: "UPDATE", entityType: "OtherMaterial", entityId: allMaterials[index].id, status: "SUCCESS", details: allMaterials[index] });

    revalidatePath('/inventory/other-materials');
    revalidatePath('/inventory/other-materials', 'layout');
    revalidatePath(`/inventory/other-materials/${material.id}`);
    revalidatePath(`/inventory/other-materials/${material.id}/edit`);
    revalidatePath('/dashboard');
    return allMaterials[index];
  } catch (error: any) {
    if (error.message.startsWith('Güncelleme için geçersiz diğer malzeme verisi') || error.message.startsWith('Güncellenecek diğer malzeme bulunamadı')) throw error;
    await logAction({ actionType: "UPDATE", entityType: "OtherMaterial", entityId: material.id, status: "FAILURE", details: material, errorMessage: error.message });
    throw error;
  }
}

export async function deleteOtherMaterialAction(id: string): Promise<void> {
  try {
    let allMaterials = await getOtherMaterials();
    allMaterials = allMaterials.filter(m => m.id !== id);
    await writeData('other_materials.json', allMaterials);
    await logAction({ actionType: "DELETE", entityType: "OtherMaterial", entityId: id, status: "SUCCESS" });

    revalidatePath('/inventory/other-materials');
    revalidatePath('/inventory/other-materials', 'layout');
    revalidatePath('/dashboard');
  } catch (error: any) {
    await logAction({ actionType: "DELETE", entityType: "OtherMaterial", entityId: id, status: "FAILURE", errorMessage: error.message });
    throw error;
  }
}


// Shipments
export async function getShipments(): Promise<Shipment[]> {
  noStore();
  return readData<Shipment>('shipments.json');
}

export async function getShipmentById(id: string): Promise<Shipment | undefined> {
  noStore();
  const shipments = await getShipments();
  return shipments.find(s => s.id === id);
}

export async function addShipmentAction(data: Omit<Shipment, 'id' | 'lastUpdated'>): Promise<Shipment> {
  try {
    const validatedData = shipmentFormSchema.safeParse(data);
    if (!validatedData.success) {
      const errorMsg = 'Geçersiz malzeme kaydı verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "CREATE", entityType: "Shipment", status: "FAILURE", details: data, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const shipmentTypeDef = await getShipmentTypeDefinitionById(validatedData.data.typeId);
    if (!shipmentTypeDef) {
      const errorMsg = "Geçersiz malzeme kayıt türü ID'si.";
      await logAction({ actionType: "CREATE", entityType: "Shipment", status: "FAILURE", details: data, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }
    if (shipmentTypeDef.requiresSourceDepot && !validatedData.data.sourceDepotId) {
        const errorMsg = `'${shipmentTypeDef.name}' türü için kaynak depo gereklidir.`;
        await logAction({ actionType: "CREATE", entityType: "Shipment", status: "FAILURE", details: data, errorMessage: errorMsg });
        throw new Error(errorMsg);
    }
    if (shipmentTypeDef.requiresDestinationDepot && !validatedData.data.destinationDepotId) {
        const errorMsg = `'${shipmentTypeDef.name}' türü için hedef depo gereklidir.`;
        await logAction({ actionType: "CREATE", entityType: "Shipment", status: "FAILURE", details: data, errorMessage: errorMsg });
        throw new Error(errorMsg);
    }
    if (shipmentTypeDef.requiresSourceDepot && shipmentTypeDef.requiresDestinationDepot && validatedData.data.sourceDepotId === validatedData.data.destinationDepotId) {
        const errorMsg = "Transfer işleminde kaynak ve hedef depo aynı olamaz.";
        await logAction({ actionType: "CREATE", entityType: "Shipment", status: "FAILURE", details: data, errorMessage: errorMsg });
        throw new Error(errorMsg);
    }

    const shipments = await getShipments();
    const newShipment: Shipment = {
      ...validatedData.data,
      id: await generateId(),
      lastUpdated: new Date().toISOString(),
    };
    shipments.push(newShipment);
    await writeData('shipments.json', shipments);
    await logAction({ actionType: "CREATE", entityType: "Shipment", entityId: newShipment.id, status: "SUCCESS", details: newShipment });

    revalidatePath('/shipments');
    revalidatePath('/shipments', 'layout');
    revalidatePath('/inventory/firearms');
    revalidatePath('/inventory/magazines');
    revalidatePath('/inventory/ammunition');
    revalidatePath('/inventory/other-materials');
    revalidatePath('/dashboard');
    return newShipment;
  } catch (error: any) {
    if (error.message.startsWith('Geçersiz malzeme kaydı verisi') ||
        error.message.startsWith('Geçersiz malzeme kayıt türü ID\'si') ||
        error.message.includes('kaynak depo gereklidir') ||
        error.message.includes('hedef depo gereklidir') ||
        error.message.includes('kaynak ve hedef depo aynı olamaz')) throw error;
    await logAction({ actionType: "CREATE", entityType: "Shipment", status: "FAILURE", details: data, errorMessage: error.message });
    throw error;
  }
}

export async function updateShipmentAction(shipment: Shipment): Promise<Shipment> {
  try {
    const validatedData = shipmentFormSchema.safeParse(shipment);
    if (!validatedData.success) {
      const errorMsg = 'Güncelleme için geçersiz malzeme kaydı verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "UPDATE", entityType: "Shipment", entityId: shipment.id, status: "FAILURE", details: shipment, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const shipmentTypeDef = await getShipmentTypeDefinitionById(validatedData.data.typeId);
    if (!shipmentTypeDef) {
      const errorMsg = "Geçersiz malzeme kayıt türü ID'si.";
      await logAction({ actionType: "UPDATE", entityType: "Shipment", entityId: shipment.id, status: "FAILURE", details: shipment, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }
    if (shipmentTypeDef.requiresSourceDepot && !validatedData.data.sourceDepotId) {
        const errorMsg = `'${shipmentTypeDef.name}' türü için kaynak depo gereklidir.`;
        await logAction({ actionType: "UPDATE", entityType: "Shipment", entityId: shipment.id, status: "FAILURE", details: shipment, errorMessage: errorMsg });
        throw new Error(errorMsg);
    }
    if (shipmentTypeDef.requiresDestinationDepot && !validatedData.data.destinationDepotId) {
        const errorMsg = `'${shipmentTypeDef.name}' türü için hedef depo gereklidir.`;
        await logAction({ actionType: "UPDATE", entityType: "Shipment", entityId: shipment.id, status: "FAILURE", details: shipment, errorMessage: errorMsg });
        throw new Error(errorMsg);
    }
     if (shipmentTypeDef.requiresSourceDepot && shipmentTypeDef.requiresDestinationDepot && validatedData.data.sourceDepotId === validatedData.data.destinationDepotId) {
        const errorMsg = "Transfer işleminde kaynak ve hedef depo aynı olamaz.";
        await logAction({ actionType: "UPDATE", entityType: "Shipment", entityId: shipment.id, status: "FAILURE", details: shipment, errorMessage: errorMsg });
        throw new Error(errorMsg);
    }

    let shipments = await getShipments();
    const index = shipments.findIndex(s => s.id === shipment.id);
    if (index === -1) {
      const errorMsg = 'Güncellenecek malzeme kaydı bulunamadı.';
      await logAction({ actionType: "UPDATE", entityType: "Shipment", entityId: shipment.id, status: "FAILURE", details: shipment, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    shipments[index] = {
      ...shipments[index],
      ...validatedData.data,
      lastUpdated: new Date().toISOString(),
    };
    await writeData('shipments.json', shipments);
    await logAction({ actionType: "UPDATE", entityType: "Shipment", entityId: shipments[index].id, status: "SUCCESS", details: shipments[index] });

    revalidatePath('/shipments');
    revalidatePath('/shipments', 'layout');
    revalidatePath(`/shipments/${shipment.id}/edit`);
    revalidatePath('/dashboard');
    return shipments[index];
  } catch (error: any) {
    if (error.message.startsWith('Güncelleme için geçersiz malzeme kaydı verisi') ||
        error.message.startsWith('Geçersiz malzeme kayıt türü ID\'si') ||
        error.message.startsWith('Güncellenecek malzeme kaydı bulunamadı') ||
        error.message.includes('kaynak depo gereklidir') ||
        error.message.includes('hedef depo gereklidir') ||
        error.message.includes('kaynak ve hedef depo aynı olamaz')) throw error;
    await logAction({ actionType: "UPDATE", entityType: "Shipment", entityId: shipment.id, status: "FAILURE", details: shipment, errorMessage: error.message });
    throw error;
  }
}

export async function deleteShipmentAction(id: string): Promise<void> {
  try {
    let shipments = await getShipments();
    shipments = shipments.filter(s => s.id !== id);
    await writeData('shipments.json', shipments);
    await logAction({ actionType: "DELETE", entityType: "Shipment", entityId: id, status: "SUCCESS" });

    revalidatePath('/shipments');
    revalidatePath('/shipments', 'layout');
    revalidatePath('/dashboard');
  } catch (error: any) {
    await logAction({ actionType: "DELETE", entityType: "Shipment", entityId: id, status: "FAILURE", errorMessage: error.message });
    throw error;
  }
}


// Ammunition Daily Usage Logs
export async function getAmmunitionDailyUsageLogs(): Promise<AmmunitionDailyUsageLog[]> {
  noStore();
  const logs = await readData<AmmunitionDailyUsageLog>('ammunition_daily_usage.json');
  return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getAmmunitionDailyUsageLogById(id: string): Promise<AmmunitionDailyUsageLog | undefined> {
  noStore();
  const logs = await getAmmunitionDailyUsageLogs();
  return logs.find(log => log.id === id);
}

export async function addAmmunitionDailyUsageLogAction(data: Omit<AmmunitionDailyUsageLog, 'id'>) {
  try {
    const validatedData = ammunitionDailyUsageFormSchema.safeParse(data);
    if (!validatedData.success) {
      const errorMsg = 'Geçersiz günlük fişek kullanımı verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "CREATE", entityType: "DailyAmmunitionUsage", status: "FAILURE", details: data, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const logs = await getAmmunitionDailyUsageLogs();
    const newLog: AmmunitionDailyUsageLog = {
      ...validatedData.data,
      date: new Date(validatedData.data.date).toISOString(),
      id: await generateId(),
    };
    logs.push(newLog);
    await writeData('ammunition_daily_usage.json', logs);
    await logAction({ actionType: "CREATE", entityType: "DailyAmmunitionUsage", entityId: newLog.id, status: "SUCCESS", details: newLog });

    revalidatePath('/daily-ammo-usage');
    revalidatePath('/daily-ammo-usage', 'layout');
    revalidatePath('/dashboard');
    revalidatePath('/inventory/ammunition');
    revalidatePath('/inventory/ammunition', 'layout');
    return newLog;
  } catch (error: any) {
    if (error.message.startsWith('Geçersiz günlük fişek kullanımı verisi')) throw error;
    await logAction({ actionType: "CREATE", entityType: "DailyAmmunitionUsage", status: "FAILURE", details: data, errorMessage: error.message });
    throw error;
  }
}

export async function updateAmmunitionDailyUsageLogAction(logToUpdate: AmmunitionDailyUsageLog) {
  try {
    const validatedData = ammunitionDailyUsageFormSchema.safeParse(logToUpdate);
    if (!validatedData.success) {
      const errorMsg = 'Güncelleme için geçersiz günlük fişek kullanımı verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "UPDATE", entityType: "DailyAmmunitionUsage", entityId: logToUpdate.id, status: "FAILURE", details: logToUpdate, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    let logs = await getAmmunitionDailyUsageLogs();
    const index = logs.findIndex(l => l.id === logToUpdate.id);
    if (index === -1) {
      const errorMsg = 'Güncellenecek günlük fişek kullanım kaydı bulunamadı.';
      await logAction({ actionType: "UPDATE", entityType: "DailyAmmunitionUsage", entityId: logToUpdate.id, status: "FAILURE", details: logToUpdate, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    logs[index] = {
      ...logs[index],
      ...validatedData.data,
      date: new Date(validatedData.data.date).toISOString(),
    };

    await writeData('ammunition_daily_usage.json', logs);
    await logAction({ actionType: "UPDATE", entityType: "DailyAmmunitionUsage", entityId: logs[index].id, status: "SUCCESS", details: logs[index] });

    revalidatePath('/daily-ammo-usage');
    revalidatePath('/daily-ammo-usage', 'layout');
    revalidatePath(`/daily-ammo-usage/${logToUpdate.id}/edit`);
    revalidatePath('/dashboard');
    revalidatePath('/inventory/ammunition');
    revalidatePath('/inventory/ammunition', 'layout');
    return logs[index];
  } catch (error: any) {
    if (error.message.startsWith('Güncelleme için geçersiz günlük fişek kullanımı verisi') || error.message.startsWith('Güncellenecek günlük fişek kullanım kaydı bulunamadı')) throw error;
    await logAction({ actionType: "UPDATE", entityType: "DailyAmmunitionUsage", entityId: logToUpdate.id, status: "FAILURE", details: logToUpdate, errorMessage: error.message });
    throw error;
  }
}

export async function deleteAmmunitionDailyUsageLogAction(id: string): Promise<void> {
  try {
    let logs = await getAmmunitionDailyUsageLogs();
    logs = logs.filter(log => log.id !== id);
    await writeData('ammunition_daily_usage.json', logs);
    await logAction({ actionType: "DELETE", entityType: "DailyAmmunitionUsage", entityId: id, status: "SUCCESS" });

    revalidatePath('/daily-ammo-usage');
    revalidatePath('/daily-ammo-usage', 'layout');
    revalidatePath('/dashboard');
    revalidatePath('/inventory/ammunition');
    revalidatePath('/inventory/ammunition', 'layout');
  } catch (error: any) {
    await logAction({ actionType: "DELETE", entityType: "DailyAmmunitionUsage", entityId: id, status: "FAILURE", errorMessage: error.message });
    throw error;
  }
}


export interface GroupedDailyUsageLog {
  scenarioId?: string;
  scenarioName: string;
  logs: AmmunitionDailyUsageLog[];
}

export async function getGroupedAmmunitionDailyUsageLogs(): Promise<GroupedDailyUsageLog[]> {
  noStore();
  const allLogs = await getAmmunitionDailyUsageLogs();
  const allScenarios = await getUsageScenarios();

  const scenarioMap = new Map(allScenarios.map(s => [s.id, s.name]));
  const logsByScenario: Record<string, AmmunitionDailyUsageLog[]> = {};
  const logsWithoutScenario: AmmunitionDailyUsageLog[] = [];

  for (const log of allLogs) {
    if (log.usageScenarioId && scenarioMap.has(log.usageScenarioId)) {
      if (!logsByScenario[log.usageScenarioId]) {
        logsByScenario[log.usageScenarioId] = [];
      }
      logsByScenario[log.usageScenarioId].push(log);
    } else {
      logsWithoutScenario.push(log);
    }
  }

  const groupedResult: GroupedDailyUsageLog[] = [];

  for (const scenario of allScenarios) {
    if (logsByScenario[scenario.id] && logsByScenario[scenario.id].length > 0) {
         groupedResult.push({
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            logs: logsByScenario[scenario.id].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        });
    } else {
         groupedResult.push({
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            logs: [],
        });
    }
  }

  if (logsWithoutScenario.length > 0) {
    groupedResult.push({
      scenarioName: "Senaryo Belirtilmeyen Kullanımlar",
      logs: logsWithoutScenario.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    });
  }

  return groupedResult;
}

export async function exportGroupedDailyUsageToCsvAction(): Promise<string> {
  noStore();
  const groupedLogs = await getGroupedAmmunitionDailyUsageLogs();
  if (groupedLogs.length === 0) {
    return "";
  }

  const headers = [
    "Senaryo Adı",
    "Tarih",
    "Kişi Sayısı",
    "Kullanılan 9x19mm",
    "Kullanılan 5.56x45mm",
    "Kullanılan 7.62x39mm",
    "Kullanılan 7.62x51mm",
    "Notlar"
  ];

  const escapeCsvField = (field: any): string => {
    if (field === null || field === undefined) return "";
    let strField = String(field);
    strField = strField.replace(/"/g, '""'); // Escape double quotes
    if (strField.includes(';') || strField.includes('"') || strField.includes('\n') || strField.includes('\r')) {
      return `"${strField}"`;
    }
    return strField;
  };

  const rows: string[] = [];
  groupedLogs.forEach(group => {
    group.logs.forEach(log => {
      rows.push(
        [
          escapeCsvField(group.scenarioName),
          escapeCsvField(format(parseISO(log.date), "dd.MM.yyyy", { locale: tr })),
          escapeCsvField(log.personnelCount),
          escapeCsvField(log.used_9x19mm),
          escapeCsvField(log.used_5_56x45mm),
          escapeCsvField(log.used_7_62x39mm),
          escapeCsvField(log.used_7_62x51mm),
          escapeCsvField(log.notes)
        ].join(';')
      );
    });
  });

  return [headers.join(';'), ...rows].join('\n');
}

export interface MonthlyUsageDataPoint {
  month: string;
  [scenarioName: string]: number | string;
}

export async function getMonthlyScenarioUsageForChart(): Promise<MonthlyUsageDataPoint[]> {
  noStore();
  const dailyLogs = await getAmmunitionDailyUsageLogs();
  const scenarios = await getUsageScenarios();
  const scenarioMap = new Map(scenarios.map(s => [s.id, s.name]));

  const monthlyData: Record<string, Record<string, number>> = {};

  dailyLogs.forEach(log => {
    const date = parseISO(log.date);
    const monthYearKey = format(date, "yyyy-MM");
    const monthDisplay = format(date, "MMMM yyyy", { locale: tr });

    if (!monthlyData[monthYearKey]) {
      monthlyData[monthYearKey] = { monthDisplay: monthDisplay as any }; // Store display month name, temp 'any'
    }

    const scenarioName = log.usageScenarioId ? scenarioMap.get(log.usageScenarioId) || "Bilinmeyen Senaryo" : "Senaryo Belirtilmeyen";

    const totalUsedInLog =
      (log.used_9x19mm || 0) +
      (log.used_5_56x45mm || 0) +
      (log.used_7_62x39mm || 0) +
      (log.used_7_62x51mm || 0);

    monthlyData[monthYearKey][scenarioName] = (monthlyData[monthYearKey][scenarioName] || 0) + totalUsedInLog;
  });

  const chartData: MonthlyUsageDataPoint[] = Object.keys(monthlyData)
    .sort()
    .map(monthYearKey => {
      const dataForMonth = monthlyData[monthYearKey];
      const { monthDisplay, ...scenarioUsages } = dataForMonth;
      return {
        month: monthDisplay as string,
        ...scenarioUsages,
      };
    });

  return chartData;
}


// Usage Scenarios
export async function getUsageScenarios(): Promise<UsageScenario[]> {
  noStore();
  return readData<UsageScenario>('usage_scenarios.json');
}

export async function getUsageScenarioById(id: string): Promise<UsageScenario | undefined> {
  noStore();
  const scenarios = await getUsageScenarios();
  return scenarios.find(s => s.id === id);
}

export async function addUsageScenarioAction(data: Omit<UsageScenario, 'id' | 'lastUpdated'>) {
  try {
    const validatedData = usageScenarioFormSchema.safeParse(data);
    if (!validatedData.success) {
      const errorMsg = 'Geçersiz kullanım senaryosu verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "CREATE", entityType: "UsageScenario", status: "FAILURE", details: data, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const scenarios = await getUsageScenarios();
    const newScenario: UsageScenario = {
      ...validatedData.data,
      id: await generateId(),
      lastUpdated: new Date().toISOString(),
    };
    scenarios.push(newScenario);
    await writeData('usage_scenarios.json', scenarios);
    await logAction({ actionType: "CREATE", entityType: "UsageScenario", entityId: newScenario.id, status: "SUCCESS", details: newScenario });

    revalidatePath('/admin/usage-scenarios');
    revalidatePath('/admin/usage-scenarios', 'layout');
    return newScenario;
  } catch (error: any) {
    if (error.message.startsWith('Geçersiz kullanım senaryosu verisi')) throw error;
    await logAction({ actionType: "CREATE", entityType: "UsageScenario", status: "FAILURE", details: data, errorMessage: error.message });
    throw error;
  }
}

export async function updateUsageScenarioAction(scenario: UsageScenario) {
  try {
    const parsedRates = scenario.consumptionRatesPerCaliber.map(rate => ({
      ...rate,
      roundsPerPerson: typeof rate.roundsPerPerson === 'string' ? parseInt(rate.roundsPerPerson, 10) : rate.roundsPerPerson,
    }));

    const validatedData = usageScenarioFormSchema.safeParse({
      name: scenario.name,
      description: scenario.description,
      consumptionRatesPerCaliber: parsedRates,
    });

    if (!validatedData.success) {
      const errorMsg = 'Güncelleme için geçersiz kullanım senaryosu verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "UPDATE", entityType: "UsageScenario", entityId: scenario.id, status: "FAILURE", details: scenario, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    let scenarios = await getUsageScenarios();
    const index = scenarios.findIndex(s => s.id === scenario.id);
    if (index === -1) {
      const errorMsg = 'Güncellenecek kullanım senaryosu bulunamadı.';
      await logAction({ actionType: "UPDATE", entityType: "UsageScenario", entityId: scenario.id, status: "FAILURE", details: scenario, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const updatedScenario = {
      ...scenarios[index],
      ...validatedData.data,
      lastUpdated: new Date().toISOString(),
    };

    scenarios[index] = updatedScenario;
    await writeData('usage_scenarios.json', scenarios);
    await logAction({ actionType: "UPDATE", entityType: "UsageScenario", entityId: updatedScenario.id, status: "SUCCESS", details: updatedScenario });

    revalidatePath('/admin/usage-scenarios');
    revalidatePath('/admin/usage-scenarios', 'layout');
    revalidatePath(`/admin/usage-scenarios/${scenario.id}/edit`);
    return updatedScenario;
  } catch (error: any) {
    if (error.message.startsWith('Güncelleme için geçersiz kullanım senaryosu verisi') || error.message.startsWith('Güncellenecek kullanım senaryosu bulunamadı')) throw error;
    await logAction({ actionType: "UPDATE", entityType: "UsageScenario", entityId: scenario.id, status: "FAILURE", details: scenario, errorMessage: error.message });
    throw error;
  }
}

export async function deleteUsageScenarioAction(id: string): Promise<void> {
  try {
    let scenarios = await getUsageScenarios();
    const dailyUsages = await getAmmunitionDailyUsageLogs();
    if (dailyUsages.some(usage => usage.usageScenarioId === id)) {
      const errorMsg = "Bu kullanım senaryosunu kullanan günlük fişek kullanım kayıtları mevcut. Önce bu kayıtları silin veya farklı bir senaryoya taşıyın.";
      await logAction({ actionType: "DELETE", entityType: "UsageScenario", entityId: id, status: "FAILURE", errorMessage: errorMsg });
      throw new Error(errorMsg);
    }
    scenarios = scenarios.filter(s => s.id !== id);
    await writeData('usage_scenarios.json', scenarios);
    await logAction({ actionType: "DELETE", entityType: "UsageScenario", entityId: id, status: "SUCCESS" });

    revalidatePath('/admin/usage-scenarios');
    revalidatePath('/admin/usage-scenarios', 'layout');
  } catch (error: any) {
    if (error.message.startsWith('Bu kullanım senaryosunu kullanan günlük fişek kullanım kayıtları mevcut')) throw error;
    await logAction({ actionType: "DELETE", entityType: "UsageScenario", entityId: id, status: "FAILURE", errorMessage: error.message });
    throw error;
  }
}


// Depot Definitions
export async function getDepots(): Promise<Depot[]> {
  noStore();
  return readData<Depot>('depots.json');
}

export async function getDepotById(id: string): Promise<Depot | undefined> {
  noStore();
  const depots = await getDepots();
  return depots.find(d => d.id === id);
}

export async function addDepotAction(data: Omit<Depot, 'lastUpdated'> & {id: string}) {
  try {
    const validatedData = depotFormSchema.safeParse(data);
    if (!validatedData.success) {
      const errorMsg = 'Geçersiz depo verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "CREATE", entityType: "Depot", status: "FAILURE", details: data, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const depots = await getDepots();
    if (depots.some(d => d.id === validatedData.data.id)) {
        const errorMsg = 'Bu ID ile bir depo zaten mevcut.';
        await logAction({ actionType: "CREATE", entityType: "Depot", status: "FAILURE", details: data, errorMessage: errorMsg });
        throw new Error(errorMsg);
    }

    const newDepot: Depot = {
      ...validatedData.data,
      lastUpdated: new Date().toISOString(),
    };
    depots.push(newDepot);
    await writeData('depots.json', depots);
    await logAction({ actionType: "CREATE", entityType: "Depot", entityId: newDepot.id, status: "SUCCESS", details: newDepot });

    revalidatePath('/admin/depots');
    revalidatePath('/admin/depots', 'layout');
    return newDepot;
  } catch (error: any) {
    if (error.message.startsWith('Geçersiz depo verisi') || error.message.startsWith('Bu ID ile bir depo zaten mevcut')) throw error;
    await logAction({ actionType: "CREATE", entityType: "Depot", status: "FAILURE", details: data, errorMessage: error.message });
    throw error;
  }
}

export async function updateDepotAction(depot: Depot) {
  try {
    const { id, lastUpdated, ...updateData } = depot;
    const validatedData = depotFormSchema.omit({id: true}).safeParse(updateData);

    if (!validatedData.success) {
      const errorMsg = 'Güncelleme için geçersiz depo verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "UPDATE", entityType: "Depot", entityId: depot.id, status: "FAILURE", details: depot, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    let depots = await getDepots();
    const index = depots.findIndex(d => d.id === id);
    if (index === -1) {
      const errorMsg = 'Güncellenecek depo bulunamadı.';
      await logAction({ actionType: "UPDATE", entityType: "Depot", entityId: depot.id, status: "FAILURE", details: depot, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const updatedDepot: Depot = {
      ...depots[index],
      ...validatedData.data,
      lastUpdated: new Date().toISOString(),
    };

    depots[index] = updatedDepot;
    await writeData('depots.json', depots);
    await logAction({ actionType: "UPDATE", entityType: "Depot", entityId: updatedDepot.id, status: "SUCCESS", details: updatedDepot });

    revalidatePath('/admin/depots');
    revalidatePath('/admin/depots', 'layout');
    revalidatePath(`/admin/depots/${id}/edit`);
    return updatedDepot;
  } catch (error: any) {
    if (error.message.startsWith('Güncelleme için geçersiz depo verisi') || error.message.startsWith('Güncellenecek depo bulunamadı')) throw error;
    await logAction({ actionType: "UPDATE", entityType: "Depot", entityId: depot.id, status: "FAILURE", details: depot, errorMessage: error.message });
    throw error;
  }
}

export async function deleteDepotAction(id: string): Promise<void> {
  try {
    let depots = await getDepots();
    const firearms = await getFirearms();
    if (firearms.some(f => f.depotId === id)) {
      throw new Error("Bu depo, silah envanterinde kullanılıyor.");
    }
    const magazines = await getMagazines();
    if (magazines.some(m => m.depotId === id)) {
      throw new Error("Bu depo, şarjör envanterinde kullanılıyor.");
    }
    const ammunition = await getAmmunition();
    if (ammunition.some(a => a.depotId === id)) {
      throw new Error("Bu depo, mühimmat envanterinde kullanılıyor.");
    }
    const shipments = await getShipments();
    if (shipments.some(s => s.sourceDepotId === id || s.destinationDepotId === id)) {
      throw new Error("Bu depo, malzeme kayıtlarında (sevkiyatlarda) kullanılıyor.");
    }
    const otherMaterials = await getOtherMaterials();
    if (otherMaterials.some(o => o.depotId === id)) {
        throw new Error("Bu depo, diğer malzemeler envanterinde kullanılıyor.");
    }

    depots = depots.filter(d => d.id !== id);
    await writeData('depots.json', depots);
    await logAction({ actionType: "DELETE", entityType: "Depot", entityId: id, status: "SUCCESS" });

    revalidatePath('/admin/depots');
    revalidatePath('/admin/depots', 'layout');
  } catch (error: any) {
     if (error.message.startsWith('Bu depo,')) {
      await logAction({ actionType: "DELETE", entityType: "Depot", entityId: id, status: "FAILURE", errorMessage: error.message });
      throw error;
    }
    await logAction({ actionType: "DELETE", entityType: "Depot", entityId: id, status: "FAILURE", errorMessage: error.message });
    throw error;
  }
}

// Maintenance Logs
export async function addMaintenanceLogToItemAction(
  itemId: string,
  itemType: 'firearm' | 'magazine' | 'other',
  logData: Omit<MaintenanceLog, 'id'>
) {
  let logEntryId: string | undefined = undefined;
  let parentItemDisplayIdentifier = itemId; // Fallback

  try {
    if (itemType === 'firearm') {
      const firearmsList = await getFirearms();
      const itemForLog = firearmsList.find(f => f.id === itemId);
      if (itemForLog) parentItemDisplayIdentifier = `${itemForLog.name} (SN: ${itemForLog.serialNumber || 'N/A'})`;
      else parentItemDisplayIdentifier = `Silah (ID: ${itemId})`;
    } else if (itemType === 'magazine') {
      const magazinesList = await getMagazines();
      const itemForLog = magazinesList.find(m => m.id === itemId);
      if (itemForLog) parentItemDisplayIdentifier = `${itemForLog.name} (${itemForLog.caliber})`;
      else parentItemDisplayIdentifier = `Şarjör (ID: ${itemId})`;
    } else if (itemType === 'other') {
      const otherMaterialsList = await getOtherMaterials();
      const itemForLog = otherMaterialsList.find(o => o.id === itemId);
      if (itemForLog) parentItemDisplayIdentifier = itemForLog.name;
      else parentItemDisplayIdentifier = `Diğer Malzeme (ID: ${itemId})`;
    }

    const validatedData = maintenanceLogFormSchema.safeParse({
        itemId, itemType, ...logData
    });
    if(!validatedData.success) {
        const errorMsg = 'Bakım kaydı için geçersiz veri: ' + JSON.stringify(validatedData.error.format());
        await logAction({ actionType: "LOG_MAINTENANCE", entityType: "MaintenanceLog", entityId: itemId, status: "FAILURE", details: {...logData, parentItemIdentifier, parentItemType: itemType}, errorMessage: errorMsg });
        throw new Error(errorMsg);
    }

    const newLog: MaintenanceLog = {
      date: validatedData.data.date,
      description: validatedData.data.description,
      statusChangeFrom: validatedData.data.statusChangeFrom as MaintenanceItemStatus,
      statusChangeTo: validatedData.data.statusChangeTo as MaintenanceItemStatus,
      technician: validatedData.data.technician,
      partsUsed: validatedData.data.partsUsed,
      id: await generateId(),
    };
    logEntryId = newLog.id;

    if (itemType === 'firearm') {
      const firearms = await getFirearms();
      const itemIndex = firearms.findIndex(f => f.id === itemId);
      if (itemIndex === -1) {
        const errorMsg = 'Bakım yapılacak silah bulunamadı.';
        await logAction({ actionType: "LOG_MAINTENANCE", entityType: "MaintenanceLog", entityId: itemId, status: "FAILURE", details: {...logData, parentItemIdentifier, parentItemType: itemType}, errorMessage: errorMsg });
        throw new Error(errorMsg);
      }

      firearms[itemIndex].maintenanceHistory = [...(firearms[itemIndex].maintenanceHistory || []), newLog];
      firearms[itemIndex].status = newLog.statusChangeTo as FirearmStatus;
      firearms[itemIndex].lastUpdated = new Date().toISOString();
      await writeData('firearms.json', firearms);
      await logAction({ actionType: "UPDATE", entityType: "Firearm", entityId: itemId, status: "SUCCESS", details: { status: newLog.statusChangeTo, maintenanceLogAdded: newLog.id, parentItemIdentifier } });

    } else if (itemType === 'magazine') {
      const magazines = await getMagazines();
      const itemIndex = magazines.findIndex(m => m.id === itemId);
      if (itemIndex === -1) {
        const errorMsg = 'Bakım yapılacak şarjör bulunamadı.';
        await logAction({ actionType: "LOG_MAINTENANCE", entityType: "MaintenanceLog", entityId: itemId, status: "FAILURE", details: {...logData, parentItemIdentifier, parentItemType: itemType}, errorMessage: errorMsg });
        throw new Error(errorMsg);
      }

      magazines[itemIndex].maintenanceHistory = [...(magazines[itemIndex].maintenanceHistory || []), newLog];
      magazines[itemIndex].status = newLog.statusChangeTo as MagazineStatus;
      magazines[itemIndex].lastUpdated = new Date().toISOString();
      await writeData('magazines.json', magazines);
      await logAction({ actionType: "UPDATE", entityType: "Magazine", entityId: itemId, status: "SUCCESS", details: { status: newLog.statusChangeTo, maintenanceLogAdded: newLog.id, parentItemIdentifier } });
    } else if (itemType === 'other') {
        const otherMaterials = await getOtherMaterials();
        const itemIndex = otherMaterials.findIndex(o => o.id === itemId);
        if (itemIndex === -1) {
          const errorMsg = 'Bakım yapılacak diğer malzeme bulunamadı.';
          await logAction({ actionType: "LOG_MAINTENANCE", entityType: "MaintenanceLog", entityId: itemId, status: "FAILURE", details: {...logData, parentItemIdentifier, parentItemType: itemType}, errorMessage: errorMsg });
          throw new Error(errorMsg);
        }
        otherMaterials[itemIndex].maintenanceHistory = [...(otherMaterials[itemIndex].maintenanceHistory || []), newLog];
        otherMaterials[itemIndex].status = newLog.statusChangeTo as OtherMaterialStatus;
        otherMaterials[itemIndex].lastUpdated = new Date().toISOString();
        await writeData('other_materials.json', otherMaterials);
        await logAction({ actionType: "UPDATE", entityType: "OtherMaterial", entityId: itemId, status: "SUCCESS", details: { status: newLog.statusChangeTo, maintenanceLogAdded: newLog.id, parentItemIdentifier } });
    } else {
      const errorMsg = 'Geçersiz öğe türü.';
      await logAction({ actionType: "LOG_MAINTENANCE", entityType: "MaintenanceLog", entityId: itemId, status: "FAILURE", details: {...logData, parentItemIdentifier, parentItemType: itemType}, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    await logAction({ actionType: "CREATE", entityType: "MaintenanceLog", entityId: newLog.id, status: "SUCCESS", details: { ...newLog, parentItemIdentifier, parentItemType: itemType } });

    revalidatePath(`/inventory/${itemType === 'other' ? 'other-materials' : itemType + 's'}/${itemId}`);
    revalidatePath(`/inventory/${itemType === 'other' ? 'other-materials' : itemType + 's'}`);
    revalidatePath(`/inventory/${itemType === 'other' ? 'other-materials' : itemType + 's'}`, 'layout');
    revalidatePath('/maintenance');
    revalidatePath('/maintenance', 'layout');
    revalidatePath('/dashboard');
    return newLog;
  } catch (error: any) {
     if (error.message.startsWith('Bakım kaydı için geçersiz veri') ||
        error.message.includes('bulunamadı') ||
        error.message.startsWith('Geçersiz öğe türü')) throw error;
    await logAction({ actionType: "LOG_MAINTENANCE", entityType: "MaintenanceLog", entityId: logEntryId || itemId, status: "FAILURE", details: {...logData, itemId, itemType, parentItemIdentifier}, errorMessage: error.message });
    throw error;
  }
}

export async function deleteMaintenanceLogAction(parentItemId: string, parentItemType: InventoryItemType, logId: string): Promise<void> {
  let parentItemDisplayIdentifier = parentItemId;
  try {
    if (parentItemType === 'firearm') {
      const firearms = await getFirearms();
      const itemIndex = firearms.findIndex(f => f.id === parentItemId);
      if (itemIndex === -1) throw new Error('Silah bulunamadı.');
      firearms[itemIndex].maintenanceHistory = (firearms[itemIndex].maintenanceHistory || []).filter(log => log.id !== logId);
      firearms[itemIndex].lastUpdated = new Date().toISOString();
      parentItemDisplayIdentifier = `${firearms[itemIndex].name} (SN: ${firearms[itemIndex].serialNumber || 'N/A'})`;
      await writeData('firearms.json', firearms);
    } else if (parentItemType === 'magazine') {
      const magazines = await getMagazines();
      const itemIndex = magazines.findIndex(m => m.id === parentItemId);
      if (itemIndex === -1) throw new Error('Şarjör bulunamadı.');
      magazines[itemIndex].maintenanceHistory = (magazines[itemIndex].maintenanceHistory || []).filter(log => log.id !== logId);
      magazines[itemIndex].lastUpdated = new Date().toISOString();
      parentItemDisplayIdentifier = `${magazines[itemIndex].name} (${magazines[itemIndex].caliber})`;
      await writeData('magazines.json', magazines);
    } else if (parentItemType === 'other') {
      const otherMaterials = await getOtherMaterials();
      const itemIndex = otherMaterials.findIndex(o => o.id === parentItemId);
      if (itemIndex === -1) throw new Error('Diğer malzeme bulunamadı.');
      otherMaterials[itemIndex].maintenanceHistory = (otherMaterials[itemIndex].maintenanceHistory || []).filter(log => log.id !== logId);
      otherMaterials[itemIndex].lastUpdated = new Date().toISOString();
      parentItemDisplayIdentifier = otherMaterials[itemIndex].name;
      await writeData('other_materials.json', otherMaterials);
    } else {
      throw new Error('Geçersiz öğe türü.');
    }

    await logAction({ actionType: "DELETE", entityType: "MaintenanceLog", entityId: logId, status: "SUCCESS", details: { parentItemId, parentItemType, parentItemIdentifier: parentItemDisplayIdentifier } });

    revalidatePath(`/inventory/${parentItemType === 'other' ? 'other-materials' : parentItemType + 's'}/${parentItemId}`);
    revalidatePath(`/inventory/${parentItemType === 'other' ? 'other-materials' : parentItemType + 's'}`);
    revalidatePath('/maintenance');
    revalidatePath('/dashboard');
  } catch (error: any) {
    await logAction({ actionType: "DELETE", entityType: "MaintenanceLog", entityId: logId, status: "FAILURE", details: { parentItemId, parentItemType, parentItemIdentifier }, errorMessage: error.message });
    throw error;
  }
}


export interface EnrichedMaintenanceLog extends MaintenanceLog {
    parentItemId: string;
    parentItemName: string;
    parentItemType: 'firearm' | 'magazine' | 'other';
    parentItemIdentifier: string; // e.g. Serial number for firearm, name for magazine/other
}

export async function getAllMaintenanceLogs(): Promise<EnrichedMaintenanceLog[]> {
    noStore();
    const allLogs: EnrichedMaintenanceLog[] = [];

    const firearms = await getFirearms();
    firearms.forEach(firearm => {
        if (firearm.maintenanceHistory) {
            firearm.maintenanceHistory.forEach(log => {
                allLogs.push({
                    ...log,
                    parentItemId: firearm.id,
                    parentItemName: firearm.name,
                    parentItemType: 'firearm',
                    parentItemIdentifier: `${firearm.name} (SN: ${firearm.serialNumber || 'N/A'})`,
                });
            });
        }
    });

    const magazines = await getMagazines();
    magazines.forEach(magazine => {
        if (magazine.maintenanceHistory) {
            magazine.maintenanceHistory.forEach(log => {
                allLogs.push({
                    ...log,
                    parentItemId: magazine.id,
                    parentItemName: magazine.name,
                    parentItemType: 'magazine',
                    parentItemIdentifier: `${magazine.name} (${magazine.caliber}, Kap: ${magazine.capacity})`,
                });
            });
        }
    });

    const otherMaterials = await getOtherMaterials();
    otherMaterials.forEach(material => {
        if (material.maintenanceHistory) {
            material.maintenanceHistory.forEach(log => {
                allLogs.push({
                    ...log,
                    parentItemId: material.id,
                    parentItemName: material.name,
                    parentItemType: 'other',
                    parentItemIdentifier: material.name,
                });
            });
        }
    });

    return allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}


// Shipment Type Definitions
export async function getShipmentTypeDefinitions(): Promise<ShipmentTypeDefinition[]> {
  noStore();
  return readData<ShipmentTypeDefinition>('shipment_types.json');
}

export async function getShipmentTypeDefinitionById(id: string): Promise<ShipmentTypeDefinition | undefined> {
  noStore();
  const definitions = await getShipmentTypeDefinitions();
  return definitions.find(d => d.id === id);
}

export async function addShipmentTypeDefinitionAction(data: Omit<ShipmentTypeDefinition, 'id' | 'lastUpdated'>) {
  try {
    // Schema validation for shipmentTypeDefinitionFormSchema should be added if not present
    const definitions = await getShipmentTypeDefinitions();
    const newDefinition: ShipmentTypeDefinition = {
      ...data,
      id: await generateId(),
      lastUpdated: new Date().toISOString(),
    };
    definitions.push(newDefinition);
    await writeData('shipment_types.json', definitions);
    await logAction({ actionType: "CREATE", entityType: "ShipmentTypeDefinition", entityId: newDefinition.id, status: "SUCCESS", details: newDefinition });

    revalidatePath('/admin/shipment-types');
    revalidatePath('/admin/shipment-types', 'layout');
    return newDefinition;
  } catch (error: any) {
    await logAction({ actionType: "CREATE", entityType: "ShipmentTypeDefinition", status: "FAILURE", details: data, errorMessage: error.message });
    throw error;
  }
}

export async function updateShipmentTypeDefinitionAction(definition: ShipmentTypeDefinition) {
  try {
    // Schema validation for shipmentTypeDefinitionFormSchema should be added if not present
    let definitions = await getShipmentTypeDefinitions();
    const index = definitions.findIndex(d => d.id === definition.id);
    if (index === -1) {
      const errorMsg = 'Güncellenecek malzeme kayıt türü bulunamadı.';
      await logAction({ actionType: "UPDATE", entityType: "ShipmentTypeDefinition", entityId: definition.id, status: "FAILURE", details: definition, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const updatedDefinition = {
      ...definitions[index],
      ...definition,
      lastUpdated: new Date().toISOString(),
    };

    definitions[index] = updatedDefinition;
    await writeData('shipment_types.json', definitions);
    await logAction({ actionType: "UPDATE", entityType: "ShipmentTypeDefinition", entityId: updatedDefinition.id, status: "SUCCESS", details: updatedDefinition });

    revalidatePath('/admin/shipment-types');
    revalidatePath('/admin/shipment-types', 'layout');
    revalidatePath(`/admin/shipment-types/${definition.id}/edit`);
    return updatedDefinition;
  } catch (error: any) {
    if (error.message.startsWith('Güncellenecek malzeme kayıt türü bulunamadı')) throw error;
    await logAction({ actionType: "UPDATE", entityType: "ShipmentTypeDefinition", entityId: definition.id, status: "FAILURE", details: definition, errorMessage: error.message });
    throw error;
  }
}

export async function deleteShipmentTypeDefinitionAction(id: string): Promise<void> {
  try {
    let definitions = await getShipmentTypeDefinitions();
    const shipments = await getShipments();
    if (shipments.some(s => s.typeId === id)) {
        const errorMsg = "Bu kayıt türünü kullanan malzeme kayıtları (sevkiyatlar) mevcut. Önce bu kayıtları silin veya farklı bir türe taşıyın.";
        await logAction({ actionType: "DELETE", entityType: "ShipmentTypeDefinition", entityId: id, status: "FAILURE", errorMessage: errorMsg });
        throw new Error(errorMsg);
    }
    definitions = definitions.filter(d => d.id !== id);
    await writeData('shipment_types.json', definitions);
    await logAction({ actionType: "DELETE", entityType: "ShipmentTypeDefinition", entityId: id, status: "SUCCESS" });

    revalidatePath('/admin/shipment-types');
    revalidatePath('/admin/shipment-types', 'layout');
  } catch (error: any) {
    if (error.message.startsWith('Bu kayıt türünü kullanan malzeme kayıtları')) throw error;
    await logAction({ actionType: "DELETE", entityType: "ShipmentTypeDefinition", entityId: id, status: "FAILURE", errorMessage: error.message });
    throw error;
  }
}

// Alert Definitions
export async function getAlertDefinitions(): Promise<AlertDefinition[]> {
  noStore();
  return readData<AlertDefinition>('alert_definitions.json');
}

export async function getAlertDefinitionById(id: string): Promise<AlertDefinition | undefined> {
  noStore();
  const definitions = await getAlertDefinitions();
  return definitions.find(d => d.id === id);
}

export async function addAlertDefinitionAction(data: Omit<AlertDefinition, 'id' | 'lastUpdated'>) {
  try {
    const validatedData = alertDefinitionFormSchema.safeParse(data);
    if (!validatedData.success) {
      const errorMsg = 'Geçersiz uyarı tanımı verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "CREATE", entityType: "AlertDefinition", status: "FAILURE", details: data, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const definitions = await getAlertDefinitions();
    const newDefinition: AlertDefinition = {
      ...validatedData.data,
      id: await generateId(),
      lastUpdated: new Date().toISOString(),
    };
    definitions.push(newDefinition);
    await writeData('alert_definitions.json', definitions);
    await logAction({ actionType: "CREATE", entityType: "AlertDefinition", entityId: newDefinition.id, status: "SUCCESS", details: newDefinition });

    revalidatePath('/admin/alert-definitions');
    revalidatePath('/admin/alert-definitions', 'layout');
    revalidatePath('/alerts');
    revalidatePath('/dashboard');
    return newDefinition;
  } catch (error: any) {
    if (error.message.startsWith('Geçersiz uyarı tanımı verisi')) throw error;
    await logAction({ actionType: "CREATE", entityType: "AlertDefinition", status: "FAILURE", details: data, errorMessage: error.message });
    throw error;
  }
}

export async function updateAlertDefinitionAction(definition: AlertDefinition) {
  try {
    const validatedData = alertDefinitionFormSchema.safeParse(definition);
    if (!validatedData.success) {
      const errorMsg = 'Güncelleme için geçersiz uyarı tanımı verisi: ' + JSON.stringify(validatedData.error.format());
      await logAction({ actionType: "UPDATE", entityType: "AlertDefinition", entityId: definition.id, status: "FAILURE", details: definition, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    let definitions = await getAlertDefinitions();
    const index = definitions.findIndex(d => d.id === definition.id);
    if (index === -1) {
      const errorMsg = 'Güncellenecek uyarı tanımı bulunamadı.';
      await logAction({ actionType: "UPDATE", entityType: "AlertDefinition", entityId: definition.id, status: "FAILURE", details: definition, errorMessage: errorMsg });
      throw new Error(errorMsg);
    }

    const updatedDefinition = {
      ...definitions[index],
      ...validatedData.data,
      lastUpdated: new Date().toISOString(),
    };

    definitions[index] = updatedDefinition;
    await writeData('alert_definitions.json', definitions);
    await logAction({ actionType: "UPDATE", entityType: "AlertDefinition", entityId: updatedDefinition.id, status: "SUCCESS", details: updatedDefinition });

    revalidatePath('/admin/alert-definitions');
    revalidatePath('/admin/alert-definitions', 'layout');
    revalidatePath(`/admin/alert-definitions/${definition.id}/edit`);
    revalidatePath('/alerts');
    revalidatePath('/dashboard');
    return updatedDefinition;
  } catch (error: any) {
     if (error.message.startsWith('Güncelleme için geçersiz uyarı tanımı verisi') || error.message.startsWith('Güncellenecek uyarı tanımı bulunamadı')) throw error;
    await logAction({ actionType: "UPDATE", entityType: "AlertDefinition", entityId: definition.id, status: "FAILURE", details: definition, errorMessage: error.message });
    throw error;
  }
}

export async function deleteAlertDefinitionAction(id: string): Promise<void> {
  try {
    let definitions = await getAlertDefinitions();
    definitions = definitions.filter(d => d.id !== id);
    await writeData('alert_definitions.json', definitions);
    await logAction({ actionType: "DELETE", entityType: "AlertDefinition", entityId: id, status: "SUCCESS" });

    revalidatePath('/admin/alert-definitions');
    revalidatePath('/admin/alert-definitions', 'layout');
    revalidatePath('/alerts');
    revalidatePath('/dashboard');
  } catch (error: any) {
    await logAction({ actionType: "DELETE", entityType: "AlertDefinition", entityId: id, status: "FAILURE", errorMessage: error.message });
    throw error;
  }
}


export async function getTriggeredAlerts(): Promise<ActiveAlert[]> {
  noStore();
  const activeAlerts: ActiveAlert[] = [];
  const now = new Date().toISOString();

  const alertDefinitions = await getAlertDefinitions();
  const allAmmunition = await getAmmunition();
  const allFirearms = await getFirearms();
  const allMagazines = await getMagazines();
  const allDepots = await getDepots();
  const depotMap = new Map(allDepots.map(d => [d.id, d.name]));

  for (const definition of alertDefinitions) {
    if (!definition.isActive) continue;

    if (definition.entityType === 'ammunition' && definition.conditionType === 'low_stock') {
      if (definition.thresholdValue === undefined || definition.thresholdValue < 0) continue;

      let relevantAmmunition = allAmmunition;
      if (definition.depotId) {
        relevantAmmunition = relevantAmmunition.filter(a => a.depotId === definition.depotId);
      }
      if (definition.caliberFilter) {
        relevantAmmunition = relevantAmmunition.filter(a => a.caliber === definition.caliberFilter);
      }

      const currentStock = relevantAmmunition.reduce((sum, ammo) => sum + ammo.quantity, 0);

      if (currentStock <= definition.thresholdValue) {
        const depotNameString = definition.depotId ? (depotMap.get(definition.depotId) || definition.depotId) : "Tüm Depolar";
        
        let itemNameDisplay = "";
        if (definition.caliberFilter) {
          itemNameDisplay = `${definition.caliberFilter} Mühimmat`;
        } else {
          itemNameDisplay = `Genel Mühimmat Stokları`;
        }

        if (definition.depotId && depotNameString !== "Tüm Depolar") {
            itemNameDisplay += ` (${depotNameString})`;
        } else if (!definition.depotId) {
             itemNameDisplay += ` (Tüm Depolar)`;
        }

        const context: TriggeredAlertContext = {
          itemName: itemNameDisplay,
          itemDepotName: depotNameString,
          currentValue: currentStock,
          thresholdValue: definition.thresholdValue,
          caliber: definition.caliberFilter,
        };
        activeAlerts.push({
          definition,
          context,
          triggeredAt: now,
          uniqueId: `${definition.id}-${definition.depotId || 'all_depots'}-${definition.caliberFilter || 'all_calibers'}`,
        });
      }
    } else if (definition.entityType === 'firearm' && definition.conditionType === 'status_is') {
      if (!definition.statusFilter) continue;
      const relevantFirearms = allFirearms.filter(f => f.status === definition.statusFilter);
      
      for (const firearm of relevantFirearms) {
        const context: TriggeredAlertContext = {
          itemName: firearm.name,
          serialNumber: firearm.serialNumber,
          itemDepotName: depotMap.get(firearm.depotId) || firearm.depotId,
          currentValue: firearm.status,
          caliber: firearm.caliber,
          itemId: firearm.id,
        };
        activeAlerts.push({
          definition,
          context,
          triggeredAt: now,
          uniqueId: `${definition.id}-${firearm.id}`,
        });
      }
    } else if (definition.entityType === 'magazine' && definition.conditionType === 'status_is') {
      if (!definition.statusFilter) continue;
      const relevantMagazines = allMagazines.filter(m => m.status === definition.statusFilter);

      for (const magazine of relevantMagazines) {
         const context: TriggeredAlertContext = {
          itemName: magazine.name,
          serialNumber: magazine.serialNumber,
          itemDepotName: depotMap.get(magazine.depotId) || magazine.depotId,
          currentValue: magazine.status,
          caliber: magazine.caliber,
          itemId: magazine.id,
        };
        activeAlerts.push({
          definition,
          context,
          triggeredAt: now,
          uniqueId: `${definition.id}-${magazine.id}`,
        });
      }
    }
  }
  const severityOrder: Record<AlertSeverity, number> = { 'Yüksek': 1, 'Orta': 2, 'Düşük': 3 };
  return activeAlerts.sort((a, b) => {
    const severityDiff = severityOrder[a.definition.severity] - severityOrder[b.definition.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime();
  });
}


// Audit Log Actions
export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  noStore();
  try {
    const allLogs = await readData<AuditLogEntry>('audit_log.json');
    return allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error("Denetim günlükleri okunurken hata oluştu:", error);
    return [];
  }
}

export async function getRecentAuditLogs(limit: number = 5): Promise<AuditLogEntry[]> {
  noStore();
  try {
    const allLogs = await getAuditLogs();
    return allLogs.slice(0, limit);
  } catch (error) {
    console.error("Son denetim günlükleri okunurken hata oluştu:", error);
    return [];
  }
}
