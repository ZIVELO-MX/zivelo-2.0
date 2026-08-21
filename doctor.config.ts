const doctorConfig = {
  ignore: {
    files: [
      // Archived prototype assets are visual references, not application code.
      "reference/**",
    ],
    overrides: [
      {
        // Generated Supabase types intentionally expose the complete schema API.
        files: ["src/lib/supabase/database.types.ts"],
        rules: ["deslop/unused-export"],
      },
      {
        // These clients are the supported browser/server integration boundary
        // and remain ready for upcoming authenticated flows.
        files: [
          "src/lib/supabase/client.ts",
          "src/lib/supabase/server.ts",
        ],
        rules: ["deslop/unused-file"],
      },
      {
        // This immutable migration disables RLS only on a legacy table that it
        // immediately drops. Current tables enable RLS and have pgTAP coverage.
        files: ["supabase/migrations/20260722030000_users_table.sql"],
        rules: ["react-doctor/supabase-rls-policy-risk"],
      },
    ],
  },
};

export default doctorConfig;
