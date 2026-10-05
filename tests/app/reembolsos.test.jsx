import React from "react";
import { render, screen } from "@testing-library/react";

import ReembolsosPage from "@/app/reembolsos/page.jsx";

describe("Refund policy page", () => {
  it("states consumed credits are non-refundable", () => {
    render(React.createElement(ReembolsosPage));
    expect(
      screen.getByText(/una vez utilizados no son reembolsables/i),
    ).toBeInTheDocument();
  });

  it("offers a refund channel for unused credits", () => {
    render(React.createElement(ReembolsosPage));
    const links = screen.getAllByRole("link", {
      name: /facturacion@casa-mx\.com/i,
    });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "mailto:facturacion@casa-mx.com");
    }
    expect(screen.getByText(/no los has utilizado/i)).toBeInTheDocument();
  });

  it("preserves statutory consumer rights", () => {
    render(React.createElement(ReembolsosPage));
    expect(screen.getByText(/Profeco/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Ley Federal de Protección al Consumidor/i),
    ).toBeInTheDocument();
  });
});
