
'use server';

import { revalidatePath } from 'next/cache';
import type { Firearm, Magazine, Ammunition, Shipment, ShipmentItem, AmmunitionUsageLog, FirearmDefinition, AmmunitionDailyUsageLog, UsageScenario, ScenarioCaliberConsumption, SupportedCaliber, MagazineStatus, AmmunitionStatus, Depot, MaintenanceLog, MaintenanceItemStatus, FirearmStatus, InventoryItemType, ShipmentTypeDefinition, DepotInventorySnapshot, HistoricalUsageSnapshot, UpcomingRequirementsSnapshot } from '@/types/inventory';
import { readData, writeData, generateId } from '@/lib/data-utils';
import { firearmFormSchema } from '@/app/(app)/inventory/firearms/_components/firearm-form-schema';
import { firearmDefinitionFormSchema } from '@/app/(app)/admin/firearms-definitions/_components/firearm-definition-form-schema';
import { ammunitionDailyUsageFormSchema } from '@/app/(app)/daily-ammo-usage/_components/usage-log-form-schema';
import { usageScenarioFormSchema } from '@/app/(app)/admin/usage-scenarios/_components/usage-scenario-form-schema';
// import { suggestRebalancing as suggestRebalancingAI } from '@/ai/flows/suggest-rebalancing'; // Removed AI import
import { magazineFormSchema, type MagazineFormValues } from '@/app/(app)/inventory/magazines/_components/magazine-form-schema'; 
import { ammunitionFormSchema } from '@/app/(app)/inventory/ammunition/_components/ammunition-form-schema'; 
import { depotFormSchema } from '@/app/(app)/admin/depots/_components/depot-form-schema';
import { maintenanceLogFormSchema } from '@/app/(app)/maintenance/_components/maintenance-log-form-schema';
import { shipmentFormSchema } from '@/app/(app)/shipments/_components/shipment-form-schema';
import { shipmentTypeDefinitionFormSchema } from '@/app/(app)/admin/shipment-types/_components/shipment-type-definition-form-schema';


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
  revalidatePath('/dashboard');
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
  revalidatePath('/dashboard');
  return updatedDefinition;
}

export async function deleteFirearmDefinitionAction(id: string): Promise<void> {
  let definitions = await getFirearmDefinitions();
  // TODO: Check if any firearm instance uses this definition before deleting.
  // For now, direct deletion.
  definitions = definitions.filter(d => d.id !== id);
  await writeData('firearm_definitions.json', definitions);
  revalidatePath('/admin/firearms-definitions');
  revalidatePath('/dashboard');
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
    throw new Error('Geçersiz silah verisi: ' + JSON.stringify(validatedData.error.format()));
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
    name: definition.name, 
    model: definition.model, 
    manufacturer: definition.manufacturer, 
    caliber: definition.caliber, 
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
    console.error("Doğrulama hataları:", validatedData.error.format());
    throw new Error('Güncelleme için geçersiz silah verisi.');
  }

  let firearms = await getFirearms();
  const index = firearms.findIndex(f => f.id === firearm.id);
  if (index === -1) {
    throw new Error('Güncellenecek silah bulunamadı.');
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
  revalidatePath('/inventory/firearms');
  revalidatePath(`/inventory/firearms/${firearm.id}`);
  revalidatePath(`/inventory/firearms/${firearm.id}/edit`);
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

// Magazines
export async function getMagazines(): Promise<Magazine[]> {
  return readData<Magazine>('magazines.json');
}

export async function getMagazineById(id: string): Promise<Magazine | undefined> {
  const magazines = await getMagazines();
  return magazines.find(m => m.id === id);
}

export async function addMagazineAction(data: MagazineFormValues) {
  const validatedData = magazineFormSchema.safeParse(data);
  if (!validatedData.success) {
    throw new Error('Geçersiz şarjör verisi: ' + JSON.stringify(validatedData.error.format()));
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
      serialNumber: quantity > 1 ? undefined : validatedData.data.serialNumber, 
      id: await generateId(),
      itemType: 'magazine',
      lastUpdated: new Date().toISOString(),
      maintenanceHistory: [],
    };
    magazines.push(newMagazine);
    addedMagazines.push(newMagazine);
  }
  
  await writeData('magazines.json', magazines);
  revalidatePath('/inventory/magazines');
  revalidatePath('/dashboard');
  return addedMagazines.length > 0 ? addedMagazines[0] : undefined; 
}

