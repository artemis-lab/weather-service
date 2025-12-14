declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CORS_ORIGIN?: string;
      NODE_ENV: "development" | "production" | "test";
      PORT?: string;
    }
  }
}

export {};
