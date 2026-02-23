export type CollectionVisibility = "private" | "shared" | "public";

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  visibility: CollectionVisibility;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  listing_id: string;
  price_at_added: number | null;
  notes: string | null;
  added_at: string;
}

// Collection item with joined listing data for display
export interface CollectionItemWithListing extends CollectionItem {
  listing: {
    id: string;
    name: string;
    slug: string;
    breed: string | null;
    price: number | null;
    location_state: string | null;
    status: string;
    primary_image_url: string | null;
    height_hands: number | null;
    age_years: number | null;
    gender: string | null;
  };
  price_change_cents: number | null; // current price - price_at_added
}

// Collection with items for detail page
export interface CollectionWithItems extends Collection {
  items: CollectionItemWithListing[];
  owner: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}
