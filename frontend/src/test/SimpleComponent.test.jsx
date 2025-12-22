import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";

const SimpleComponent = () => <div>Hello Test</div>;

describe("SimpleComponent", () => {
  it('should render "Hello Test"', () => {
    render(<SimpleComponent />);
    expect(screen.getByText("Hello Test")).toBeInTheDocument();
  });
});
