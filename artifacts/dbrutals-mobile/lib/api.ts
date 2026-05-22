const getBase = () => {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "";
};

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${getBase()}${path}`;
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export interface Route {
  id: string;
  name: string;
  code: string;
  shift: string;
  color?: string;
  deliveryPoints?: DeliveryPoint[];
}

export interface DeliveryPoint {
  code?: string;
  name?: string;
  delivery?: string;
  latitude?: number;
  longitude?: number;
  markerColor?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  description?: string;
  color?: string;
  type?: string;
}

export interface RoosterEntry {
  id: string;
  name: string;
  role?: string;
  shift?: string;
  day?: string;
  startTime?: string;
  endTime?: string;
}

export interface DeliveryRecord {
  id: string;
  routeId?: string;
  routeName?: string;
  date?: string;
  location?: string;
  notes?: string;
  status?: string;
}

export async function fetchRoutes(): Promise<Route[]> {
  const payload = await apiFetch<{ data?: Route[] } | Route[]>("/api/routes");
  const arr = Array.isArray(payload) ? payload : (payload as { data?: Route[] }).data ?? [];
  return arr;
}

export async function fetchCalendar(): Promise<CalendarEvent[]> {
  try {
    const payload = await apiFetch<{ data?: CalendarEvent[] } | CalendarEvent[]>("/api/calendar");
    const arr = Array.isArray(payload) ? payload : (payload as { data?: CalendarEvent[] }).data ?? [];
    return arr;
  } catch {
    return [];
  }
}

export async function fetchRooster(): Promise<{ resources: RoosterEntry[]; shifts: unknown[] }> {
  try {
    const payload = await apiFetch<{ resources?: RoosterEntry[]; shifts?: unknown[] }>("/api/rooster");
    return {
      resources: payload.resources ?? [],
      shifts: payload.shifts ?? [],
    };
  } catch {
    return { resources: [], shifts: [] };
  }
}

export async function fetchDeliveries(): Promise<DeliveryRecord[]> {
  try {
    const payload = await apiFetch<{ data?: DeliveryRecord[] } | DeliveryRecord[]>("/api/deliveries");
    const arr = Array.isArray(payload) ? payload : (payload as { data?: DeliveryRecord[] }).data ?? [];
    return arr;
  } catch {
    return [];
  }
}
