
export type DepotId = string; // Changed from 'depotA' | 'depotB'

export const DEPOT_LOCATIONS: { id: DepotId; name: string }[] = [
  { id: 'depotA', name: 'Depo Alfa' },
  { id: 'depotB', name: 'Depo Bravo' },
];

export type FirearmStatus = 'Hizmette' | 'Bakımda' | 'Arızalı' | 'Onarım Bekliyor' | 'Onarıldı' | 'Hizmet Dışı';
export type MagazineStatus = 'Hizmette' | 'Bakımda' | 'Arızalı' | 'Kayıp' | 'Hizmet Dışı';
export type AmmunitionStatus = 'Mevcut' | 'Düşük Stok' | 'Kritik Stok' | 'Tükenmek Üzere';


export interface BaseItem {
  id: string;
  name: string; 
  depotId: DepotId;
  notes?: string;
  lastUpdated: string; // ISO date string
  purchaseDate?: string; // ISO date string
  manufacturer?: string; 
}

// Master definition for a firearm type
export interface FirearmDefinition {
  id: string;
  name: string; 
  model: string; 
  manufacturer?: string; 
  caliber: string; 
  description?: string;
  lastUpdated: string;
}

export interface Firearm extends BaseItem {
  itemType: 'firearm';
  definitionId: string; // Links to FirearmDefinition
  serialNumber: string;
  model: string; // Copied from definition
  caliber: string; // Copied from definition
  status: FirearmStatus;
  maintenanceHistory?: MaintenanceLog[];
}

export interface Magazine extends BaseItem {
  itemType: 'magazine';
  caliber: string;
  capacity: number;
  status: MagazineStatus;
  compatibleFirearmDefinitionId?: string; // Optional: To link which firearm definition this magazine was created for
  serialNumber?: string; 
  maintenanceHistory?: MaintenanceLog[];
}

export interface Ammunition extends BaseItem {
  itemType: 'ammunition';
  caliber: string;
  quantity: number;
  bulletType?: string; 
  lotNumber?: string;
  status: AmmunitionStatus; 
}

export type InventoryItem = Firearm | Magazine | Ammunition;

export interface Shipment {
  id: string;
  date: string; // ISO date string
  type: 'Gelen' | 'Giden' | 'Transfer';
  items: Array<{
    inventoryId?: string; 
    name: string;
    itemType: InventoryItem['itemType'];
    quantity: number;
    caliber?: string;
    model?: string; 
    serialNumber?: string; 
    capacity?: number; 
    depotId: DepotId; 
    destinationDepotId?: DepotId; 
  }>;
  notes?: string;
  supplier?: string; 
  trackingNumber?: string;
}

export interface MaintenanceLog {
  id:string;
  date: string; // ISO date string
  description: string;
  statusChangeFrom: FirearmStatus | MagazineStatus;
  statusChangeTo: FirearmStatus | MagazineStatus;
  technician?: string;
  partsUsed?: string[];
  cost?: number;
}

export interface AmmunitionUsageLog {
  id: string;
  date: string; // ISO date string
  ammunitionId: string; // Links to Ammunition item
  quantityUsed: number;
  depotId: DepotId;
  purpose?: string; 
  userId?: string; 
  notes?: string;
}

export interface AmmunitionDailyUsageLog {
  id: string;
  date: string; // ISO date string
  personnelCount: number;
  usageScenarioId?: string; // Link to UsageScenario
  used_9x19mm: number;
  used_5_56x45mm: number;
  used_7_62x39mm: number;
  used_7_62x51mm: number;
  notes?: string;
}

export const SUPPORTED_CALIBERS = ["9x19mm", "5.56x45mm", "7.62x39mm", "7.62x51mm"] as const;
export type SupportedCaliber = typeof SUPPORTED_CALIBERS[number];


export interface ScenarioCaliberConsumption {
  caliber: SupportedCaliber;
  roundsPerPerson: number;
}
export interface UsageScenario {
  id: string;
  name: string;
  description?: string;
  consumptionRatesPerCaliber: ScenarioCaliberConsumption[];
  lastUpdated: string;
}

export interface Depot {
  id: DepotId; 
  name: string; 
  address?: string;
  contactPerson?: string;
  notes?: string;
  lastUpdated: string; 
}


// For AI balancing input
export interface DepotInventoryItemBase {
  id: string;
  name: string;
  caliber: string;
}
export interface DepotFirearmSnapshot extends DepotInventoryItemBase {
  itemType: 'firearm';
  model: string;
  status: FirearmStatus;
}
export interface DepotMagazineSnapshot extends DepotInventoryItemBase {
  itemType: 'magazine';
  capacity: number;
  status: MagazineStatus;
}
export interface DepotAmmunitionSnapshot extends DepotInventoryItemBase {
  itemType: 'ammunition';
  quantity: number;
  status: AmmunitionStatus;
}

export type DepotInventoryItemSnapshot = DepotFirearmSnapshot | DepotMagazineSnapshot | DepotAmmunitionSnapshot;

export interface DepotInventorySnapshot {
  firearms: Array<Omit<DepotFirearmSnapshot, 'itemType'>>;
  magazines: Array<Omit<DepotMagazineSnapshot, 'itemType'>>;
  ammunition: Array<Omit<DepotAmmunitionSnapshot, 'itemType'>>;
}

export interface HistoricalUsageSnapshot {
  ammunitionUsage: Array<Pick<AmmunitionUsageLog, 'ammunitionId' | 'quantityUsed' | 'date' | 'depotId'>>;
}
export interface UpcomingRequirementsSnapshot {
  description: string; 
  requiredItems: Array<{ nameOrCaliber: string; quantity: number; itemType: InventoryItem['itemType'] }>;
  depotId?: DepotId; 
  dateRange: { start: string; end: string }; 
}

// Schema for individual JSON files
export type FirearmsDb = Firearm[];
export type MagazinesDb = Magazine[];
export type AmmunitionDb = Ammunition[];
export type ShipmentsDb = Shipment[];
export type AmmunitionUsageDb = AmmunitionUsageLog[];
export type FirearmDefinitionsDb = FirearmDefinition[];
export type AmmunitionDailyUsageDb = AmmunitionDailyUsageLog[];
export type UsageScenariosDb = UsageScenario[];
export type DepotsDb = Depot[];
