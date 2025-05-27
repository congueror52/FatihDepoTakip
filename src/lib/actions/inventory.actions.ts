
'use server';

import { revalidatePath } from 'next/cache';
import type { Firearm, Magazine, Ammunition, Shipment, AmmunitionUsageLog, DepotInventorySnapshot, HistoricalUsageSnapshot, UpcomingRequirementsSnapshot, FirearmDefinition, AmmunitionDailyUsageLog } from '@/types/inventory';
import { readData, writeData, generateId } from '@/lib/data-utils';
import { firearmFormSchema } from '@/app/(app)/inventory/firearms/_components/firearm-form-schema';
import { firearmDefinitionFormSchema } from '@/app/(app)/admin/firearms-definitions/_components/firearm-definition-form-schema';
import { ammunitionDailyUsageFormSchema } from '@/app/(app)/daily-ammo-usage/_components/usage-log-form-schema';
import { suggestRebalancing as suggestRebalancingAI } from '@/ai/flows/suggest-rebalancing';

// Firearm Definitions
export async function getFirearmDefinitions(): Promise<FirearmDefinition[]> {
  return readData<FirearmDefinition>('firearm_definitions.json');
}

export async function getFirearmDefinitionById(id: string): Promise<FirearmDefinition | undefined> {
  const definitions = await getFirearmDefinitions();
  return definitions.find(d => d.id === id);
}

export async function addFirearmDefinitionAction(data: Omit<FirearmDefinition, 'id' | 'lastUpdated'>) {
  const validatedData = firearmDefinitionFormSchema.safeParse(data);
  if (!validatedData.success) {
    throw new Error('Geçersiz silah tanımı verisi: ' + JSON.stringify(validatedData.error.format()));
  }
  
  const definitions = await getFirearmDefinitions();
  const newDefinition: FirearmDefinition = {
    ...validatedData.data,
    id: await generateId(),
    lastUpdated: new Date().toISOString(),
  };
  definitions.push(newDefinition);
  await writeData('firearm_definitions.json', definitions);
  revalidatePath('/admin/firearms-definitions');
  return newDefinition;
}

export async function updateFirearmDefinitionAction(definition: FirearmDefinition) {
  const validatedData = firearmDefinitionFormSchema.safeParse(definition);
   if (!validatedData.success) {
    console.error("Doğrulama hataları:", validatedData.error.format());
    throw new Error('Güncelleme için geçersiz silah tanımı verisi.');
  }

  let definitions = await getFirearmDefinitions();
  const index = definitions.findIndex(d => d.id === definition.id);
  if (index === -1) {
    throw new Error('Güncellenecek silah tanımı bulunamadı.');
  }
  
  const updatedDefinition = {
    ...definitions[index],
    ...validatedData.data,
    lastUpdated: new Date().toISOString(),
  };

  definitions[index] = updatedDefinition;
  await writeData('firearm_definitions.json', definitions);
  revalidatePath('/admin/firearms-definitions');
  revalidatePath(`/admin/firearms-definitions/${definition.id}/edit`);
  return updatedDefinition;
}

export async function deleteFirearmDefinitionAction(id: string): Promise<void> {
  let definitions = await getFirearmDefinitions();
  // TODO: Check if any firearm instance uses this definition before deleting.
  // For now, direct deletion.
  definitions = definitions.filter(d => d.id !== id);
  await writeData('firearm_definitions.json', definitions);
  revalidatePath('/admin/firearms-definitions');
}


// Firearms (Instances)
export async function getFirearms(): Promise<Firearm[]> {
  return readData<Firearm>('firearms.json');
}

export async function getFirearmById(id: string): Promise<Firearm | undefined> {
  const firearms = await getFirearms();
  return firearms.find(f => f.id === id);
}

export async function addFirearmAction(data: Omit<Firearm, 'id' | 'lastUpdated' | 'itemType' | 'maintenanceHistory' | 'name' | 'model' | 'manufacturer' | 'caliber'> & { definitionId: string }) {
  const validatedData = firearmFormSchema.safeParse(data);
  if (!validatedData.success) {
    throw new Error('Geçersiz ateşli silah verisi: ' + JSON.stringify(validatedData.error.format()));
  }

  const definition = await getFirearmDefinitionById(validatedData.data.definitionId);
  if (!definition) {
    throw new Error('Geçersiz silah tanım IDsi.');
  }
  
  const firearms = await getFirearms();
  const newFirearm: Firearm = {
    ...validatedData.data,
    id: await generateId(),
    itemType: 'firearm',
    name: definition.name, // Copied from definition
    model: definition.model, // Copied from definition
    manufacturer: definition.manufacturer, // Copied from definition
    caliber: definition.caliber, // Copied from definition
    lastUpdated: new Date().toISOString(),
    maintenanceHistory: []
  };
  firearms.push(newFirearm);
  await writeData('firearms.json', firearms);
  revalidatePath('/inventory/firearms');
  revalidatePath('/dashboard');
  return newFirearm;
}

