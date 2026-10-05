import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CookieConsentBanner from "@/components/CookieConsentBanner.jsx";

describe("CookieConsentBanner", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("shows the notice with a link to /cookie when not acknowledged", async () => {
    render(React.createElement(CookieConsentBanner));
    const link = await screen.findByRole("link", {
      name: /aviso de cookies/i,
    });
    expect(link).toHaveAttribute("href", "/cookie");
    expect(
      screen.getByRole("button", { name: /entendido/i }),
    ).toBeInTheDocument();
  });

  it("stores acknowledgement and hides on click", async () => {
    render(React.createElement(CookieConsentBanner));
    await userEvent.click(
      await screen.findByRole("button", { name: /entendido/i }),
    );
    expect(localStorage.getItem("casamx_cookie_ack")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /entendido/i }),
    ).toBeNull();
  });

  it("stays hidden when already acknowledged", () => {
    localStorage.setItem("casamx_cookie_ack", "2026-01-01T00:00:00.000Z");
    render(React.createElement(CookieConsentBanner));
    expect(
      screen.queryByRole("button", { name: /entendido/i }),
    ).toBeNull();
  });
});
