import React from "react";
import { vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import CreditPackages from "@/components/CreditPackages";
import { CREDIT_UNLOCK_COST } from "@/lib/credits";

vi.mock("@/lib/api/credits", () => ({
  getPackages: vi.fn(async () => ({ packages: [] })),
  fulfillPayment: vi.fn(),
}));

vi.mock("@/lib/queries/credits", () => ({
  useInvalidateCredits: () => vi.fn(),
}));

describe("B10 - displayed credit cost matches 10", () => {
  it("defines the shared unlock cost as 10", () => {
    expect(CREDIT_UNLOCK_COST).toBe(10);
  });

  it("shows '10 créditos' as the unlock cost (not 1)", async () => {
    render(<CreditPackages />);

    await waitFor(() =>
      expect(screen.getByText(/para qué sirven los créditos/i)).toBeInTheDocument(),
    );

    expect(screen.getByText("10 créditos")).toBeInTheDocument();
    expect(screen.queryByText("1 crédito")).toBeNull();
  });
});
