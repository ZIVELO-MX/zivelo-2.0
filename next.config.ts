import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Root layout lives at [locale]/layout.tsx (a top-level dynamic segment),
  // so a nested not-found.tsx can't compose a consistent 404 shell — this is
  // exactly the case Next's docs call out for global-not-found.
  experimental: {
    globalNotFound: true,
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default withNextIntl(nextConfig);
