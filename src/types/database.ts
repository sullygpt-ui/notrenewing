export type UserRole = 'seller' | 'admin';
export type PayoutMethod = 'stripe' | 'paypal';
export type ListingStatus = 'pending_payment' | 'pending_verification' | 'active' | 'paused' | 'sold' | 'expired' | 'removed';
export type AITier = 'high' | 'medium' | 'low';
export type TransferStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'disputed';
export type DisputeOutcome = 'buyer_refunded' | 'seller_paid' | 'admin_decision';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type EngagementType = 'view' | 'save' | 'click';

export interface Profile {
  id: string;
  role: UserRole;
  stripe_customer_id: string | null;
  stripe_account_id: string | null;
  paypal_email: string | null;
  payout_method: PayoutMethod | null;
  reliability_score: number;
  is_suspended: boolean;
  monthly_listing_count: number;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  domain_name: string;
  tld: string;
  registrar: string | null;
  verification_token: string | null;
  verified_at: string | null;
  domain_age_months: number | null;
  expiration_date: string | null;
  ai_score: number | null;
  ai_tier: AITier | null;
  ai_reasoning: string | null;
  ai_scored_at: string | null;
  status: ListingStatus;
  is_sponsored: boolean;
  sponsored_until: string | null;
  admin_featured: boolean;
  admin_hidden: boolean;
  staff_pick: boolean;
  listed_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface Purchase {
  id: string;
  listing_id: string;
  buyer_email: string;
  stripe_payment_intent_id: string | null;
  amount_paid: number;
  processing_fee: number | null;
  seller_payout: number | null;
  transfer_status: TransferStatus;
  transfer_deadline: string | null;
  transfer_initiated_at: string | null;
  auth_code: string | null;
  transfer_notes: string | null;
  buyer_confirmation_deadline: string | null;
  auto_released: boolean;
  transfer_confirmed_at: string | null;
  dispute_reason: string | null;
  dispute_opened_at: string | null;
  dispute_resolved_at: string | null;
  dispute_outcome: DisputeOutcome | null;
  created_at: string;
}

export interface Payout {
  id: string;
  seller_id: string;
  amount: number;
  status: PayoutStatus;
  payout_method: string | null;
  stripe_transfer_id: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface ListingFee {
  id: string;
  seller_id: string;
  stripe_payment_intent_id: string | null;
  amount: number;
  domain_count: number;
  status: string;
  created_at: string;
}

export interface DomainEngagement {
  id: string;
  listing_id: string;
  event_type: EngagementType;
  session_id: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'> & { created_at?: string };
        Update: Partial<Profile>;
      };
      listings: {
        Row: Listing;
        Insert: Omit<Listing, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Listing>;
      };
      purchases: {
        Row: Purchase;
        Insert: Omit<Purchase, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Purchase>;
      };
      payouts: {
        Row: Payout;
        Insert: Omit<Payout, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Payout>;
      };
      listing_fees: {
        Row: ListingFee;
        Insert: Omit<ListingFee, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<ListingFee>;
      };
      domain_engagement: {
        Row: DomainEngagement;
        Insert: Omit<DomainEngagement, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<DomainEngagement>;
      };
    };
  };
}
