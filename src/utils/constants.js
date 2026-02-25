import { env } from "~/config/environment";

// Những domain được cho phép truy cập tới tài nguyên của server
export const WHITELIST_DOMAINS = [
  // 'http://localhost:3000' // đã cho phép dev ở env.BUILD_MODE === 'dev'

  // deploy lên product
  // ...domain
  "https://moviehub.eziio.site",
];

export const BOARD_TYPES = {
  PUBLIC: "public",
  PRIVATE: "private",
};

export const WEBSITE_DOMAINS =
  env.BUILD_MODE === "production"
    ? env.WEBSITE_DOMAIN_PRODUCTION
    : env.WEBSITE_DOMAIN_DEVELOPMENT;

export const DEFAULT_VALUE = 1;
export const DEFAULT_ITEMS_PER_PAGE = 12;
