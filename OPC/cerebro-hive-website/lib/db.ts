import fs from "fs/promises";
import path from "path";

// Define the file path for data storage
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Define database interface structures
export interface DBProject {
  id: string;
  name: string;
  progress: number;
  status: "Completed" | "In Progress" | "Planned";
  lastUpdate: string;
  milestones: { name: string; date: string; status: "completed" | "active" | "pending" }[];
}

export interface DBInvoice {
  id: string;
  description: string;
  amount: string;
  status: string;
  date: string;
}

export interface DBDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
}

export interface DBEmployee {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: number;
  score: number;
  certified: boolean;
  lastActive: string;
}

export interface DBTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  date: string;
}

export interface DBLead {
  id: string;
  name: string;
  email: string;
  company: string;
  type: string;
  target?: string;
  score?: number;
  inputs?: Record<string, unknown>;
  createdAt: string;
}

export interface DBEnrollment {
  id: string;
  email: string;
  courseSlug: string;
  createdAt: string;
}

export interface DBContact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface DatabaseSchema {
  projects: DBProject[];
  invoices: DBInvoice[];
  documents: DBDocument[];
  employees: DBEmployee[];
  tickets: DBTicket[];
  leads: DBLead[];
  enrollments: DBEnrollment[];
  contacts: DBContact[];
}

// Initial seed data
const SEED_DATA: DatabaseSchema = {
  projects: [
    {
      id: "PRJ-001",
      name: "Enterprise RAG Pipeline & Semantic Knowledge Base",
      progress: 80,
      status: "In Progress",
      lastUpdate: "June 14, 2026",
      milestones: [
        { name: "SOP Document Ingestion & PII Filtering Pipeline", date: "May 10", status: "completed" },
        { name: "Vector Database Setup (Pinecone) & Schema Design", date: "May 25", status: "completed" },
        { name: "Custom LLM API Proxy Gateway Deployment", date: "June 08", status: "completed" },
        { name: "LangGraph Multi-Agent Retrieval Routing Layer", date: "June 25", status: "active" },
        { name: "User Interface Integration & UAT Validation", date: "July 15", status: "pending" }
      ]
    },
    {
      id: "PRJ-002",
      name: "Customer Support email Classifier & Auto-responder",
      progress: 100,
      status: "Completed",
      lastUpdate: "May 28, 2026",
      milestones: [
        { name: "Intent Classification Prompts Optimization", date: "April 05", status: "completed" },
        { name: "n8n Webhook Orchestration Development", date: "April 20", status: "completed" },
        { name: "Legacy ticketing API integration hooks", date: "May 12", status: "completed" },
        { name: "Validation sandbox test cycles & sign-off", date: "May 28", status: "completed" }
      ]
    }
  ],
  invoices: [
    { id: "INV-2026-004", description: "RAG Pipeline Sprint 2", amount: "$12,500.00", status: "Paid", date: "June 05, 2026" },
    { id: "INV-2026-003", description: "RAG Pipeline Setup & Ingestion", amount: "$15,000.00", status: "Paid", date: "May 10, 2026" },
    { id: "INV-2026-002", description: "Support Automation Completed Milestone", amount: "$18,500.00", status: "Paid", date: "May 01, 2026" },
    { id: "INV-2026-001", description: "Project Initiation Retainer", amount: "$20,000.00", status: "Paid", date: "April 01, 2026" }
  ],
  documents: [
    { id: "DOC-001", name: "Master Services Agreement (MSA)", type: "PDF", size: "2.4 MB", date: "April 01, 2026" },
    { id: "DOC-002", name: "Statement of Work (SOW) — AI Agent Pipelines", type: "PDF", size: "1.8 MB", date: "April 05, 2026" },
    { id: "DOC-003", name: "Technical Architecture Blueprint — RAG Gateway", type: "PDF", size: "4.2 MB", date: "May 18, 2026" },
    { id: "DOC-004", name: "Security Audit & PII Gateway Compliance Report", type: "PDF", size: "1.1 MB", date: "June 02, 2026" }
  ],
  employees: [
    { id: "EMP-101", name: "Sarah Connor", email: "sconnor@apex.com", course: "Building AI Agents with LangChain", progress: 100, score: 92, certified: true, lastActive: "June 14, 2026" },
    { id: "EMP-102", name: "John Connor", email: "jconnor@apex.com", course: "Building AI Agents with LangChain", progress: 85, score: 88, certified: false, lastActive: "June 14, 2026" },
    { id: "EMP-103", name: "Miles Dyson", email: "mdyson@apex.com", course: "LLM Engineering & RAG Architecture", progress: 60, score: 75, certified: false, lastActive: "June 12, 2026" },
    { id: "EMP-104", name: "Peter Silberman", email: "psilberman@apex.com", course: "Introduction to AI & Prompt Design", progress: 100, score: 95, certified: true, lastActive: "June 08, 2026" },
    { id: "EMP-105", name: "Marcus Wright", email: "mwright@apex.com", course: "LLM Engineering & RAG Architecture", progress: 45, score: 70, certified: false, lastActive: "June 13, 2026" }
  ],
  tickets: [],
  leads: [],
  enrollments: [],
  contacts: []
};

