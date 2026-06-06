import { stepDownMockOraclePrices } from "@/lib/server/mock-oracle";

export async function POST() {
  try {
    return Response.json(await stepDownMockOraclePrices());
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to simulate a local oracle price drop.",
      },
      { status: 503 },
    );
  }
}