export async function updateMagazineAction(magazine: Magazine & { quantity?: number }) {
   const { quantity, ...magazineDataToValidate } = magazine;
   const validatedData = magazineFormSchema.omit({ quantity: true }).safeParse(magazineDataToValidate);

   if (!validatedData.success) {
    throw new Error('Güncelleme için geçersiz şarjör verisi: ' + JSON.stringify(validatedData.error.format()));
  }

  let magazines = await getMagazines();
  const index = magazines.findIndex(m => m.id === magazine.id);
  if (index === -1) {
    throw new Error('Güncellenecek şarjör bulunamadı.');
  }
  
  magazines[index] = {
    ...magazines[index], 
    ...validatedData.data,
    lastUpdated: new Date().toISOString(),
  };
  await writeData('magazines.json', magazines);
  revalidatePath('/inventory/magazines');
  revalidatePath(`/inventory/magazines/${magazine.id}/edit`);
  revalidatePath('/dashboard');
  return magazines[index];
}

export async function deleteMagazineAction(id: string): Promise<void> {
  let magazines = await getMagazines();
  magazines = magazines.filter(m => m.id !== id);
  await writeData('magazines.json', magazines);
  revalidatePath('/inventory/magazines');
  revalidatePath('/dashboard');
}


// Ammunition
export async function getAmmunition(): Promise<Ammunition[]> {
  return readData<Ammunition>('ammunition.json');
}

export async function getAmmunitionById(id: string): Promise<Ammunition | undefined> {
  const ammunition = await getAmmunition();
  return ammunition.find(a => a.id === id);
}

