import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import RentalApplicationForm from "@/components/RentalApplicationForm.jsx";

describe("RentalApplicationForm privacy notice", () => {
  it("links to the privacy notice", () => {
    render(
      React.createElement(RentalApplicationForm, {
        propertyId: "p1",
        monthlyRent: 1000,
        onSuccess: vi.fn(),
      }),
    );
    const link = screen.getByRole("link", { name: /aviso de privacidad/i });
    expect(link).toHaveAttribute("href", "/aviso-legal");
  });
});
