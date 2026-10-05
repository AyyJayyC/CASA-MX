import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MakeOfferModal from "@/components/MakeOfferModal.jsx";

describe("MakeOfferModal privacy notice", () => {
  it("links to the privacy notice on the offer form", async () => {
    render(React.createElement(MakeOfferModal, { propertyId: "p1", askingPrice: 1000 }));
    await userEvent.click(
      screen.getByRole("button", { name: /hacer una oferta/i }),
    );
    const link = screen.getByRole("link", { name: /aviso de privacidad/i });
    expect(link).toHaveAttribute("href", "/aviso-legal");
  });
});