export async function addAmmunitionAction(data: Omit<Ammunition, 'id' | 'lastUpdated' | 'itemType'>) {
  const validatedData = ammunitionFormSchema.safeParse(data);
  if (!validatedData.success) {
    throw new Error('Geçersiz mühimmat verisi: ' + JSON.stringify(validatedData.error.format()));
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
  revalidatePath('/inventory/ammunition');
  revalidatePath('/dashboard');
  return newAmmunition;
}

export async function updateAmmunitionAction(ammunition: Ammunition) {
  const validatedData = ammunitionFormSchema.safeParse(ammunition);
  if (!validatedData.success) {
    throw new Error('Güncelleme için geçersiz mühimmat verisi: ' + JSON.stringify(validatedData.error.format()));
  }

  let allAmmunition = await getAmmunition();
  const index = allAmmunition.findIndex(a => a.id === ammunition.id);
  if (index === -1) {
    throw new Error('Güncellenecek mühimmat bulunamadı.');
  }
  
  allAmmunition[index] = {
     ...allAmmunition[index], 
    ...validatedData.data,
    lastUpdated: new Date().toISOString(),
  };
  await writeData('ammunition.json', allAmmunition);
  revalidatePath('/inventory/ammunition');
  revalidatePath(`/inventory/ammunition/${ammunition.id}/edit`);
  revalidatePath('/dashboard');
  return allAmmunition[index];
}

export async function deleteAmmunitionAction(id: string): Promise<void> {
  let allAmmunition = await getAmmunition();
  allAmmunition = allAmmunition.filter(a => a.id !== id);
  await writeData('ammunition.json', allAmmunition);
  revalidatePath('/inventory/ammunition');
  revalidatePath('/dashboard');
}


// Shipments
export async function getShipments(): Promise<Shipment[]> {
  return readData<Shipment>('shipments.json');
}

export async function getShipmentById(id: string): Promise<Shipment | undefined> {
  const shipments = await getShipments();
  return shipments.find(s => s.id === id);
}

export async function addShipmentAction(data: Omit<Shipment, 'id' | 'lastUpdated'>): Promise<Shipment> {
  const validatedData = shipmentFormSchema.safeParse(data);
  if (!validatedData.success) {
    console.error("Doğrulama hataları:", validatedData.error.format());
    throw new Error('Geçersiz malzeme kaydı verisi.');
  }

  const shipmentTypeDef = await getShipmentTypeDefinitionById(validatedData.data.typeId);
  if (!shipmentTypeDef) {
    throw new Error("Geçersiz malzeme kayıt türü ID'si.");
  }

  if (shipmentTypeDef.requiresSourceDepot && !validatedData.data.sourceDepotId) {
    throw new Error(`'${shipmentTypeDef.name}' türü için kaynak depo gereklidir.`);
  }
  if (shipmentTypeDef.requiresDestinationDepot && !validatedData.data.destinationDepotId) {
    throw new Error(`'${shipmentTypeDef.name}' türü için hedef depo gereklidir.`);
  }
  if (shipmentTypeDef.requiresSourceDepot && shipmentTypeDef.requiresDestinationDepot && validatedData.data.sourceDepotId === validatedData.data.destinationDepotId) {
    throw new Error("Transfer işleminde kaynak ve hedef depo aynı olamaz.");
  }


  const shipments = await getShipments();
  const newShipment: Shipment = {
    ...validatedData.data,
    id: await generateId(),
    lastUpdated: new Date().toISOString(),
  };
  shipments.push(newShipment);
  await writeData('shipments.json', shipments);
  revalidatePath('/shipments');
  revalidatePath('/inventory/firearms');
  revalidatePath('/inventory/magazines');
  revalidatePath('/inventory/ammunition');
  revalidatePath('/dashboard');
  return newShipment;
}

export async function updateShipmentAction(shipment: Shipment): Promise<Shipment> {
  const validatedData = shipmentFormSchema.safeParse(shipment);
  if (!validatedData.success) {
    console.error("Doğrulama hataları:", validatedData.error.format());
    throw new Error('Güncelleme için geçersiz malzeme kaydı verisi.');
  }

  const shipmentTypeDef = await getShipmentTypeDefinitionById(validatedData.data.typeId);
  if (!shipmentTypeDef) {
    throw new Error("Geçersiz malzeme kayıt türü ID'si.");
  }

  if (shipmentTypeDef.requiresSourceDepot && !validatedData.data.sourceDepotId) {
    throw new Error(`'${shipmentTypeDef.name}' türü için kaynak depo gereklidir.`);
  }
  if (shipmentTypeDef.requiresDestinationDepot && !validatedData.data.destinationDepotId) {
    throw new Error(`'${shipmentTypeDef.name}' türü için hedef depo gereklidir.`);
  }
  if (shipmentTypeDef.requiresSourceDepot && shipmentTypeDef.requiresDestinationDepot && validatedData.data.sourceDepotId === validatedData.data.destinationDepotId) {
    throw new Error("Transfer işleminde kaynak ve hedef depo aynı olamaz.");
  }

  let shipments = await getShipments();
  const index = shipments.findIndex(s => s.id === shipment.id);
  if (index === -1) {
    throw new Error('Güncellenecek malzeme kaydı bulunamadı.');
  }
  
  shipments[index] = {
    ...shipments[index],
    ...validatedData.data,
    lastUpdated: new Date().toISOString(),
  };
  await writeData('shipments.json', shipments);
  revalidatePath('/shipments');
  revalidatePath(`/shipments/${shipment.id}/edit`);
  revalidatePath('/dashboard');
  return shipments[index];
}

export async function deleteShipmentAction(id: string): Promise<void> {
  let shipments = await getShipments();
  shipments = shipments.filter(s => s.id !== id);
  await writeData('shipments.json', shipments);
  revalidatePath('/shipments');
  revalidatePath('/dashboard');
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
  logs.push(newLog);
  await writeData('ammunition_usage.json', logs);
  revalidatePath('/inventory/ammunition'); 
  revalidatePath('/dashboard');
  revalidatePath('/daily-ammo-usage'); 
  return newLog;
}

// Ammunition Daily Usage Logs
export async function getAmmunitionDailyUsageLogs(): Promise<AmmunitionDailyUsageLog[]> {
  const logs = await readData<AmmunitionDailyUsageLog>('ammunition_daily_usage.json');
  return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); 
}

