import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import printJS from "print-js";
import {
  ShoppingBag,
  UtensilsCrossed,
  Truck,
  Receipt as ReceiptIcon,
} from "lucide-react";
import { fetchSettings } from "../../settings/generalSettings/generalSettingsSlice";

const Receipt = ({ extraObject }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const orderData = extraObject;
  console.log(extraObject);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings
  );

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Format the receipt data
  const receipt = {
    restaurantLogo: settings?.restaurantLogo,
    restaurantName:
      settings?.restaurantName?.toUpperCase() || "CODEKET RESTAURANT",
    restaurantAddress: settings?.restaurantAddress,
    restaurantPhone: settings?.restaurantPhone,
    restaurantEmail: settings?.restaurantEmail,
    motto: settings?.restaurantMotto,
    date: new Date().toLocaleString(),
    orderNumber: orderData.orderNumber || "New Order",
    orderType: orderData.orderType || "dine-in",
    table: orderData.table || "",
    customerName: orderData.customerDetails?.name || "Walk-in Customer",
    customerPhone: orderData.customerDetails?.phone || "",
    customerAddress: orderData.customerDetails?.address || "",
    items: orderData.orderItems || orderData.menuItems || [],
    subtotal: orderData.taxBreakdown.subtotal || 0,
    serviceCharge: orderData.taxBreakdown.serviceCharge || 0,
    tax: orderData.taxBreakdown.totalTax || 0,
    packagingFee: orderData.packagingFee || 0,
    deliveryFee: orderData.deliveryFee || 0,
    totalAmount: orderData.totalAmount || 0,
    paymentMethod: orderData.paymentMethod || "cash",
    amountPaid: orderData.amountPaid || 0,
    change: orderData.change || 0,
    balance: orderData.balance || 0,
    note: orderData.note || "",
  };

  // Handle thermal printing using print-js
  const handlePrint = () => {
    printJS({
      printable: "printableArea",
      type: "html",
      targetStyles: ["*"],
      documentTitle: `Receipt - Order #${receipt.orderNumber}`,
      css: `
        @media print {
          body {
            margin: 0;
            padding: 0;
            font-size: 12px;
            font-family: 'Courier New', monospace;
          }
          #printableArea {
            max-width: 80mm;
            margin: 0 auto;
            padding: 5mm;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 2px 0;
            text-align: left;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 5px 0;
          }
          .text-center {
            text-align: center;
          }
          .text-right {
            text-align: right;
          }
          .font-bold {
            font-weight: bold;
          }
        }
      `,
    });
  };

  // Get order type icon
  const getOrderTypeIcon = () => {
    switch (receipt.orderType) {
      case "dine-in":
        return <UtensilsCrossed size={18} className="mr-1" />;
      case "takeaway":
        return <ShoppingBag size={18} className="mr-1" />;
      case "delivery":
        return <Truck size={18} className="mr-1" />;
      default:
        return <ReceiptIcon size={18} className="mr-1" />;
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Main receipt card */}
      <div className="bg-white text-black shadow-lg rounded-lg">
        <div className="p-6">
          {/* Printable Receipt Content */}
          <div id="printableArea" className="text-sm space-y-4">
            {/* Header with full restaurant details */}
            <div className="text-center space-y-1 border-b pb-4">
              {/* {receipt.restaurantLogo && (
                <img
                  src={receipt.restaurantLogo}
                  alt="Company Logo"
                  className="h-12 mx-auto object-contain"
                />
              )} */}
              <h1 className="font-bold text-lg">{receipt.restaurantName}</h1>
              {receipt.motto && (
                <p className="italic text-xs">{receipt.motto}</p>
              )}
              {receipt.restaurantAddress && (
                <p className="text-xs">{receipt.restaurantAddress}</p>
              )}
              {receipt.restaurantPhone && (
                <p className="text-xs">Phone: {receipt.restaurantPhone}</p>
              )}
              {receipt.restaurantEmail && (
                <p className="text-xs">Email: {receipt.restaurantEmail}</p>
              )}
            </div>

            <div className="divider"></div>

            {/* Order Info */}
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="font-medium">Order #:</td>
                  <td className="text-right">{receipt.orderNumber}</td>
                </tr>
                <tr className="border-b">
                  <td className="font-medium">Date:</td>
                  <td className="text-right">{receipt.date}</td>
                </tr>
                <tr className="border-b">
                  <td className="font-medium">Type:</td>
                  <td className="text-right flex items-center justify-end">
                    <span className="mr-1 capitalize">{receipt.orderType}</span>
                    {getOrderTypeIcon()}
                  </td>
                </tr>
                {receipt.orderType === "dine-in" && receipt.table && (
                  <tr className="border-b">
                    <td className="font-medium">Table:</td>
                    <td className="text-right">{receipt.table}</td>
                  </tr>
                )}
                {receipt.customerName !== "Walk-in Customer" && (
                  <tr className="border-b">
                    <td className="font-medium">Customer:</td>
                    <td className="text-right">{receipt.customerName}</td>
                  </tr>
                )}
                {receipt.customerPhone && (
                  <tr className="border-b">
                    <td className="font-medium">Phone:</td>
                    <td className="text-right">{receipt.customerPhone}</td>
                  </tr>
                )}
                {receipt.orderType === "delivery" &&
                  receipt.customerAddress && (
                    <tr className="border-b">
                      <td className="font-medium">Address:</td>
                      <td className="text-right">{receipt.customerAddress}</td>
                    </tr>
                  )}
              </tbody>
            </table>

            <div className="divider"></div>

            {/* Order Items */}
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium">Item</th>
                  <th className="text-center font-medium">Qty</th>
                  <th className="text-right font-medium">Price</th>
                  <th className="text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, index) => (
                  <tr key={index} className="border-b last:border-b-0">
                    <td className="py-1">{item.name}</td>
                    <td className="text-center py-1">{item.quantity}</td>
                    <td className="text-right py-1">
                      {settings?.currency?.symbol}
                      {parseFloat(item.price).toFixed(2)}
                    </td>
                    <td className="text-right py-1">
                      {settings?.currency?.symbol}
                      {parseFloat(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divider"></div>

            {/* Totals */}
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td>Subtotal:</td>
                  <td className="text-right">
                    {settings?.currency?.symbol}
                    {parseFloat(receipt.subtotal).toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td>Tax {`(${settings?.taxSettings?.name})`}:</td>
                  <td className="text-right">
                    {settings?.currency?.symbol}
                    {parseFloat(receipt.tax).toFixed(2)}
                  </td>
                </tr>
                {receipt.serviceCharge > 0 && (
                  <tr className="border-b">
                    <td>Service Charge:</td>
                    <td className="text-right">
                      {settings?.currency?.symbol}
                      {parseFloat(receipt.serviceCharge).toFixed(2)}
                    </td>
                  </tr>
                )}

                {receipt.packagingFee > 0 && (
                  <tr className="border-b">
                    <td>Packaging:</td>
                    <td className="text-right">
                      {settings?.currency?.symbol}
                      {parseFloat(receipt.packagingFee).toFixed(2)}
                    </td>
                  </tr>
                )}

                {receipt.deliveryFee > 0 && (
                  <tr className="border-b">
                    <td>Delivery:</td>
                    <td className="text-right">
                      {settings?.currency?.symbol}
                      {parseFloat(receipt.deliveryFee).toFixed(2)}
                    </td>
                  </tr>
                )}

                <tr className="font-bold text-lg">
                  <td>Total:</td>
                  <td className="text-right">
                    {settings?.currency?.symbol}
                    {parseFloat(receipt.totalAmount).toFixed(2)}
                  </td>
                </tr>

                <tr className="border-b">
                  <td>Payment Method:</td>
                  <td className="text-right capitalize">
                    {receipt.paymentMethod}
                  </td>
                </tr>

                <tr className="border-b">
                  <td>Amount Paid:</td>
                  <td className="text-right">
                    {settings?.currency?.symbol}
                    {parseFloat(receipt.amountPaid).toFixed(2)}
                  </td>
                </tr>

                {receipt.change > 0 && (
                  <tr className="border-b">
                    <td>Change:</td>
                    <td className="text-right">
                      {settings?.currency?.symbol}
                      {parseFloat(receipt.change).toFixed(2)}
                    </td>
                  </tr>
                )}

                {receipt.balance > 0 && (
                  <tr className="border-b">
                    <td className="font-medium">Balance Due:</td>
                    <td className="text-right font-medium">
                      {settings?.currency?.symbol}
                      {parseFloat(receipt.balance).toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {receipt.note && (
              <>
                <div className="divider"></div>
                <div>
                  <p className="font-medium">Note:</p>
                  <p>{receipt.note}</p>
                </div>
              </>
            )}

            <div className="divider"></div>

            {/* Footer */}
            <div className="text-center  mt-4">
              <p>Thank you for dining with us!</p>
              <p className="text-xs mt-2">Powered by Codeket</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 mt-4">
        <button onClick={handlePrint} className="btn btn-primary">
          Print Receipt
        </button>
        <PDFDownloadLink
          document={<ReceiptPDF receipt={receipt} settings={settings} />}
          fileName={`receipt-${receipt.orderNumber}.pdf`}
        >
          {({ loading }) => (
            <button disabled={loading} className="btn btn-success">
              Save PDF
            </button>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  );
};

// PDF Document Component
const ReceiptPDF = ({ receipt, settings }) => (
  <Document>
    <Page size="A6" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{receipt.businessName}</Text>
        <Text style={styles.subtitle}>{receipt.address}</Text>
        <Text style={styles.subtitle}>{receipt.phone}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.orderInfo}>
        <View style={styles.row}>
          <Text style={styles.label}>Order #:</Text>
          <Text style={styles.value}>{receipt.orderNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{receipt.date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{receipt.orderType}</Text>
        </View>
        {receipt.orderType === "dine-in" && receipt.table && (
          <View style={styles.row}>
            <Text style={styles.label}>Table:</Text>
            <Text style={styles.value}>{receipt.table}</Text>
          </View>
        )}
        {receipt.customerName !== "Walk-in Customer" && (
          <View style={styles.row}>
            <Text style={styles.label}>Customer:</Text>
            <Text style={styles.value}>{receipt.customerName}</Text>
          </View>
        )}
        {receipt.orderType === "delivery" && receipt.customerAddress && (
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{receipt.customerAddress}</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Item</Text>
        <Text
          style={[styles.tableHeaderCell, { flex: 1, textAlign: "center" }]}
        >
          Qty
        </Text>
        <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>
          Price
        </Text>
        <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>
          Total
        </Text>
      </View>

      {receipt.items.map((item, index) => (
        <View style={styles.tableRow} key={index}>
          <Text style={[styles.tableCell, { flex: 2 }]}>{item.name}</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: "center" }]}>
            {item.quantity}
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
            {settings?.currency?.symbol}
            {parseFloat(item.price).toFixed(2)}
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
            {settings?.currency?.symbol}
            {parseFloat(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      ))}

      <View style={styles.divider} />

      <View style={styles.totals}>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal:</Text>
          <Text style={styles.value}>
            {settings?.currency?.symbol}
            {parseFloat(receipt.subtotal).toFixed(2)}
          </Text>
        </View>

        {receipt.tax > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Tax:</Text>
            <Text style={styles.value}>
              {settings?.currency?.symbol}
              {parseFloat(receipt.tax).toFixed(2)}
            </Text>
          </View>
        )}

        {receipt.serviceCharge > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Service Charge:</Text>
            <Text style={styles.value}>
              {settings?.currency?.symbol}
              {parseFloat(receipt.serviceCharge).toFixed(2)}
            </Text>
          </View>
        )}

        {receipt.packagingFee > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Packaging:</Text>
            <Text style={styles.value}>
              {settings?.currency?.symbol}
              {parseFloat(receipt.packagingFee).toFixed(2)}
            </Text>
          </View>
        )}

        {receipt.deliveryFee > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Delivery:</Text>
            <Text style={styles.value}>
              {settings?.currency?.symbol}
              {parseFloat(receipt.deliveryFee).toFixed(2)}
            </Text>
          </View>
        )}

        <View style={styles.row}>
          <Text style={[styles.label, styles.bold]}>Total:</Text>
          <Text style={[styles.value, styles.bold]}>
            {settings?.currency?.symbol}
            {parseFloat(receipt.totalAmount).toFixed(2)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Payment Method:</Text>
          <Text style={styles.value}>{receipt.paymentMethod}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Amount Paid:</Text>
          <Text style={styles.value}>
            {settings?.currency?.symbol}
            {parseFloat(receipt.amountPaid).toFixed(2)}
          </Text>
        </View>

        {receipt.change > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Change:</Text>
            <Text style={styles.value}>
              {settings?.currency?.symbol}
              {parseFloat(receipt.change).toFixed(2)}
            </Text>
          </View>
        )}

        {receipt.balance > 0 && (
          <View style={styles.row}>
            <Text style={[styles.label, styles.bold]}>Balance Due:</Text>
            <Text style={[styles.value, styles.bold]}>
              {settings?.currency?.symbol}
              {parseFloat(receipt.balance).toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {receipt.note && (
        <>
          <View style={styles.divider} />
          <View style={styles.notes}>
            <Text style={styles.bold}>Note:</Text>
            <Text>{receipt.note}</Text>
          </View>
        </>
      )}

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Text>Thank's for your patronage!</Text>
        <Text style={styles.smallText}>Powered by Codeket</Text>
      </View>
    </Page>
  </Document>
);

// PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    marginBottom: 10,
    textAlign: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: "#555",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderBottomStyle: "dashed",
    marginVertical: 10,
  },
  orderInfo: {
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  label: {
    flex: 1,
  },
  value: {
    flex: 1,
    textAlign: "right",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f4f4f4",
    padding: 5,
    marginBottom: 5,
  },
  tableHeaderCell: {
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    padding: 5,
  },
  tableCell: {},
  totals: {
    marginTop: 5,
  },
  notes: {
    marginVertical: 10,
  },
  footer: {
    marginTop: 10,
    alignItems: "center",
  },
  bold: {
    fontWeight: "bold",
  },
  smallText: {
    fontSize: 8,
    marginTop: 5,
    color: "#666",
  },
});

export default Receipt;
