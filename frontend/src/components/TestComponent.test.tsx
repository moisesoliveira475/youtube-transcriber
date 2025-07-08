import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TestComponent } from "./TestComponent";

describe("TestComponent básico", () => {
  it("deve renderizar o texto corretamente", () => {
    render(<TestComponent />);
    expect(screen.getByText(/TestComponent OK/i)).toBeInTheDocument();
  });
});