export async function getAmmunitionDailyUsageLogById(id: string): Promise<AmmunitionDailyUsageLog | undefined> {
  const logs = await getAmmunitionDailyUsageLogs();
  return logs.find(log => log.id === id);
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
    date: new Date(validatedData.data.date).toISOString(), 
    id: await generateId(),
  };
  logs.push(newLog);
  await writeData('ammunition_daily_usage.json', logs);
  revalidatePath('/daily-ammo-usage');
  revalidatePath('/dashboard'); 
  return newLog;
}

export async function updateAmmunitionDailyUsageLogAction(logToUpdate: AmmunitionDailyUsageLog) {
  const validatedData = ammunitionDailyUsageFormSchema.safeParse(logToUpdate);
  if (!validatedData.success) {
    console.error("Doğrulama hataları:", validatedData.error.format());
    throw new Error('Güncelleme için geçersiz günlük fişek kullanımı verisi.');
  }

  let logs = await getAmmunitionDailyUsageLogs();
  const index = logs.findIndex(l => l.id === logToUpdate.id);
  if (index === -1) {
    throw new Error('Güncellenecek günlük fişek kullanım kaydı bulunamadı.');
  }

  logs[index] = {
    ...logs[index], 
    ...validatedData.data, 
    date: new Date(validatedData.data.date).toISOString(), 
  };

  await writeData('ammunition_daily_usage.json', logs);
  revalidatePath('/daily-ammo-usage');
  revalidatePath(`/daily-ammo-usage/${logToUpdate.id}/edit`); 
  revalidatePath('/dashboard');
  return logs[index];
}

export async function deleteAmmunitionDailyUsageLogAction(id: string): Promise<void> {
  let logs = await getAmmunitionDailyUsageLogs();
  logs = logs.filter(log => log.id !== id);
  await writeData('ammunition_daily_usage.json', logs);
  revalidatePath('/daily-ammo-usage');
  revalidatePath('/dashboard');
}


export interface GroupedDailyUsageLog {
  scenarioId?: string;
  scenarioName: string;
  logs: AmmunitionDailyUsageLog[];
}

export async function getGroupedAmmunitionDailyUsageLogs(): Promise<GroupedDailyUsageLog[]> {
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


// Usage Scenarios
export async function getUsageScenarios(): Promise<UsageScenario[]> {
  return readData<UsageScenario>('usage_scenarios.json');
}

export async function getUsageScenarioById(id: string): Promise<UsageScenario | undefined> {
  const scenarios = await getUsageScenarios();
  return scenarios.find(s => s.id === id);
}

export async function addUsageScenarioAction(data: Omit<UsageScenario, 'id' | 'lastUpdated'>) {
  const validatedData = usageScenarioFormSchema.safeParse(data);
  if (!validatedData.success) {
    console.error("Doğrulama hataları:", validatedData.error.format());
    throw new Error('Geçersiz kullanım senaryosu verisi.');
  }
  
  const scenarios = await getUsageScenarios();
  const newScenario: UsageScenario = {
    ...validatedData.data,
    id: await generateId(),
    lastUpdated: new Date().toISOString(),
  };
  scenarios.push(newScenario);
  await writeData('usage_scenarios.json', scenarios);
  revalidatePath('/admin/usage-scenarios');
  return newScenario;
}

export async function updateUsageScenarioAction(scenario: UsageScenario) {
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
    console.error("Doğrulama hataları:", validatedData.error.format());
    throw new Error('Güncelleme için geçersiz kullanım senaryosu verisi.');
  }

  let scenarios = await getUsageScenarios();
  const index = scenarios.findIndex(s => s.id === scenario.id);
  if (index === -1) {
    throw new Error('Güncellenecek kullanım senaryosu bulunamadı.');
  }
  
  const updatedScenario = {
    ...scenarios[index], 
    ...validatedData.data,
    lastUpdated: new Date().toISOString(),
  };

  scenarios[index] = updatedScenario;
  await writeData('usage_scenarios.json', scenarios);
  revalidatePath('/admin/usage-scenarios');
  revalidatePath(`/admin/usage-scenarios/${scenario.id}/edit`);
  return updatedScenario;
}

