import { NextResponse } from "next/server";
import { createErrorLog } from "./logger";

export function withErrorLogging(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error: any) {
      console.error("API Error:", error);
      
      const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
      const userAgent = req.headers.get("user-agent") || "unknown";
      const { pathname } = new URL(req.url);

      await createErrorLog(
        error.message || "Unknown error",
        error.stack,
        pathname,
        req.method,
        500,
        ipAddress,
        userAgent
      );

      return NextResponse.json(
        { error: "Internal Server Error", message: error.message },
        { status: 500 }
      );
    }
  };
}
