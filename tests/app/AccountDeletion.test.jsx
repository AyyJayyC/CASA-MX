import React from "react";
import { vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AccountDeletion from "@/components/AccountDeletion";

const mockExport = vi.fn();
const mockDelete = vi.fn();
const replace = vi.fn();

vi.mock("@/lib/api/users", () => ({
  exportMyData: (...args) => mockExport(...args),
  deleteMyAccount: (...args) => mockDelete(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

describe("AccountDeletion (ARCO)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExport.mockResolvedValue({ profile: { id: "u1" } });
    mockDelete.mockResolvedValue({ success: true });
    global.URL.createObjectURL = vi.fn(() => "blob:mock");
    global.URL.revokeObjectURL = vi.fn();
    HTMLAnchorElement.prototype.click = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("renders export and delete controls plus a retention note", () => {
    render(<AccountDeletion />);
    expect(screen.getByText("Exportar mis datos")).toBeInTheDocument();
    expect(screen.getByText("Eliminar cuenta")).toBeInTheDocument();
    expect(screen.getByText(/anonimizamos/i)).toBeInTheDocument();
  });

  it("exports the requester's data", async () => {
    render(<AccountDeletion />);
    fireEvent.click(screen.getByText("Exportar mis datos"));
    await waitFor(() => expect(mockExport).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByText(/descarga iniciada/i)).toBeInTheDocument(),
    );
  });

  it("deletes the account after confirmation and redirects home", async () => {
    render(<AccountDeletion />);
    fireEvent.click(screen.getByText("Eliminar cuenta"));
    await waitFor(() => expect(mockDelete).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  });

  it("does not delete when the user cancels the confirmation", () => {
    window.confirm.mockReturnValue(false);
    render(<AccountDeletion />);
    fireEvent.click(screen.getByText("Eliminar cuenta"));
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