export async function deleteUsageScenarioAction(id: string): Promise<void> {
  let scenarios = await getUsageScenarios();
  scenarios = scenarios.filter(s => s.id !== id);
  await writeData('usage_scenarios.json', scenarios);
  revalidatePath('/admin/usage-scenarios');
}


// Depot Definitions
export async function getDepots(): Promise<Depot[]> {
  return readData<Depot>('depots.json');
}

export async function getDepotById(id: string): Promise<Depot | undefined> {
  const depots = await getDepots();
  return depots.find(d => d.id === id);
}

export async function addDepotAction(data: Omit<Depot, 'lastUpdated'> & {id: string}) { 
  const validatedData = depotFormSchema.safeParse(data);
  if (!validatedData.success) {
    throw new Error('Geçersiz depo verisi: ' + JSON.stringify(validatedData.error.format()));
  }
  
  const depots = await getDepots();
  if (depots.some(d => d.id === validatedData.data.id)) {
      throw new Error('Bu ID ile bir depo zaten mevcut.');
  }

  const newDepot: Depot = {
    ...validatedData.data,
    lastUpdated: new Date().toISOString(),
  };
  depots.push(newDepot);
  await writeData('depots.json', depots);
  revalidatePath('/admin/depots');
  return newDepot;
}

export async function updateDepotAction(depot: Depot) {
  const { id, lastUpdated, ...updateData } = depot;
  const validatedData = depotFormSchema.omit({id: true}).safeParse(updateData);

   if (!validatedData.success) {
    console.error("Doğrulama hataları:", validatedData.error.format());
    throw new Error('Güncelleme için geçersiz depo verisi.');
  }

  let depots = await getDepots();
  const index = depots.findIndex(d => d.id === id);
  if (index === -1) {
    throw new Error('Güncellenecek depo bulunamadı.');
  }
  
  const updatedDepot: Depot = {
    ...depots[index], 
    ...validatedData.data, 
    lastUpdated: new Date().toISOString(),
  };

  depots[index] = updatedDepot;
  await writeData('depots.json', depots);
  revalidatePath('/admin/depots');
  revalidatePath(`/admin/depots/${id}/edit`);
  return updatedDepot;
}

export async function deleteDepotAction(id: string): Promise<void> {
  let depots = await getDepots();
  // TODO: Check if this depot is used in any inventory item or shipment before deleting.
  depots = depots.filter(d => d.id !== id);
  await writeData('depots.json', depots);
  revalidatePath('/admin/depots');
}