export async function updateFirearmAction(firearm: Firearm) {
   // For update, we assume definitionId, name, model, manufacturer, caliber are not changed via this form
   // Only instance-specific fields are updated.
  const validatedData = firearmFormSchema.safeParse({
    definitionId: firearm.definitionId, // Keep existing
    serialNumber: firearm.serialNumber,
    depotId: firearm.depotId,
    status: firearm.status,
    purchaseDate: firearm.purchaseDate,
    notes: firearm.notes,
  });

  if (!validatedData.success) {
    console.error("Doğrulama hataları:", validatedData.error.format());
    throw new Error('Güncelleme için geçersiz ateşli silah verisi.');
  }

  let firearms = await getFirearms();
  const index = firearms.findIndex(f => f.id === firearm.id);
  if (index === -1) {
    throw new Error('Güncellenecek ateşli silah bulunamadı.');
  }
  
  const currentFirearm = firearms[index];
  const updatedFirearm: Firearm = {
    ...currentFirearm, // Keep existing fields like id, itemType, name, model, manufacturer, caliber, maintenanceHistory
    ...validatedData.data, // Apply validated updates for instance-specific fields
    lastUpdated: new Date().toISOString(),
  };

  firearms[index] = updatedFirearm;
  await writeData('firearms.json', firearms);
  revalidatePath('/inventory/firearms');
  revalidatePath(`/inventory/firearms/${firearm.id}`);
  revalidatePath('/dashboard');
  return updatedFirearm;
}

export async function deleteFirearmAction(id: string): Promise<void> {
  let firearms = await getFirearms();
  firearms = firearms.filter(f => f.id !== id);
  await writeData('firearms.json', firearms);
  revalidatePath('/inventory/firearms');
  revalidatePath('/dashboard');
}

// Magazines (Stubs - implement similarly to Firearms)
export async function getMagazines(): Promise<Magazine[]> {
  return readData<Magazine>('magazines.json');
}
export async function addMagazineAction(data: Omit<Magazine, 'id' | 'lastUpdated' | 'itemType' | 'maintenanceHistory'>): Promise<Magazine> {
  // Basic implementation, add validation later
  const magazines = await getMagazines();
  const newMagazine: Magazine = {
    ...(data as any), // Add proper type assertion or mapping
    id: await generateId(),
    itemType: 'magazine',
    lastUpdated: new Date().toISOString(),
    maintenanceHistory: [],
  };
  magazines.push(newMagazine);
  await writeData('magazines.json', magazines);
  revalidatePath('/inventory/magazines');
  revalidatePath('/dashboard');
  return newMagazine;
}

// Ammunition (Stubs - implement similarly)
export async function getAmmunition(): Promise<Ammunition[]> {
  return readData<Ammunition>('ammunition.json');
}
export async function addAmmunitionAction(data: Omit<Ammunition, 'id' | 'lastUpdated' | 'itemType'>): Promise<Ammunition> {
  // Basic implementation, add validation later
  const ammunition = await getAmmunition();
  const newAmmunition: Ammunition = {
    ...(data as any), // Add proper type assertion or mapping
    id: await generateId(),
    itemType: 'ammunition',
    lastUpdated: new Date().toISOString(),
  };
  ammunition.push(newAmmunition);
  await writeData('ammunition.json', ammunition);
  revalidatePath('/inventory/ammunition');
  revalidatePath('/dashboard');
  return newAmmunition;
}

// Shipments (Stubs)
export async function getShipments(): Promise<Shipment[]> {
  return readData<Shipment>('shipments.json');
}
export async function addShipmentAction(data: Omit<Shipment, 'id'>): Promise<Shipment> {
  const shipments = await getShipments();
  const newShipment: Shipment = {
    ...data,
    id: await generateId(),
  };
  shipments.push(newShipment);
  await writeData('shipments.json', shipments);
  // Revalidate relevant inventory paths as shipments affect stock
  revalidatePath('/shipments');
  revalidatePath('/inventory/firearms');
  revalidatePath('/inventory/magazines');
  revalidatePath('/inventory/ammunition');
  revalidatePath('/dashboard');
  return newShipment;
}


