
export type DepotId = string; 

// Updated Status Types
export type FirearmStatus = 'Depoda' | 'Destekte' | 'Depoda Arızalı' | 'Poligonda' | 'Onarıldı' | 'Rapor Bekliyor';
export type MagazineStatus = 'Depoda' | 'Destekte' | 'Depoda Arızalı' | 'Poligonda' | 'Rapor Bekliyor'; // 'Kayıp' was mapped to 'Poligonda' based on card title change
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

export const SUPPORTED_CALIBERS = ["9x19mm", "5.56x45mm", "7.62x39mm", "7.62x51mm"] as const;
export type SupportedCaliber = typeof SUPPORTED_CALIBERS[number];

// Master definition for a firearm type
export interface FirearmDefinition {
  id: string;
  name: string; 
  model: string; 
  manufacturer?: string; 
  caliber: SupportedCaliber; 
  description?: string;
  lastUpdated: string;
}

export interface Firearm extends BaseItem {
  itemType: 'firearm';
  definitionId: string; 
  serialNumber: string;
  model: string; 
  caliber: SupportedCaliber; 
  status: FirearmStatus;
  maintenanceHistory?: MaintenanceLog[];
}

export interface Magazine extends BaseItem {
  itemType: 'magazine';
  caliber: SupportedCaliber;
  capacity: number;
  status: MagazineStatus;
  compatibleFirearmDefinitionId?: string; 
  serialNumber?: string; 
  maintenanceHistory?: MaintenanceLog[];
}

export interface Ammunition extends BaseItem {
  itemType: 'ammunition';
  caliber: SupportedCaliber;
  quantity: number;
  bulletType?: string; 
  lotNumber?: string;
  status: AmmunitionStatus; 
}

export type InventoryItem = Firearm | Magazine | Ammunition;


export interface ShipmentItem {
  id: string; 
  name: string; 
  itemType: InventoryItemType;
  quantity: number;
  caliber?: SupportedCaliber;
  model?: string; 
  serialNumber?: string; 
  capacity?: number; 
}

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
  date: string; 
  typeId: string; 
  items: ShipmentItem[];
  notes?: string;
  supplier?: string; 
  trackingNumber?: string;
  sourceDepotId?: DepotId; 
  destinationDepotId?: DepotId; 
  lastUpdated: string;
}


export interface MaintenanceLog {
  id:string;
  date: string; 
  description: string;
  statusChangeFrom: MaintenanceItemStatus;
  statusChangeTo: MaintenanceItemStatus;
  technician?: string;
  partsUsed?: string; 
}

export interface AmmunitionUsageLog {
  id: string;
  date: string; 
  ammunitionId: string; 
  quantityUsed: number;
  depotId: DepotId;
  purpose?: string; 
  userId?: string; 
  notes?: string;
}

export interface AmmunitionDailyUsageLog {
  id: string;
  date: string; 
  personnelCount: number;
  usageScenarioId?: string; 
  used_9x19mm: number;
  used_5_56x45mm: number;
  used_7_62x39mm: number;
  used_7_62x51mm: number;
  notes?: string;
}


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
  { value: 'status_is', label: 'Durumu Şöyle Olduğunda', applicableTo: ['firearm', 'magazine'] },
];

export const ALERT_SEVERITIES: AlertSeverity[] = ['Yüksek', 'Orta', 'Düşük'];


export interface AlertDefinition {
  id: string;
  name: string;
  description?: string;
  entityType: AlertEntityType;
  conditionType: AlertConditionType;
  depotId?: DepotId; 
  caliberFilter?: SupportedCaliber; 
  thresholdValue?: number; 
  statusFilter?: FirearmStatus | MagazineStatus; 
  daysBeforeMaintenance?: number; 
  
  severity: AlertSeverity;
  messageTemplate: string; 
  isActive: boolean;
  lastUpdated: string; 
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
export type AlertDefinitionsDb = AlertDefinition[];