// Maintenance Logs
export async function addMaintenanceLogToItemAction(
  itemId: string,
  itemType: 'firearm' | 'magazine',
  logData: Omit<MaintenanceLog, 'id'>
) {
  if (!itemId || !itemType || !logData.date || !logData.description || !logData.statusChangeFrom || !logData.statusChangeTo) {
    throw new Error('Bakım kaydı için eksik veri.');
  }

  const newLog: MaintenanceLog = {
    ...logData,
    id: await generateId(),
  };

  if (itemType === 'firearm') {
    const firearms = await getFirearms();
    const itemIndex = firearms.findIndex(f => f.id === itemId);
    if (itemIndex === -1) throw new Error('Bakım yapılacak silah bulunamadı.');
    
    firearms[itemIndex].maintenanceHistory = [...(firearms[itemIndex].maintenanceHistory || []), newLog];
    firearms[itemIndex].status = newLog.statusChangeTo as FirearmStatus; 
    firearms[itemIndex].lastUpdated = new Date().toISOString();
    await writeData('firearms.json', firearms);
    revalidatePath(`/inventory/firearms/${itemId}`);
    revalidatePath('/inventory/firearms');

  } else if (itemType === 'magazine') {
    const magazines = await getMagazines();
    const itemIndex = magazines.findIndex(m => m.id === itemId);
    if (itemIndex === -1) throw new Error('Bakım yapılacak şarjör bulunamadı.');

    magazines[itemIndex].maintenanceHistory = [...(magazines[itemIndex].maintenanceHistory || []), newLog];
    magazines[itemIndex].status = newLog.statusChangeTo as MagazineStatus; 
    magazines[itemIndex].lastUpdated = new Date().toISOString();
    await writeData('magazines.json', magazines);
    revalidatePath(`/inventory/magazines/${itemId}`); 
    revalidatePath('/inventory/magazines');
  } else {
    throw new Error('Geçersiz öğe türü.');
  }
  
  revalidatePath('/maintenance');
  revalidatePath('/dashboard');
  return newLog;
}


// Shipment Type Definitions
export async function getShipmentTypeDefinitions(): Promise<ShipmentTypeDefinition[]> {
  return readData<ShipmentTypeDefinition>('shipment_types.json');
}

export async function getShipmentTypeDefinitionById(id: string): Promise<ShipmentTypeDefinition | undefined> {
  const definitions = await getShipmentTypeDefinitions();
  return definitions.find(d => d.id === id);
}

export async function addShipmentTypeDefinitionAction(data: Omit<ShipmentTypeDefinition, 'id' | 'lastUpdated'>) {
  const validatedData = shipmentTypeDefinitionFormSchema.safeParse(data);
  if (!validatedData.success) {
    console.error("Validation Errors:", validatedData.error.format());
    throw new Error('Geçersiz malzeme kayıt türü verisi.');
  }
  
  const definitions = await getShipmentTypeDefinitions();
  const newDefinition: ShipmentTypeDefinition = {
    ...validatedData.data,
    id: await generateId(),
    lastUpdated: new Date().toISOString(),
  };
  definitions.push(newDefinition);
  await writeData('shipment_types.json', definitions);
  revalidatePath('/admin/shipment-types');
  return newDefinition;
}

export async function updateShipmentTypeDefinitionAction(definition: ShipmentTypeDefinition) {
  const validatedData = shipmentTypeDefinitionFormSchema.safeParse(definition);
   if (!validatedData.success) {
    console.error("Validation Errors:", validatedData.error.format());
    throw new Error('Güncelleme için geçersiz malzeme kayıt türü verisi.');
  }

  let definitions = await getShipmentTypeDefinitions();
  const index = definitions.findIndex(d => d.id === definition.id);
  if (index === -1) {
    throw new Error('Güncellenecek malzeme kayıt türü bulunamadı.');
  }
  
  const updatedDefinition = {
    ...definitions[index],
    ...validatedData.data,
    lastUpdated: new Date().toISOString(),
  };

  definitions[index] = updatedDefinition;
  await writeData('shipment_types.json', definitions);
  revalidatePath('/admin/shipment-types');
  revalidatePath(`/admin/shipment-types/${definition.id}/edit`);
  return updatedDefinition;
}

export async function deleteShipmentTypeDefinitionAction(id: string): Promise<void> {
  let definitions = await getShipmentTypeDefinitions();
  // TODO: Check if any shipment instance uses this type definition before deleting.
  definitions = definitions.filter(d => d.id !== id);
  await writeData('shipment_types.json', definitions);
  revalidatePath('/admin/shipment-types');
}
