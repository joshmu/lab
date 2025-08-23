import { NextResponse } from "next/server";
import {
  loadNavigationTree,
  loadSearchIndex,
} from "../../../lib/experiment-processing/data-loader";

export async function GET() {
  try {
    const [navigationTree, searchIndex] = await Promise.all([
      loadNavigationTree(),
      loadSearchIndex(),
    ]);

    return NextResponse.json({
      navigationTree,
      searchIndex,
    });
  } catch (error) {
    console.error("Failed to load experiments:", error);
    return NextResponse.json(
      { error: "Failed to load experiments" },
      { status: 500 },
    );
  }
}
