import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import POS from "./POS";
import * as menuItemsSlice from "../menuItems/menuItemsSlice";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  ShoppingBag: () => <div data-testid="icon-shopping-bag" />,
  UtensilsCrossed: () => <div data-testid="icon-utensils" />,
  Truck: () => <div data-testid="icon-truck" />,
  PlusCircle: () => <div data-testid="icon-plus" />,
  MinusCircle: () => <div data-testid="icon-minus" />,
  X: () => <div data-testid="icon-x" />,
  Search: () => <div data-testid="icon-search" />,
  User: () => <div data-testid="icon-user" />,
  StickyNote: () => <div data-testid="icon-sticky-note" />,
  Edit3: () => <div data-testid="icon-edit" />,
  Tag: () => <div data-testid="icon-tag" />,
}));

// Mock sub-components
vi.mock("./components/TaxBreakdown", () => ({
  default: () => <div data-testid="tax-breakdown" />,
}));
vi.mock("./components/DiscountSection", () => ({
  default: () => <div data-testid="discount-section" />,
}));
vi.mock("./components/DiscountBreakdown", () => ({
  default: () => <div data-testid="discount-breakdown" />,
}));
vi.mock("../../components/Common/CustomerSearch", () => ({
  default: () => <div data-testid="customer-search" />,
}));

// Mock permission hook
vi.mock("../../utils/permission", () => ({
  useAuth: () => ({
    can: () => true,
  }),
}));

// Mock PrinterService
vi.mock("../../services/PrinterService", () => ({
  printerService: {
    printReceipt: vi.fn(),
  },
}));

describe("POS Component", () => {
  const mockMenuItems = [
    {
      _id: "1",
      name: "Burger",
      price: 10,
      category: "Food",
      isAvailable: true,
    },
    { _id: "2", name: "Coke", price: 2, category: "Drinks", isAvailable: true },
  ];

  const preloadedState = {
    menuItems: { menuItems: mockMenuItems, loading: false },
    categories: {
      categories: [
        { _id: "c1", name: "Food" },
        { _id: "c2", name: "Drinks" },
      ],
      loading: false,
    },
    pos: {
      cart: [],
      orderType: "takeaway",
      customerDetails: { name: "", phone: "", address: "" },
      searchQuery: "",
      activeCategory: "All",
      orderDiscount: { enabled: false },
    },
    generalSettings: { generalSettings: { currency: { symbol: "$" } } },
  };

  it("renders POS with menu items", () => {
    renderWithProviders(<POS />, { preloadedState });
    expect(screen.getByText("Burger")).toBeDefined();
    expect(screen.getByText("Coke")).toBeDefined();
  });

  it("adds an item to the cart", async () => {
    renderWithProviders(<POS />, { preloadedState });

    const burgerItem = screen.getByText("Burger");
    fireEvent.click(burgerItem);

    // Check if item appears in cart (right side)
    // In the cart it renders CartItem which has the name too
    const cartItems = screen.getAllByText("Burger");
    expect(cartItems.length).toBe(2); // One in menu, one in cart
  });

  it("calculates totals correctly", () => {
    const stateWithCart = {
      ...preloadedState,
      pos: {
        ...preloadedState.pos,
        cart: [{ ...mockMenuItems[0], _id: "1", quantity: 2, addOnsTotal: 0 }],
      },
    };

    renderWithProviders(<POS />, { preloadedState: stateWithCart });

    // Use a more specific check or just check that it's present at least once
    const totals = screen.getAllByText(/20\.00/);
    expect(totals.length).toBeGreaterThan(0);
  });

  it("filters items by category", () => {
    renderWithProviders(<POS />, { preloadedState });

    const drinksFilter = screen.getByRole("button", { name: /Drinks/i });
    fireEvent.click(drinksFilter);

    expect(screen.queryByText("Burger")).toBeNull();
    expect(screen.getByText("Coke")).toBeDefined();
  });

  it("searches for items", () => {
    renderWithProviders(<POS />, { preloadedState });

    const searchInput = screen.getByPlaceholderText(/Search items.../i);
    fireEvent.change(searchInput, { target: { value: "Coke" } });

    expect(screen.queryByText("Burger")).toBeNull();
    expect(screen.getByText("Coke")).toBeDefined();
  });

  it("opens payment drawer on checkout", async () => {
    const stateWithCart = {
      ...preloadedState,
      pos: {
        ...preloadedState.pos,
        cart: [
          {
            ...mockMenuItems[0],
            _id: "1",
            name: "Burger",
            price: 10,
            quantity: 1,
            addOnsTotal: 0,
          },
        ],
      },
    };

    const { store } = renderWithProviders(<POS />, {
      preloadedState: stateWithCart,
    });

    // The button text is "Pay" followed by amount
    const checkoutButton = screen.getByRole("button", { name: /Pay/i });
    fireEvent.click(checkoutButton);

    const state = store.getState();
    expect(state.rightDrawer.isOpen).toBe(true);
    expect(state.rightDrawer.header).toBe("Payment Confirmation");
  });

  it("opens add-on selector modal for items with add-ons", () => {
    const itemWithAddOns = { ...mockMenuItems[0], addOnGroups: ["group1"] };
    const stateWithAddOnItem = {
      ...preloadedState,
      menuItems: { menuItems: [itemWithAddOns], loading: false },
    };

    const { store } = renderWithProviders(<POS />, {
      preloadedState: stateWithAddOnItem,
    });

    const burgerItem = screen.getByText("Burger");
    fireEvent.click(burgerItem);

    const state = store.getState();
    expect(state.modal.isOpen).toBe(true);
    expect(state.modal.title).toBe("Customize Burger");
  });

  it("toggles table selection based on order type", () => {
    renderWithProviders(<POS />, { preloadedState });

    // Default is takeaway (from preloadedState)
    expect(screen.queryByText(/Select Table/i)).toBeNull();

    // Switch to Dine-in
    const dineInButton = screen.getByRole("button", { name: /Dine-in/i });
    fireEvent.click(dineInButton);

    expect(screen.getByText(/Select Table/i)).toBeDefined();
  });
});
