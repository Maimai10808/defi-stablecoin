import { tickMockOraclePrices } from "@/lib/server/mock-oracle";

export async function POST() {
  try {
    return Response.json(await tickMockOraclePrices());
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update live mock oracle prices.",
      },
      { status: 503 },
    );
  }
}
