export const ROLES = {
  ADMIN: "Administrator",
  CONTENT_CREATOR: "Content Creator",
  MARKETING: "Marketing Team",
  BUSINESS: "Business User",
};

export const PAGE_ACCESS = {
  [ROLES.ADMIN]: [
    "/dashboard",
    "/users",
    "/social-accounts",
    "/scheduler",
    "/drafts",
    "/calendar",
    "/queue",
    "/analytics",
    "/campaigns",
    "/profile",
    "/settings",
  ],
  [ROLES.CONTENT_CREATOR]: [
    "/dashboard",
    "/social-accounts",
    "/scheduler",
    "/drafts",
    "/calendar",
    "/queue",
    "/profile",
    "/settings",
  ],
  [ROLES.MARKETING]: [
    "/dashboard",
    "/analytics",
    "/campaigns",
    "/profile",
    "/settings",
  ],
  [ROLES.BUSINESS]: [
    "/dashboard",
    "/social-accounts",
    "/scheduler",
    "/analytics",
    "/campaigns",
    "/profile",
    "/settings",
  ],
};

export const ROLE_PAGE_TITLES = {
  [ROLES.ADMIN]: "Full access",
  [ROLES.CONTENT_CREATOR]: "Content operations",
  [ROLES.MARKETING]: "Campaign and analytics",
  [ROLES.BUSINESS]: "Business oversight",
};