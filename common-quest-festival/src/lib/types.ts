export type Category = "danse" | "rap" | "graffiti" | "dj" | "atelier" | "talk" | "soiree" | "autre";

export type EventRow = {
  id: string;
  slug: string;
  day_index: number;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  doors_time: string | null;
  category: Category;
  venue: string | null;
  address: string | null;
  price_label: string | null;
  price_from: number | null;
  ticket_url: string | null;
  video_url: string | null;
  is_free: boolean;
  is_pwyw: boolean;
  cover_url: string | null;
  is_published: boolean;
  is_highlight: boolean;
  sort_order: number;
};

export type EventTranslation = {
  event_id: string;
  locale: string;
  title: string;
  tagline: string | null;
  description: string | null;
  practical_info: string | null;
};

export type EventWithTranslation = EventRow & { t: EventTranslation | null };

export type Artist = {
  id: string;
  name: string;
  discipline: string | null;
  country: string | null;
  photo_url: string | null;
  instagram_url: string | null;
  is_headliner: boolean;
  sort_order: number;
};

export type TeamMember = {
  id: string;
  name: string;
  nickname: string | null;
  role_fr: string | null;
  role_en: string | null;
  role_es: string | null;
  quote_fr: string | null;
  quote_en: string | null;
  quote_es: string | null;
  photo_url: string | null;
  instagram_url: string | null;
  sort_order: number;
  is_published: boolean;
};

export type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  kind: string;
  sort_order: number;
};
