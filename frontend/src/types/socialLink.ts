// File: frontend/src/types/socialLink.ts

/** مطابق لـ app.schemas.social_link.SocialLinkCreateRequest. */
export interface SocialLinkCreateRequest {
  platform_name: string;
  url: string;
  display_order: number;
  is_active: boolean;
}

/** مطابق لـ app.schemas.social_link.SocialLinkUpdateRequest. */
export interface SocialLinkUpdateRequest {
  platform_name?: string;
  url?: string;
  display_order?: number;
  is_active?: boolean;
}

/** مطابق لـ app.schemas.social_link.SocialLinkOut. */
export interface SocialLinkOut {
  id: number;
  platform_name: string;
  url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}
