'use server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dataDir = path.join(process.cwd(), 'data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error);
    // Depending on the app's needs, you might want to throw this or handle it differently
  }
}
ensureDataDir(); // Call it once when the module loads

export async function readData<T>(fileName: string): Promise<T[]> {
  const filePath = path.join(dataDir, fileName);
  try {
    await fs.access(filePath); // Check if file exists
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as T[];
  } catch (error: any) {
    if (error.code === 'ENOENT') { // File not found
      // If file doesn't exist, create it with an empty array
      await writeData(fileName, []);
      return [];
    }
    console.error(`Error reading ${fileName}:`, error);
    // For other errors, you might want to rethrow or return a default/empty state
    // Depending on how critical this data is for app startup.
    // For now, returning empty array to prevent app crash on read errors post-creation.
    return []; 
  }
}

export async function writeData<T>(fileName: string, data: T[]): Promise<void> {
  const filePath = path.join(dataDir, fileName);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${fileName}:`, error);
    throw error; // Re-throw to be handled by caller
  }
}

export function generateId(): string {
  return uuidv4();
}
