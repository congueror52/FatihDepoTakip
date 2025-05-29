
export type DepotId = string; 

// DEPOT_LOCATIONS sabitini kaldırıyoruz, depolar artık dinamik olarak yönetilecek.

export type FirearmStatus = 'Hizmette' | 'Bakımda' | 'Arızalı' | 'Onarım Bekliyor' | 'Onarıldı' | 'Hizmet Dışı';
export type MagazineStatus = 'Hizmette' | 'Bakımda' | 'Arızalı' | 'Kayıp' | 'Hizmet Dışı';
export type AmmunitionStatus = 'Mevcut' | 'Düşük Stok' | 'Kritik Stok' | 'Tükenmek Üzere';
export type MaintenanceItemStatus = FirearmStatus | MagazineStatus;

export type InventoryItemType = 'firearm' | 'magazine' | 'ammunition' | 'other';


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
  compatibleFirearmDefinitionId?: string; 
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


export interface ShipmentItem {
  id: string; // for useFieldArray key
  name: string; // Description of the item, e.g., "SAR9 Magazine" or "5.56x45mm FMJ MKE"
  itemType: InventoryItemType;
  quantity: number;
  // Optional details, relevant based on itemType
  caliber?: string;
  model?: string; // For firearms
  serialNumber?: string; // For individual firearms, if applicable in shipment
  capacity?: number; // For magazines
}

// Definition for a shipment type (managed by admin)
export interface ShipmentTypeDefinition {
  id: string;
  name: string;
  description?: string;
  requiresSourceDepot: boolean;
  requiresDestinationDepot: boolean;
  lastUpdated: string;
}

export interface Shipment {
  id: string;
  date: string; // ISO date string
  typeId: string; // References ShipmentTypeDefinition.id
  items: ShipmentItem[];
  notes?: string;
  supplier?: string; // Relevant for 'Gelen'
  trackingNumber?: string;
  sourceDepotId?: DepotId; // For 'Giden' or 'Transfer (from)'
  destinationDepotId?: DepotId; // For 'Gelen' or 'Transfer (to)'
  lastUpdated: string;
}


export interface MaintenanceLog {
  id:string;
  date: string; // ISO date string
  description: string;
  statusChangeFrom: MaintenanceItemStatus;
  statusChangeTo: MaintenanceItemStatus;
  technician?: string;
  partsUsed?: string; 
  cost?: number;
}

export interface AmmunitionUsageLog {
  id: string;
  date: string; // ISO date string
  ammunitionId: string; 
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
  usageScenarioId?: string; 
  used_9x19mm: number;
  used_5_56x45mm: number;
  used_7_62x39mm: number;
  used_7_62x51mm: number;
  notes?: string;
}

export const SUPPORTED_CALIBERS = ["9x19mm", "5.56x45mm", "7.62x39mm", "7.62x51mm"] as const;
export type SupportedCaliber = typeof SUPPORTED_CALIBERS[number];

export const INVENTORY_ITEM_TYPES: {value: InventoryItemType, label: string}[] = [
    {value: 'firearm', label: 'Silah'},
    {value: 'magazine', label: 'Şarjör'},
    {value: 'ammunition', label: 'Mühimmat'},
    {value: 'other', label: 'Diğer Malzemeler'},
];


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


// For AI balancing input - Can be removed if AI balancing is not used
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

// Alert Definitions
export type AlertEntityType = 'ammunition' | 'firearm' | 'magazine';
export type AlertConditionType = 'low_stock' | 'maintenance_due_soon' | 'status_is';
export type AlertSeverity = 'Yüksek' | 'Orta' | 'Düşük';

export const ALERT_ENTITY_TYPES: { value: AlertEntityType; label: string }[] = [
  { value: 'ammunition', label: 'Mühimmat' },
  { value: 'firearm', label: 'Silah' },
  { value: 'magazine', label: 'Şarjör' },
];

export const ALERT_CONDITION_TYPES: { value: AlertConditionType; label: string; applicableTo: AlertEntityType[] }[] = [
  { value: 'low_stock', label: 'Düşük Stok', applicableTo: ['ammunition'] },
  // { value: 'maintenance_due_soon', label: 'Bakım Tarihi Yaklaşıyor', applicableTo: ['firearm', 'magazine'] }, // Future: Requires maintenance scheduling
  { value: 'status_is', label: 'Durumu Şöyle Olduğunda', applicableTo: ['firearm', 'magazine'] },
];

export const ALERT_SEVERITIES: AlertSeverity[] = ['Yüksek', 'Orta', 'Düşük'];


export interface AlertDefinition {
  id: string;
  name: string;
  description?: string;
  entityType: AlertEntityType;
  conditionType: AlertConditionType;
  depotId?: DepotId; // For depot-specific alerts
  // Fields specific to conditionType
  caliberFilter?: SupportedCaliber; // For ammunition + low_stock
  thresholdValue?: number; // For low_stock
  statusFilter?: FirearmStatus | MagazineStatus; // For status_is
  daysBeforeMaintenance?: number; // For maintenance_due_soon (future)
  
  severity: AlertSeverity;
  messageTemplate: string; // e.g., "{itemName} için stok kritik seviyede ({currentValue}/{thresholdValue})"
  isActive: boolean;
  lastUpdated: string; // ISO date string
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
export type ShipmentTypeDefinitionsDb = ShipmentTypeDefinition[];
export type AlertDefinitionsDb = AlertDefinition[]; // New DB type
