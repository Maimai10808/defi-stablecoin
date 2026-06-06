import { updateMockOraclePrices } from "@/lib/server/mock-oracle";

export async function POST() {
  try {
    return Response.json(
      await updateMockOraclePrices({ wethUsd: "2000", wbtcUsd: "45000" }),
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to reset local mock oracle prices.",
      },
      { status: 503 },
    );
  }
}
