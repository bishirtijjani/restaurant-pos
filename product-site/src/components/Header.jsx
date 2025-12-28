import { Phone, Mail } from "lucide-react";

export default function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        backgroundColor: "var(--color-bg-primary)",
        borderBottom: "1px solid var(--color-border)",
        padding: "var(--space-4) 0",
        zIndex: 1000,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "var(--space-6)",
        }}
      >
        {/* Logo */}
        <div style={{ fontSize: "var(--font-size-xl)", fontWeight: 700 }}>
          RestaurantOS
        </div>

        {/* Contact Info */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-6)",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="tel:+1234567890"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              color: "var(--color-text-secondary)",
              textDecoration: "none",
              fontSize: "var(--font-size-sm)",
              transition: "color var(--transition-fast)",
            }}
            onMouseEnter={(e) => (e.target.style.color = "var(--color-accent)")}
            onMouseLeave={(e) =>
              (e.target.style.color = "var(--color-text-secondary)")
            }
          >
            <Phone size={16} />
            <span>(555) 123-4567</span>
          </a>

          <button
            className="btn btn-primary"
            style={{
              padding: "var(--space-3) var(--space-6)",
              fontSize: "var(--font-size-base)",
            }}
          >
            Start Free Trial
          </button>
        </div>
      </div>
    </header>
  );
}
