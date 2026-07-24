export const TOPICS = ["web", "restaurant", "pos", "other"] as const;
export type Topic = (typeof TOPICS)[number];

export const TOPIC_LABELS: Record<string, [string, string]> = {
  web: ["Desarrollo web", "Web development"],
  restaurant: ["Solución para restaurante", "Restaurant solution"],
  pos: ["Punto de venta", "Point of sale"],
  other: ["Algo más", "Something else"],
};

export const DELIVERY_STATUSES = ["pending", "sending", "sent", "failed"] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export interface NormalizedContact {
  id: string;
  name: string;
  company: string | null;
  email: string;
  topic: Topic;
  message: string;
  locale: "es" | "en";
}

export interface ContactResult {
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
}

export const LIMITS = {
  nameMax: 200,
  companyMax: 200,
  emailMax: 320,
  messageMax: 5000,
} as const;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;