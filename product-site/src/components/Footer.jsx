import { Mail, Phone, MapPin, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--color-bg-elevated)",
        borderTop: "1px solid var(--color-border)",
        padding: "var(--space-16) 0 var(--space-8)",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "var(--space-12)",
            marginBottom: "var(--space-12)",
          }}
        >
          {/* Company Info */}
          <div>
            <div
              style={{
                fontSize: "var(--font-size-2xl)",
                fontWeight: 700,
                marginBottom: "var(--space-4)",
              }}
            >
              RestaurantOS
            </div>
            <p
              style={{
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
                marginBottom: "var(--space-6)",
              }}
            >
              Operations-first restaurant software. No contracts. No BS.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: 600,
                marginBottom: "var(--space-4)",
              }}
            >
              Contact Us
            </h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              <a
                href="mailto:hello@restaurantos.com"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  color: "var(--color-text-secondary)",
                  textDecoration: "none",
                  transition: "color var(--transition-fast)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--color-accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--color-text-secondary)")
                }
              >
                <Mail size={16} />
                hello@restaurantos.com
              </a>
              <a
                href="tel:+1234567890"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  color: "var(--color-text-secondary)",
                  textDecoration: "none",
                  transition: "color var(--transition-fast)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--color-accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--color-text-secondary)")
                }
              >
                <Phone size={16} />
                (555) 123-4567
              </a>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "var(--space-2)",
                  color: "var(--color-text-secondary)",
                }}
              >
                <MapPin size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
                <span>
                  123 Main St, Suite 100
                  <br />
                  San Francisco, CA 94102
                </span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: 600,
                marginBottom: "var(--space-4)",
              }}
            >
              Quick Links
            </h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              {[
                "Privacy Policy",
                "Terms of Service",
                "Security",
                "Documentation",
              ].map((link) => (
                <a
                  key={link}
                  href="#"
                  style={{
                    color: "var(--color-text-secondary)",
                    textDecoration: "none",
                    transition: "color var(--transition-fast)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--color-accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color =
                      "var(--color-text-secondary)")
                  }
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "var(--space-8)",
            borderTop: "1px solid var(--color-border)",
            flexWrap: "wrap",
            gap: "var(--space-4)",
          }}
        >
          <div
            style={{
              color: "var(--color-text-muted)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            © 2025 RestaurantOS. All rights reserved.
          </div>

          <div style={{ display: "flex", gap: "var(--space-4)" }}>
            <a
              href="#"
              style={{
                color: "var(--color-text-muted)",
                transition: "color var(--transition-fast)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-text-muted)")
              }
            >
              <Linkedin size={20} />
            </a>
            <a
              href="#"
              style={{
                color: "var(--color-text-muted)",
                transition: "color var(--transition-fast)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-text-muted)")
              }
            >
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