// Internal database cache
let cachedDb: DatabaseSchema | null = null;
let isWriting = false;

// Lock mechanism helper for safe concurrent writes
async function acquireWriteLock() {
  while (isWriting) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  isWriting = true;
}

function releaseWriteLock() {
  isWriting = false;
}

// Low-level DB initializer
async function initDb(): Promise<DatabaseSchema> {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    try {
      const fileData = await fs.readFile(DB_FILE, "utf-8");
      cachedDb = JSON.parse(fileData);
      return cachedDb!;
    } catch {
      // File doesn't exist, create it with seed data
      await fs.writeFile(DB_FILE, JSON.stringify(SEED_DATA, null, 2), "utf-8");
      cachedDb = JSON.parse(JSON.stringify(SEED_DATA));
      return cachedDb!;
    }
  } catch (err) {
    console.error("Failed to initialize database:", err);
    return SEED_DATA;
  }
}

// Expose public API
export async function getDb(): Promise<DatabaseSchema> {
  if (cachedDb) return cachedDb;
  return await initDb();
}

export async function saveDb(data: DatabaseSchema): Promise<void> {
  await acquireWriteLock();
  try {
    cachedDb = data;
    await fs.mkdir(DB_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } finally {
    releaseWriteLock();
  }
}

export async function getCollection<K extends keyof DatabaseSchema>(collectionName: K): Promise<DatabaseSchema[K]> {
  const db = await getDb();
  return db[collectionName];
}

export async function insertItem<K extends keyof DatabaseSchema>(
  collectionName: K,
  item: Omit<DatabaseSchema[K][number], "id" | "createdAt"> & { id?: string; createdAt?: string }
): Promise<DatabaseSchema[K][number]> {
  const db = await getDb();
  const newItem = {
    ...item,
    id: item.id || `ID-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    createdAt: item.createdAt || new Date().toISOString()
  } as DatabaseSchema[K][number];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (db[collectionName] as any[]).push(newItem);
  await saveDb(db);
  return newItem;
}

export async function updateItem<K extends keyof DatabaseSchema>(
  collectionName: K,
  id: string,
  updates: Partial<DatabaseSchema[K][number]>
): Promise<DatabaseSchema[K][number] | null> {
  const db = await getDb();
  const index = (db[collectionName] as any[]).findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updatedItem = {
    ...db[collectionName][index],
    ...updates
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (db[collectionName] as any[])[index] = updatedItem;
  await saveDb(db);
  return updatedItem;
}

export async function deleteItem<K extends keyof DatabaseSchema>(
  collectionName: K,
  id: string
): Promise<boolean> {
  const db = await getDb();
  const initialLength = db[collectionName].length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (db[collectionName] as any[]) = (db[collectionName] as any[]).filter((item) => item.id !== id);
  if (db[collectionName].length === initialLength) return false;
  await saveDb(db);
  return true;
}
