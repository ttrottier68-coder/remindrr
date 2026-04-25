import type { Invoice, Client, UserSettings } from '../types';

export type { UserSettings };

const SETTINGS_KEY = 'remindrr_settings';
const INVOICES_KEY = 'remindrr_invoices';
const CLIENTS_KEY  = 'remindrr_clients';
const DATA_SERVER  = 'https://remindrr.onrender.com';

function safe
