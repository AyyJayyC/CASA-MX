import React from "react";
import { vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AdminCarouselPage from "@/app/admin/carousel/page.jsx";

const useAuthMock = vi.fn();

vi.mock("@/lib/auth/useAuth", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

describe("C8 - admin pages block non-admins", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ slides: [] }),
    }));
  });

  it("renders nothing for an authenticated non-admin", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      isHydrated: true,
      user: { roles: [{ type: "client", status: "approved" }] },
    });

    render(<AdminCarouselPage />);
    expect(screen.queryByText("Carrusel")).toBeNull();
  });

  it("renders the admin content for an admin", async () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      isHydrated: true,
      user: { roles: [{ type: "admin", status: "approved" }] },
    });

    render(<AdminCarouselPage />);
    await waitFor(() =>
      expect(screen.getByText("Carrusel")).toBeInTheDocument(),
    );
  });
});
