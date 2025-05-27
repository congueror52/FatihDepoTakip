
export type DepotId = 'depotA' | 'depotB';

export const DEPOT_LOCATIONS: { id: DepotId; name: string }[] = [
  { id: 'depotA', name: 'Depo Alfa' },
  { id: 'depotB', name: 'Depo Bravo' },
];

export type FirearmStatus = 'Hizmette' | 'Bakımda' | 'Arızalı' | 'Onarım Bekliyor' | 'Onarıldı' | 'Hizmet Dışı';
export type MagazineStatus = 'Hizmette' | 'Bakımda' | 'Arızalı' | 'Onarım Bekliyor' | 'Onarıldı' | 'Hizmet Dışı';
export type AmmunitionStatus = 'Mevcut' | 'Düşük Stok' | 'Rezerve Edilmiş';


export interface BaseItem {
  id: string;
  name: string; // For instances, this will be copied from definition
  depotId: DepotId;
  notes?: string;
  lastUpdated: string; // ISO date string
  purchaseDate?: string; // ISO date string
  manufacturer?: string; // For instances, this will be copied from definition
}

// Master definition for a firearm type
export interface FirearmDefinition {
  id: string;
  name: string; // e.g., "Piyade Tüfeği", "Tabanca"
  model: string; // e.g., MPT-76, SAR9
  manufacturer?: string; // e.g., MKE, Sarsılmaz
  caliber: string; // e.g., 7.62x51mm, 9x19mm
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
  compatibleWith?: string[]; // e.g., specific firearm models
  maintenanceHistory?: MaintenanceLog[];
}

export interface Ammunition extends BaseItem {
  itemType: 'ammunition';
  caliber: string;
  quantity: number;
  bulletType?: string; // e.g., FMJ, HP
  lotNumber?: string;
  status: AmmunitionStatus; // Primarily for alerts, actual status is mostly 'Available'
}

export type InventoryItem = Firearm | Magazine | Ammunition;

export interface Shipment {
  id: string;
  date: string; // ISO date string
  type: 'Gelen' | 'Giden' | 'Transfer';
  items: Array<{
    inventoryId?: string; // Link to existing inventory item if updating quantity
    name: string;
    itemType: InventoryItem['itemType'];
    quantity: number;
    caliber?: string;
    model?: string; // if firearm
    serialNumber?: string; // if firearm
    capacity?: number; // if magazine
    depotId: DepotId; // Target depot for incoming/transfer, source for outgoing
    destinationDepotId?: DepotId; // For transfers
  }>;
  notes?: string;
  supplier?: string; // For incoming
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
  purpose?: string; // e.g., Eğitim, Görev, Test
  userId?: string; // User who reported usage
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

// Admin-configurable standard consumption rates
export const SUPPORTED_CALIBERS_FOR_CONSUMPTION = ["9x19mm", "5.56x45mm", "7.62x39mm", "7.62x51mm"] as const;
export type SupportedCaliberForConsumption = typeof SUPPORTED_CALIBERS_FOR_CONSUMPTION[number];

export interface AmmunitionStandardConsumptionRate {
  id: string;
  caliber: SupportedCaliberForConsumption;
  roundsPerPerson: number;
  lastUpdated: string;
}

// Admin-configurable usage scenarios
export interface UsageScenario {
  id: string;
  name: string;
  description?: string;
  preselectedCalibers: SupportedCaliberForConsumption[];
  lastUpdated: string;
}


// For AI balancing input
export interface DepotInventorySnapshot {
  firearms: Array<Pick<Firearm, 'id' | 'name' | 'model' | 'caliber' | 'status'>>;
  magazines: Array<Pick<Magazine, 'id' | 'name' | 'caliber' | 'capacity' | 'status'>>;
  ammunition: Array<Pick<Ammunition, 'id' | 'name' | 'caliber' | 'quantity' | 'status'>>;
}
export interface HistoricalUsageSnapshot {
  ammunitionUsage: Array<Pick<AmmunitionUsageLog, 'ammunitionId' | 'quantityUsed' | 'date' | 'depotId'>>;
  // Could also include firearm/magazine repair frequency if relevant
}
export interface UpcomingRequirementsSnapshot {
  description: string; // e.g., "Training exercise for 50 personnel, requiring 5.56mm and 9mm ammo"
  requiredItems: Array<{ nameOrCaliber: string; quantity: number; itemType: InventoryItem['itemType'] }>;
  depotId?: DepotId; // Optional, if requirement is depot-specific
  dateRange: { start: string; end: string }; // Changed to be an object with start and end
}

// Schema for individual JSON files
export type FirearmsDb = Firearm[];
export type MagazinesDb = Magazine[];
export type AmmunitionDb = Ammunition[];
export type ShipmentsDb = Shipment[];
export type AmmunitionUsageDb = AmmunitionUsageLog[];
export type FirearmDefinitionsDb = FirearmDefinition[];
export type AmmunitionDailyUsageDb = AmmunitionDailyUsageLog[];
export type AmmunitionStandardConsumptionRatesDb = AmmunitionStandardConsumptionRate[];
export type UsageScenariosDb = UsageScenario[]; // New DB type
