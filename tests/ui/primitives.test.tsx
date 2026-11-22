import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Field } from "@/components/ui/Field";

describe("Button", () => {
  it("renders its label and defaults to a non-submit button", () => {
    render(<Button>Publicar propiedad</Button>);
    const btn = screen.getByRole("button", { name: "Publicar propiedad" });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("type", "button");
  });

  it("applies the primary variant and md size by default", () => {
    render(<Button>Enviar</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-clay");
    expect(btn.className).toContain("h-11");
  });

  it("applies secondary and ghost variants", () => {
    const { rerender } = render(<Button variant="secondary">A</Button>);
    expect(screen.getByRole("button").className).toContain("border");
    rerender(<Button variant="ghost">A</Button>);
    expect(screen.getByRole("button").className).toContain("bg-transparent");
  });

  it("supports sm and lg sizes", () => {
    const { rerender } = render(<Button size="sm">A</Button>);
    expect(screen.getByRole("button").className).toContain("h-9");
    rerender(<Button size="lg">A</Button>);
    expect(screen.getByRole("button").className).toContain("h-12");
  });

  it("fires onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Guardar</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Guardar
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("blocks interaction and announces work while loading", () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Guardando
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("merges caller classes without dropping its own", () => {
    render(<Button className="w-full">Ancho</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("w-full");
    expect(btn.className).toContain("bg-clay");
  });

  it("exposes styles for links that cannot be a <button>", () => {
    expect(buttonStyles({ variant: "primary" })).toContain("bg-clay");
    expect(buttonStyles({ variant: "secondary", size: "sm" })).toContain(
      "h-9",
    );
  });
});

describe("Badge", () => {
  it("renders neutral by default", () => {
    render(<Badge>Borrador</Badge>);
    const badge = screen.getByText("Borrador");
    expect(badge.className).toContain("bg-sand");
  });

  it("renders a clay tone for promoted content", () => {
    render(<Badge tone="clay">PROMOCIONADO</Badge>);
    expect(screen.getByText("PROMOCIONADO").className).toContain("bg-clay");
  });

  it("renders success, warning and danger tones", () => {
    const { rerender } = render(<Badge tone="success">Verificado</Badge>);
    expect(screen.getByText("Verificado").className).toContain("green");
    rerender(<Badge tone="warning">Pendiente</Badge>);
    expect(screen.getByText("Pendiente").className).toContain("amber");
    rerender(<Badge tone="danger">Rechazado</Badge>);
    expect(screen.getByText("Rechazado").className).toContain("red");
  });
});

describe("Skeleton", () => {
  it("is hidden from assistive technology", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("accepts layout classes", () => {
    const { container } = render(<Skeleton className="h-6 w-24" />);
    expect(container.firstChild?.className).toContain("h-6");
    expect(container.firstChild?.className).toContain("animate-pulse");
  });
});

describe("EmptyState", () => {
  it("renders a title and description", () => {
    render(
      <EmptyState
        title="No se encontraron propiedades"
        description="Intenta con otros filtros."
      />,
    );
    expect(
      screen.getByRole("heading", { name: "No se encontraron propiedades" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Intenta con otros filtros.")).toBeInTheDocument();
  });

  it("renders an action when provided", () => {
    render(
      <EmptyState
        title="Sin resultados"
        action={<Button>Limpiar filtros</Button>}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Limpiar filtros" }),
    ).toBeInTheDocument();
  });
});

describe("Card", () => {
  it("renders children with surface styling", () => {
    render(
      <Card>
        <p>Contenido</p>
      </Card>,
    );
    const card = screen.getByText("Contenido").parentElement;
    expect(card?.className).toContain("bg-white");
    expect(card?.className).toContain("rounded-lg");
  });

  it("removes padding when asked", () => {
    render(<Card padding="none">Sin padding</Card>);
    const card = screen.getByText("Sin padding");
    expect(card.className).not.toContain("p-5");
  });

  it("merges caller classes", () => {
    render(<Card className="col-span-2">x</Card>);
    expect(screen.getByText("x").className).toContain("col-span-2");
  });
});

describe("Select", () => {
  it("renders options and forwards the change handler", () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Estado" onChange={onChange}>
        <option value="">Todos</option>
        <option value="sonora">Sonora</option>
      </Select>,
    );
    const select = screen.getByRole("combobox", { name: "Estado" });
    expect(screen.getAllByRole("option")).toHaveLength(2);
    fireEvent.change(select, { target: { value: "sonora" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("marks invalid selects", () => {
    render(<Select aria-label="Estado" invalid />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select.className).toContain("border-red");
  });
});

describe("Field", () => {
  it("associates the label with the control", () => {
    render(
      <Field id="email" label="Correo electrónico">
        <Input id="email" />
      </Field>,
    );
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
  });

  it("announces the error and links it to the control", () => {
    render(
      <Field id="email" label="Correo" error="Ingresa un correo válido">
        <Input id="email" invalid />
      </Field>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Ingresa un correo válido",
    );
    expect(screen.getByRole("alert")).toHaveAttribute("id", "email-error");
  });

  it("renders a hint when there is no error", () => {
    render(
      <Field id="phone" label="Teléfono" hint="10 dígitos">
        <Input id="phone" />
      </Field>,
    );
    expect(screen.getByText("10 dígitos")).toHaveAttribute("id", "phone-hint");
  });
});

describe("Input", () => {
  it("forwards standard input props", () => {
    render(<Input placeholder="Correo" name="email" />);
    const input = screen.getByPlaceholderText("Correo");
    expect(input).toHaveAttribute("name", "email");
  });

  it("marks invalid fields for assistive technology", () => {
    render(<Input invalid aria-describedby="email-error" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "email-error");
  });

  it("does not set aria-invalid when valid", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("renders the invalid border", () => {
    render(<Input invalid />);
    expect(screen.getByRole("textbox").className).toContain("border-red");
  });
});
