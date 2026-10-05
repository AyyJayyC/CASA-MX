import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

// Must be set before SocialLoginButtons is evaluated.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = "google-test";
  process.env.NEXT_PUBLIC_FACEBOOK_APP_ID = "fb-test";
  process.env.NEXT_PUBLIC_APPLE_CLIENT_ID = "apple-test";
});

vi.mock("@/lib/auth/useAuth", () => ({
  useAuth: () => ({
    loginWithGoogle: vi.fn(),
    loginWithFacebook: vi.fn(),
    loginWithApple: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import SocialLoginButtons from "@/components/SocialLoginButtons.jsx";

describe("SocialLoginButtons lazy provider loading", () => {
  it("does not request any provider script on page load", () => {
    render(React.createElement(SocialLoginButtons));
    expect(
      document.querySelector('script[src*="accounts.google.com"]'),
    ).toBeNull();
    expect(
      document.querySelector('script[src*="connect.facebook.net"]'),
    ).toBeNull();
    expect(
      document.querySelector('script[src*="appleid.cdn-apple.com"]'),
    ).toBeNull();
  });

  it("loads the Google SDK only after clicking Google", async () => {
    render(React.createElement(SocialLoginButtons));
    await userEvent.click(screen.getByRole("button", { name: /google/i }));
    expect(
      document.querySelector('script[src*="accounts.google.com"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('script[src*="connect.facebook.net"]'),
    ).toBeNull();
  });

  it("loads the Facebook SDK only after clicking Facebook", async () => {
    render(React.createElement(SocialLoginButtons));
    await userEvent.click(screen.getByRole("button", { name: /facebook/i }));
    expect(
      document.querySelector('script[src*="connect.facebook.net"]'),
    ).not.toBeNull();
  });

  it("loads the Apple SDK only after clicking Apple", async () => {
    render(React.createElement(SocialLoginButtons));
    await userEvent.click(screen.getByRole("button", { name: /apple/i }));
    expect(
      document.querySelector('script[src*="appleid.cdn-apple.com"]'),
    ).not.toBeNull();
  });
});
