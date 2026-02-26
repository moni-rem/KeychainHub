import jsPDF from "jspdf";
import "jspdf-autotable";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { formatCurrency, formatDate } from "./formatters";

// Export to PDF
export const exportToPDF = (data, filename = "export.pdf") => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text("Orders Report", 14, 22);

  // Add date
  doc.setFontSize(11);
  doc.text(`Generated: ${formatDate(new Date(), "full")}`, 14, 32);

  // Prepare table data
  const tableColumn = [
    "Order ID",
    "Customer",
    "Date",
    "Total",
    "Status",
    "Items",
  ];
  const tableRows = data.map((order) => [
    order.id?.slice(-8) || "N/A",
    order.customer?.name || "N/A",
    formatDate(order.createdAt, "date"),
    formatCurrency(order.total),
    order.status || "N/A",
    order.items?.length || 0,
  ]);

  // Add table
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  });

  // Save PDF
  doc.save(filename);
};

// Export to CSV
export const exportToCSV = (data, filename = "export.csv") => {
  // Prepare headers
  const headers = [
    "Order ID",
    "Customer",
    "Email",
    "Date",
    "Total",
    "Status",
    "Items",
  ];

  // Prepare rows
  const rows = data.map((order) => [
    order.id || "N/A",
    order.customer?.name || "N/A",
    order.customer?.email || "N/A",
    formatDate(order.createdAt, "date"),
    order.total || 0,
    order.status || "N/A",
    order.items?.length || 0,
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
};

// Export to Excel
export const exportToExcel = (data, filename = "export.xlsx") => {
  // Prepare data for Excel
  const excelData = data.map((order) => ({
    "Order ID": order.id || "N/A",
    "Customer Name": order.customer?.name || "N/A",
    "Customer Email": order.customer?.email || "N/A",
    Date: formatDate(order.createdAt, "date"),
    Total: order.total || 0,
    Status: order.status || "N/A",
    Items: order.items?.length || 0,
    "Payment Method": order.paymentMethod || "N/A",
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Orders");

  // Save file
  XLSX.writeFile(wb, filename);
};

// Print orders
export const printOrders = (orders) => {
  const printWindow = window.open("", "_blank");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Orders Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #3B82F6; color: white; padding: 10px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        .status { 
          padding: 4px 8px; 
          border-radius: 4px; 
          font-size: 12px;
          display: inline-block;
        }
        .status-pending { background: #FEF3C7; color: #92400E; }
        .status-processing { background: #DBEAFE; color: #1E40AF; }
        .status-completed { background: #D1FAE5; color: #065F46; }
        .status-cancelled { background: #FEE2E2; color: #991B1B; }
      </style>
    </head>
    <body>
      <h1>Orders Report</h1>
      <p>Generated: ${formatDate(new Date(), "full")}</p>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Items</th>
          </tr>
        </thead>
        <tbody>
          ${orders
            .map(
              (order) => `
            <tr>
              <td>${order.id?.slice(-8) || "N/A"}</td>
              <td>${order.customer?.name || "N/A"}</td>
              <td>${formatDate(order.createdAt, "date")}</td>
              <td>${formatCurrency(order.total)}</td>
              <td><span class="status status-${order.status}">${order.status || "N/A"}</span></td>
              <td>${order.items?.length || 0}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};