// Ammunition Usage (General Logs - may be deprecated or used differently with daily logs)
export async function getAmmunitionUsageLogs(): Promise<AmmunitionUsageLog[]> {
  return readData<AmmunitionUsageLog>('ammunition_usage.json');
}
export async function logAmmunitionUsageAction(data: Omit<AmmunitionUsageLog, 'id'>): Promise<AmmunitionUsageLog> {
  const logs = await getAmmunitionUsageLogs();
  const newLog: AmmunitionUsageLog = {
    ...data,
    id: await generateId(),
  };
  // TODO: Update actual ammunition quantity (this might be complex if usage is generic)
  logs.push(newLog);
  await writeData('ammunition_usage.json', logs);
  revalidatePath('/inventory/ammunition'); // if linked directly to stock
  revalidatePath('/dashboard');
  revalidatePath('/daily-ammo-usage'); // New page
  return newLog;
}

// Ammunition Daily Usage Logs
export async function getAmmunitionDailyUsageLogs(): Promise<AmmunitionDailyUsageLog[]> {
  const logs = await readData<AmmunitionDailyUsageLog>('ammunition_daily_usage.json');
  return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by newest first
}

export async function addAmmunitionDailyUsageLogAction(data: Omit<AmmunitionDailyUsageLog, 'id'>) {
  const validatedData = ammunitionDailyUsageFormSchema.safeParse(data);
  if (!validatedData.success) {
    console.error("Doğrulama hataları:", validatedData.error.format());
    throw new Error('Geçersiz günlük fişek kullanımı verisi.');
  }

  const logs = await getAmmunitionDailyUsageLogs();
  const newLog: AmmunitionDailyUsageLog = {
    ...validatedData.data,
    date: new Date(validatedData.data.date).toISOString(), // Ensure ISO format
    id: await generateId(),
  };
  logs.push(newLog);
  // Note: This action does NOT automatically decrement overall ammunition stock.
  // That would require a more complex logic:
  // 1. Identify which specific Ammunition items (from ammunition.json) correspond to these calibers.
  // 2. Decide which depot's stock to decrement if not specified.
  // 3. Handle cases where stock is insufficient.
  // For now, this log is purely for tracking reported usage.
  await writeData('ammunition_daily_usage.json', logs);
  revalidatePath('/daily-ammo-usage');
  revalidatePath('/dashboard'); // If dashboard shows usage summaries
  return newLog;
}


// AI Stock Balancing Action
export async function suggestRebalancing(
  depotAInventory: DepotInventorySnapshot,
  depotBInventory: DepotInventorySnapshot,
  historicalUsageData: HistoricalUsageSnapshot,
  upcomingRequirements: UpcomingRequirementsSnapshot
) {
  try {
    const result = await suggestRebalancingAI({
      depotAInventory: JSON.stringify(depotAInventory),
      depotBInventory: JSON.stringify(depotBInventory),
      historicalUsageData: JSON.stringify(historicalUsageData),
      upcomingRequirements: JSON.stringify(upcomingRequirements),
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("AI Yeniden Dengeleme Hatası:", error);
    return { success: false, error: "Yeniden dengeleme önerisi alınamadı." };
  }
}

// Helper to get current inventory for AI
export async function getCurrentDepotInventoriesForAI(): Promise<{ depotA: DepotInventorySnapshot, depotB: DepotInventorySnapshot }> {
  const allFirearms = await getFirearms();
  const allMagazines = await getMagazines();
  const allAmmunition = await getAmmunition();

  const createSnapshot = (depotId: 'depotA' | 'depotB'): DepotInventorySnapshot => ({
    firearms: allFirearms.filter(i => i.depotId === depotId).map(f => ({ id: f.id, name: f.name, model: f.model, caliber: f.caliber, status: f.status })),
    magazines: allMagazines.filter(i => i.depotId === depotId).map(m => ({ id: m.id, name: m.name, caliber: m.caliber, capacity: m.capacity, status: m.status })),
    ammunition: allAmmunition.filter(i => i.depotId === depotId).map(a => ({ id: a.id, name: a.name, caliber: a.caliber, quantity: a.quantity, status: a.status })),
  });
  
  return {
    depotA: createSnapshot('depotA'),
    depotB: createSnapshot('depotB'),
  };
}

export async function getHistoricalUsageForAI(): Promise<HistoricalUsageSnapshot> {
  const usageLogs = await getAmmunitionUsageLogs(); // This uses the general log, might need to switch to daily logs or combine
  // Potentially filter or aggregate data if it's too large
  return {
    ammunitionUsage: usageLogs.map(log => ({ ammunitionId: log.ammunitionId, quantityUsed: log.quantityUsed, date: log.date, depotId: log.depotId})),
  };
}
