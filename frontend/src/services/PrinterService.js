// frontend/src/services/PrinterService.js

// ESC/POS Command Constants
const ESC = "\x1B";
const GS = "\x1D";
const LF = "\x0A";

const COMMANDS = {
  INIT: ESC + "@",
  CUT: GS + "V" + "\x41" + "\x00", // Full cut
  PARTIAL_CUT: GS + "V" + "\x41" + "\x01",
  TEXT_FORMAT: {
    NORMAL: ESC + "!" + "\x00",
    BOLD: ESC + "!" + "\x08",
    DOUBLE_HEIGHT: ESC + "!" + "\x10",
    DOUBLE_WIDTH: ESC + "!" + "\x20",
    DOUBLE_SIZE: ESC + "!" + "\x30",
  },
  ALIGN: {
    LEFT: ESC + "a" + "\x00",
    CENTER: ESC + "a" + "\x01",
    RIGHT: ESC + "a" + "\x02",
  },
  DRAWER_KICK: ESC + "p" + "\x00" + "\x19" + "\xFA", // Pin 2, 50ms on, 500ms off
};

class PrinterService {
  constructor() {
    this.device = null;
    this.interfaceNumber = 0;
    this.endpointOut = 0;
  }

  // Request USB Device
  async connect() {
    try {
      if (!navigator.usb) {
        throw new Error(
          "WebUSB not supported in this browser (Use Chrome/Edge)",
        );
      }

      // Request device - filters can be refined if we know specific vendor IDs
      // For now, allow any device to be selected, user must pick printer
      const device = await navigator.usb.requestDevice({ filters: [] });
      await this.openDevice(device);

      return {
        vendorId: device.vendorId,
        productId: device.productId,
        productName: device.productName || "Unknown Printer",
      };
    } catch (error) {
      console.error("Printer connection refused:", error);
      throw error;
    }
  }

  // Reconnect using saved IDs
  async reconnect(vendorId, productId) {
    try {
      if (!navigator.usb) return false;

      const devices = await navigator.usb.getDevices();
      const device = devices.find(
        (d) => d.vendorId === vendorId && d.productId === productId,
      );

      if (device) {
        await this.openDevice(device);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Reconnection failed:", error);
      return false;
    }
  }

  async openDevice(device) {
    await device.open();
    await device.selectConfiguration(1);

    // Find absolute endpoint for OUT transfer (Bulk Out)
    // Most printers use Interface 0, but we should find the correct one
    const interfaceObj = device.configuration.interfaces[0];
    await device.claimInterface(interfaceObj.interfaceNumber);

    // Find OUT endpoint
    const endpoint = interfaceObj.alternate.endpoints.find(
      (e) => e.direction === "out",
    );

    this.device = device;
    this.interfaceNumber = interfaceObj.interfaceNumber;
    this.endpointOut = endpoint ? endpoint.endpointNumber : 1; // Default to 1
  }

  async printReceipt(order, settings = {}) {
    if (!this.device) {
      throw new Error("Printer not connected");
    }

    try {
      const currency = settings.currencySymbol || "$";
      const width = settings.paperWidth === "58mm" ? 32 : 48; // Estimate chars per line

      let buffer = "";

      // Header
      buffer += COMMANDS.INIT;
      buffer += COMMANDS.ALIGN.CENTER;
      buffer += COMMANDS.TEXT_FORMAT.BOLD;
      buffer += (settings.restaurantName || "Restaurant") + LF;
      buffer += COMMANDS.TEXT_FORMAT.NORMAL;
      buffer += (settings.restaurantAddress || "") + LF;
      buffer += (settings.restaurantPhone || "") + LF;
      buffer += "--------------------------------" + LF;

      // Order Info
      buffer += COMMANDS.ALIGN.LEFT;
      buffer += `Order: #${order.orderNumber}` + LF;
      const orderDate = order.createdAt
        ? new Date(order.createdAt).toLocaleString()
        : new Date().toLocaleString();
      buffer += `Date: ${orderDate}` + LF;
      buffer += "--------------------------------" + LF;

      // Items
      buffer += COMMANDS.TEXT_FORMAT.BOLD;
      buffer += this.formatRow("Item", "Qty", "Price", width) + LF;
      buffer += COMMANDS.TEXT_FORMAT.NORMAL;

      order.orderItems.forEach((item) => {
        const total = (item.price + (item.addOnsTotal || 0)) * item.quantity;
        buffer +=
          this.formatRow(
            item.name,
            item.quantity.toString(),
            total.toFixed(2),
            width,
          ) + LF;

        // Add-ons
        if (item.addOns && item.addOns.length > 0) {
          item.addOns.forEach((group) => {
            group.selectedItems.forEach((addon) => {
              buffer += ` + ${addon.name} ` + LF;
            });
          });
        }
      });

      buffer += "--------------------------------" + LF;

      // Totals
      buffer += COMMANDS.ALIGN.RIGHT;
      buffer += COMMANDS.TEXT_FORMAT.BOLD;
      buffer += `Total: ${currency}${order.totalAmount.toFixed(2)}` + LF;

      if (order.amountPaid > 0) {
        buffer += `Paid: ${currency}${order.amountPaid.toFixed(2)}` + LF;
        buffer += `Change: ${currency}${(order.change || 0).toFixed(2)}` + LF;
      }

      buffer += COMMANDS.TEXT_FORMAT.NORMAL;
      buffer += COMMANDS.ALIGN.CENTER;
      buffer += LF + "Thank you for dining with us!" + LF;
      buffer += LF + LF + LF; // Feed
      buffer += COMMANDS.CUT;

      // Convert string to Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(buffer);

      await this.device.transferOut(this.endpointOut, data);

      // Kick Drawer
      // await this.kickDrawer();
    } catch (error) {
      console.error("Print error:", error);
      throw error;
    }
  }

  async kickDrawer() {
    if (!this.device) return;
    const data = new Uint8Array([0x1b, 0x70, 0x00, 0x19, 0xfa]);
    await this.device.transferOut(this.endpointOut, data);
  }

  // Helper to align columns (Name ....... Qty Price)
  formatRow(name, qty, price, width) {
    const qtyWidth = 4;
    const priceWidth = 8;
    const nameWidth = width - qtyWidth - priceWidth - 2; // -2 for spaces

    const nameStr = name.substring(0, nameWidth).padEnd(nameWidth);
    const qtyStr = qty.toString().padStart(qtyWidth);
    const priceStr = price.toString().padStart(priceWidth);

    return `${nameStr} ${qtyStr} ${priceStr}`;
  }
}

export const printerService = new PrinterService();
