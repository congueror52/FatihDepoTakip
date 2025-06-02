
export type LogActionType = "CREATE" | "UPDATE" | "DELETE" | "LOG_USAGE" | "LOG_MAINTENANCE";
export type LogEntityType =
  | "FirearmDefinition"
  | "Firearm"
  | "Magazine"
  | "Ammunition"
  | "OtherMaterial"
  | "Depot"
  | "UsageScenario"
  | "DailyAmmunitionUsage"
  | "Shipment"
  | "ShipmentTypeDefinition"
  | "MaintenanceLog"
  | "AmmunitionUsage"
  | "AlertDefinition"
  | "AmmunitionStandardConsumptionRate"; // New Entity Type

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO string
  actor: {
    id: string;
    name: string; // e.g., "Admin Kullanıcısı"
    type: "USER" | "SYSTEM";
  };
  actionType: LogActionType;
  entityType: LogEntityType;
  entityId?: string;
  status: "SUCCESS" | "FAILURE";
  details?: any;
  previousDetails?: any; // For updates, if needed, though can be complex
  errorMessage?: string;
}
