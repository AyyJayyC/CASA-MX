import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Modal } from "@/components/ui/Modal";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(
      <Modal open={false} onClose={() => {}} title="Publicar">
        Contenido
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders an accessible dialog with a labelled title", () => {
    render(
      <Modal open onClose={() => {}} title="Publicar propiedad">
        Contenido
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    const heading = screen.getByRole("heading", { name: "Publicar propiedad" });
    expect(dialog).toHaveAttribute("aria-labelledby", heading.id);
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Cerrar">
        x
      </Modal>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when the backdrop is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Fondo">
        x
      </Modal>,
    );
    fireEvent.click(screen.getByTestId("modal-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when the panel is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Panel">
        x
      </Modal>,
    );
    fireEvent.click(screen.getByTestId("modal-panel"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("moves focus into the dialog", () => {
    render(
      <Modal open onClose={() => {}} title="Foco">
        x
      </Modal>,
    );
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(
      true,
    );
  });

  it("renders a footer when provided", () => {
    render(
      <Modal
        open
        onClose={() => {}}
        title="Con pie"
        footer={<button type="button">Guardar</button>}
      >
        x
      </Modal>,
    );
    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
  });
});

describe("Tabs", () => {
  const items = [
    { value: "a", label: "Ofertas", content: "Panel de ofertas" },
    { value: "b", label: "Solicitudes", content: "Panel de solicitudes" },
    { value: "c", label: "Contratos", content: "Panel de contratos" },
  ];

  it("marks the active tab and shows its panel", () => {
    render(<Tabs value="a" onValueChange={() => {}} items={items} />);
    expect(screen.getByRole("tab", { name: "Ofertas" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel de ofertas");
  });

  it("calls onValueChange when a tab is clicked", () => {
    const onChange = vi.fn();
    render(<Tabs value="a" onValueChange={onChange} items={items} />);
    fireEvent.click(screen.getByRole("tab", { name: "Solicitudes" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("moves with arrow keys and wraps", () => {
    const onChange = vi.fn();
    render(<Tabs value="c" onValueChange={onChange} items={items} />);
    fireEvent.keyDown(screen.getByRole("tab", { name: "Contratos" }), {
      key: "ArrowRight",
    });
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("supports Home and End", () => {
    const onChange = vi.fn();
    render(<Tabs value="b" onValueChange={onChange} items={items} />);
    const tab = screen.getByRole("tab", { name: "Solicitudes" });
    fireEvent.keyDown(tab, { key: "Home" });
    expect(onChange).toHaveBeenCalledWith("a");
    fireEvent.keyDown(tab, { key: "End" });
    expect(onChange).toHaveBeenCalledWith("c");
  });

  it("links each tab to its panel", () => {
    render(<Tabs value="a" onValueChange={() => {}} items={items} />);
    const tab = screen.getByRole("tab", { name: "Ofertas" });
    const panel = screen.getByRole("tabpanel");
    expect(tab).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", tab.id);
  });
});

describe("Table", () => {
  it("renders semantic table roles", () => {
    render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Propiedad</TableHeaderCell>
            <TableHeaderCell>Precio</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Casa Reforma</TableCell>
            <TableCell>$2,500,000</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Propiedad" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Casa Reforma" })).toBeInTheDocument();
  });

  it("wraps the table in a horizontal scroll container", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("table").parentElement?.className).toContain(
      "overflow-x-auto",
    );
  });
});
