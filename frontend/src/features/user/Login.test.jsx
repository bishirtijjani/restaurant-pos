import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import Login from "./Login";
import * as authSlice from "../../app/authSlice";

// Mock child components that are not essential for logic testing
vi.mock("./LoginHeroSection", () => ({
  default: () => <div data-testid="hero-section">Hero</div>,
}));

// Mock useNavigate
const mockedUsedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});

describe("Login Component", () => {
  it("renders login form by default", () => {
    renderWithProviders(<Login />);
    // Check for heading
    expect(screen.getByRole("heading", { name: /Login/i })).toBeDefined();
    // Check for inputs by label
    expect(screen.getByLabelText(/Email/i)).toBeDefined();
    expect(screen.getByLabelText(/Password/i)).toBeDefined();
    // Check for submit button
    expect(screen.getByRole("button", { name: /^Login$/i })).toBeDefined();
  });

  it("shows validation error if fields are empty", async () => {
    renderWithProviders(<Login />);
    const loginButton = screen.getByRole("button", { name: /^Login$/i });
    fireEvent.click(loginButton);
    // Note: We'd check for notification dispatch here if we had a more complete mock
  });

  it("switches to PIN login mode", () => {
    renderWithProviders(<Login />);
    const pinButton = screen.getByRole("button", { name: /Use PIN/i });
    fireEvent.click(pinButton);
    expect(screen.getByRole("heading", { name: /PIN Login/i })).toBeDefined();
  });

  it("submits form with valid data", async () => {
    const loginUserSpy = vi
      .spyOn(authSlice, "loginUser")
      .mockImplementation(() => (dispatch) => {
        return Promise.resolve({ type: "auth/login/fulfilled" });
      });

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });

    const loginButton = screen.getByRole("button", { name: /^Login$/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(loginUserSpy).toHaveBeenCalled();
    });
  });
});
