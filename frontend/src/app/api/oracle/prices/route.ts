import { getMockOraclePrices } from "@/lib/server/mock-oracle";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await getMockOraclePrices());
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to read local mock oracle prices.",
      },
      { status: 503 },
    );
  }
}
