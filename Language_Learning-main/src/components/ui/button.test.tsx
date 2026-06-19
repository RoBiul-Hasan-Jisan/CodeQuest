import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@/test/test-utils";

import { Button } from "./button";



describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await screen.getByRole("button").click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies variant class", () => {
    render(<Button variant="brand">Brand</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-ds-green");
  });

  it("applies size class", () => {
    render(<Button size="sm">Small</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("h-8");
  });

  it("renders as a child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "Link Button" });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
  });

  it("renders default variant by default", () => {
    render(<Button>Default</Button>);
    expect(screen.getByRole("button").className).toContain("bg-primary");
  });

  it("passes additional className", () => {
    render(<Button className="my-custom-class">Styled</Button>);
    expect(screen.getByRole("button").className).toContain("my-custom-class");
  });
});
