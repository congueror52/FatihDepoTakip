
'use server';
import type { AuditLogEntry, LogActionType, LogEntityType } from '@/types/audit';
import { readData, writeData, generateId } from '@/lib/data-utils';

const LOG_FILE = 'audit_log.json';
const ACTOR_ID_PLACEHOLDER = 'user_admin_01'; // Replace with actual user ID from auth in a real app
const ACTOR_NAME_PLACEHOLDER = 'Admin Kullanıcısı';

interface LogParams {
  actionType: LogActionType;
  entityType: LogEntityType;
  entityId?: string;
  status: "SUCCESS" | "FAILURE";
  details?: any;
  errorMessage?: string;
}

export async function logAction(params: LogParams): Promise<void> {
  try {
    const logs = await readData<AuditLogEntry>(LOG_FILE);
    
    const newLogEntry: AuditLogEntry = {
      id: await generateId(),
      timestamp: new Date().toISOString(),
      actor: {
        id: ACTOR_ID_PLACEHOLDER,
        name: ACTOR_NAME_PLACEHOLDER,
        type: "USER", // Assuming all actions are by users for now
      },
      actionType: params.actionType,
      entityType: params.entityType,
      entityId: params.entityId,
      status: params.status,
      details: params.details,
      errorMessage: params.errorMessage,
    };

    logs.push(newLogEntry);
    await writeData(LOG_FILE, logs);
  } catch (error) {
    console.error("Log kaydı oluşturulurken hata oluştu:", error);
    // Loglama hatası ana işlemi engellememeli
  }
}
