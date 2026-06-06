import { updateMockOraclePrices } from "@/lib/server/mock-oracle";

type UpdateOracleRequest = {
  wethUsd?: unknown;
  wbtcUsd?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UpdateOracleRequest;

    if (typeof body.wethUsd !== "string" || typeof body.wbtcUsd !== "string") {
      return Response.json(
        { error: "wethUsd and wbtcUsd must be provided as strings." },
        { status: 400 },
      );
    }

    return Response.json(
      await updateMockOraclePrices({
        wethUsd: body.wethUsd,
        wbtcUsd: body.wbtcUsd,
      }),
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update local mock oracle prices.",
      },
      { status: 503 },
    );
  }
}
