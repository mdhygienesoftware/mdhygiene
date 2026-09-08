// GENERATED via `mcp__Supabase__generate_typescript_types` — regenerate after schema changes,
// don't hand-edit.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      admin_profiles: {
        Row: { created_at: string; full_name: string | null; id: string };
        Insert: { created_at?: string; full_name?: string | null; id: string };
        Update: { created_at?: string; full_name?: string | null; id?: string };
        Relationships: [];
      };
      brands: {
        Row: {
          meta_description: string | null
          meta_title: string | null
          accent_color: string | null;
          created_at: string;
          id: string;
          logo_url: string | null;
          name: string;
          slug: string;
          sort_order: number;
          tagline: string | null;
        };
        Insert: {
          meta_description?: string | null
          meta_title?: string | null
          accent_color?: string | null;
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          name: string;
          slug: string;
          sort_order?: number;
          tagline?: string | null;
        };
        Update: {
          meta_description?: string | null
          meta_title?: string | null
          accent_color?: string | null;
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          name?: string;
          slug?: string;
          sort_order?: number;
          tagline?: string | null;
        };
        Relationships: [];
      };
      distributor_inquiries: {
        Row: {
          company_name: string;
          contact_name: string;
          created_at: string;
          email: string;
          id: string;
          inquiry_type: string;
          message: string;
          phone: string;
          region: string | null;
          status: string;
        };
        Insert: {
          company_name: string;
          contact_name: string;
          created_at?: string;
          email: string;
          id?: string;
          inquiry_type: string;
          message: string;
          phone: string;
          region?: string | null;
          status?: string;
        };
        Update: {
          company_name?: string;
          contact_name?: string;
          created_at?: string;
          email?: string;
          id?: string;
          inquiry_type?: string;
          message?: string;
          phone?: string;
          region?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      hero_slides: {
        Row: {
          duration_seconds: number
          created_at: string;
          cta_href: string | null;
          cta_label: string | null;
          eyebrow: string | null;
          headline: string;
          id: string;
          is_active: boolean;
          media_type: string;
          media_url: string;
          poster_url: string | null;
          sort_order: number;
          subheading: string | null;
        };
        Insert: {
          duration_seconds?: number
          created_at?: string;
          cta_href?: string | null;
          cta_label?: string | null;
          eyebrow?: string | null;
          headline: string;
          id?: string;
          is_active?: boolean;
          media_type: string;
          media_url: string;
          poster_url?: string | null;
          sort_order?: number;
          subheading?: string | null;
        };
        Update: {
          duration_seconds?: number
          created_at?: string;
          cta_href?: string | null;
          cta_label?: string | null;
          eyebrow?: string | null;
          headline?: string;
          id?: string;
          is_active?: boolean;
          media_type?: string;
          media_url?: string;
          poster_url?: string | null;
          sort_order?: number;
          subheading?: string | null;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_name_snapshot: string;
          product_variant_id: string | null;
          quantity: number;
          unit_price_snapshot: number | null;
          variant_label_snapshot: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_name_snapshot: string;
          product_variant_id?: string | null;
          quantity: number;
          unit_price_snapshot?: number | null;
          variant_label_snapshot?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_name_snapshot?: string;
          product_variant_id?: string | null;
          quantity?: number;
          unit_price_snapshot?: number | null;
          variant_label_snapshot?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          company_name: string;
          contact_name: string;
          created_at: string;
          email: string;
          id: string;
          notes: string | null;
          phone: string;
          region: string | null;
          status: string;
        };
        Insert: {
          company_name: string;
          contact_name: string;
          created_at?: string;
          email: string;
          id?: string;
          notes?: string | null;
          phone: string;
          region?: string | null;
          status?: string;
        };
        Update: {
          company_name?: string;
          contact_name?: string;
          created_at?: string;
          email?: string;
          id?: string;
          notes?: string | null;
          phone?: string;
          region?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      product_categories: {
        Row: { description: string | null; id: string; name: string; slug: string };
        Insert: { description?: string | null; id?: string; name: string; slug: string };
        Update: { description?: string | null; id?: string; name?: string; slug?: string };
        Relationships: [];
      };
      product_variants: {
        Row: {
          case_qty: number | null;
          id: string;
          mrp: number | null;
          net_price: number | null;
          pack_count: string | null;
          product_id: string;
          size_label: string;
          sku: string | null;
          sort_order: number;
          stock_status: string;
        };
        Insert: {
          case_qty?: number | null;
          id?: string;
          mrp?: number | null;
          net_price?: number | null;
          pack_count?: string | null;
          product_id: string;
          size_label: string;
          sku?: string | null;
          sort_order?: number;
          stock_status?: string;
        };
        Update: {
          case_qty?: number | null;
          id?: string;
          mrp?: number | null;
          net_price?: number | null;
          pack_count?: string | null;
          product_id?: string;
          size_label?: string;
          sku?: string | null;
          sort_order?: number;
          stock_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          badges: string[];
          brand_id: string | null;
          catalog_type: string;
          category_id: string | null;
          created_at: string;
          description: string | null;
          features: string[];
          id: string;
          image_url: string | null;
          is_active: boolean;
          is_featured: boolean;
          name: string;
          slug: string;
          sort_order: number;
        };
        Insert: {
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          badges?: string[];
          brand_id?: string | null;
          catalog_type?: string;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          features?: string[];
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          name: string;
          slug: string;
          sort_order?: number;
        };
        Update: {
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          badges?: string[];
          brand_id?: string | null;
          catalog_type?: string;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          features?: string[];
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          name?: string;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "product_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      team_members: {
        Row: {
          card_enabled: boolean
          intro: string | null
          slug: string | null
          whatsapp: string | null
          bio: string | null
          created_at: string
          department: string | null
          designation: string | null
          email: string | null
          id: string
          is_active: boolean
          joined_year: string | null
          linkedin_url: string | null
          location: string | null
          name: string
          phone: string | null
          photo_url: string | null
          show_on_website: boolean
          sort_order: number
        }
        Insert: {
          card_enabled?: boolean
          intro?: string | null
          slug?: string | null
          whatsapp?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          joined_year?: string | null
          linkedin_url?: string | null
          location?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          show_on_website?: boolean
          sort_order?: number
        }
        Update: {
          card_enabled?: boolean
          intro?: string | null
          slug?: string | null
          whatsapp?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          joined_year?: string | null
          linkedin_url?: string | null
          location?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          show_on_website?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      seo_settings: {
        Row: { key: string; updated_at: string; value: Json }
        Insert: { key: string; updated_at?: string; value: Json }
        Update: { key?: string; updated_at?: string; value?: Json }
        Relationships: []
      }
      site_settings: {
        Row: { key: string; updated_at: string; value: Json };
        Insert: { key: string; updated_at?: string; value: Json };
        Update: { key?: string; updated_at?: string; value?: Json };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { is_admin: { Args: never; Returns: boolean } };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type DefaultSchema = Database["public"];

export type Tables<T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])> =
  (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never;

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T] extends {
  Insert: infer I;
}
  ? I
  : never;

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T] extends {
  Update: infer U;
}
  ? U
  : never;
