import type { UserSettings, Invoice, Client } from '../types';

const KEYS = {
  settings: 'remindrr_settings',
  invoices: 'remindrr_invoices',
  clients: 'remindrr_clients',
};

export function getSettings(): UserSettings | null {
  const data = localStorage.getItem(KEYS.settings);
  return data ? JSON.parse(data) : null;
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export function getInvoices(): Invoice[] {
  const data = localStorage.getItem(KEYS.invoices);
  return data ? JSON.parse(data) : [];
}

export function saveInvoices(invoices: Invoice[]): void {
  localStorage.setItem(KEYS.invoices, JSON.stringify(invoices));
}

export function getClients(): Client[] {
  const data = localStorage.getItem(KEYS.clients);
  return data ? JSON.parse(data) : [];
}

export function saveClients(clients: Client[]): void {
  localStorage.setItem(KEYS.clients, JSON.stringify(clients));
}
