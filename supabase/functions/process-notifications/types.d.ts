// Type declarations for Deno runtime
// This file is only for TypeScript checking, not used at runtime

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};
