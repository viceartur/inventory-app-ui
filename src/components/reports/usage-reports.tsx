"use client";

import { FormEvent, useEffect, useState } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

import { CustomerProgram, fetchCustomerPrograms } from "actions/customers";
import { fetchMaterialTypes } from "actions/materials";
import { OWNER_TYPES } from "utils/constants";
import { fetchTransactionsLog, fetchWeeklyUsageItems } from "actions/reports";
import { formatDate, toUSFormat } from "utils/client_utils";
import { fetchWarehouses } from "actions/warehouses";

export function UsageReports() {
  const [searchParams, setSearchParams] = useState<object | any>({});
  const [selectCustomers, setSelectCustomers] = useState<CustomerProgram[]>([]);
  const [selectMaterialTypes, setSelectMaterialTypes] = useState<object[]>([]);
  const [selectWarehouses, setSelectWarehouses] = useState<object[]>([]);

  useEffect(() => {
    const getReportInfo = async () => {
      const customers = await fetchCustomerPrograms();
      const materialTypes = await fetchMaterialTypes();
      const warehouses = await fetchWarehouses();
      setSelectCustomers(customers);
      setSelectMaterialTypes(materialTypes);
      setSelectWarehouses(warehouses);
    };
    getReportInfo();
  }, []);

  const onChangeForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const warehouseId = formData.get("warehouse")?.toString();
    const customer = formData.get("customer")?.toString().split("%");
    const customerId = customer ? customer[0] : "";
    const customerName = customer ? customer[1] : "";
    const owner = formData.get("owner")?.toString() || "";
    const materialType = formData.get("materialType")?.toString() || "";
    const dateFrom = formData.get("dateFrom")?.toString() || "";
    const dateTo = formData.get("dateTo")?.toString() || "";
    const dateAsOf = formData.get("dateAsOf")?.toString() || "";

    setSearchParams({
      warehouseId,
      customerId,
      customerName,
      owner,
      materialType,
      dateFrom,
      dateTo,
      dateAsOf,
    });
  };

  const handleWeeklyUsageRedirect = () => {
    const {
      customerId = "",
      customerName = "",
      owner = "",
      materialType = "",
      dateAsOf = "",
    } = searchParams;
    const queryParams = new URLSearchParams({
      customerId,
      customerName,
      owner,
      materialType,
      dateAsOf,
    });
    redirect(`/usage-reports/weekly-usage?${queryParams.toString()}`);
  };

  const handleTransactionsLogRedirect = () => {
    const {
      warehouseId = "",
      customerId = "",
      customerName = "",
      owner = "",
      materialType = "",
      dateFrom = "",
      dateTo = "",
    } = searchParams;
    const queryParams = new URLSearchParams({
      warehouseId,
      customerId,
      customerName,
      owner,
      materialType,
      dateFrom,
      dateTo,
    });
    redirect(`/usage-reports/transactions-log?${queryParams.toString()}`);
  };

  return (
    <section>
      <h2>Usage Reports Page</h2>
      <form onChange={onChangeForm}>
        <div className="form-info">
          <h3>📊 Transactions Log Report (T)</h3>
          <p>
            Review all stock transactions with detailed info on item locations,
            quantity changes, and job tickets.
          </p>
          <h3>📈 6-Week Usage & Stock Forecast Report (W)</h3>
          <p>
            View stock quantity on the selected date, 6-week average usage, and
            an estimated number of weeks remaining until stock runs out.
          </p>
          <p>
            Items with no usage in the 6 weeks prior to the reference date will
            not appear in the report.
          </p>
        </div>
        <div className="form-line">
          <label>(T) Warehouse:</label>
          <select name="warehouse" required>
            <option value="">-- Select a warehouse (optional) --</option>
            {selectWarehouses.map((warehouse: any) => (
              <option key={warehouse.warehouseId} value={warehouse.warehouseId}>
                {warehouse.warehouseName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-line">
          <label>Customer Program:</label>
          <select name="customer" required>
            <option value="">-- Select a customer (optional) --</option>
            {selectCustomers.map((customer, i) => (
              <option
                key={i}
                value={`${customer.programId}%${customer.programName}`}
              >
                {customer.customerName || "No customer"}: {customer.programName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-line">
          <label>Material Type:</label>
          <select name="materialType" required>
            <option value="">-- Select a material type (optional) --</option>
            {selectMaterialTypes.map((type: any) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-line">
          <label>Owner:</label>
          <select name="owner" required>
            <option value="">-- Select an owner (optional) --</option>
            {OWNER_TYPES.map((type, i) => (
              <option key={i} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="form-line">
          <label>(T) Date From:</label>
          <input type="date" name="dateFrom" />
        </div>
        <div className="form-line">
          <label>(T) Date To:</label>
          <input type="date" name="dateTo" />
        </div>
        <div className="form-line">
          <label>(W) Date As Of:</label>
          <input type="date" name="dateAsOf" />
        </div>
        <div className="form-buttons">
          <button type="button" onClick={handleTransactionsLogRedirect}>
            Get Transactions Log
          </button>
          <button type="button" onClick={handleWeeklyUsageRedirect}>
            Get 6-Week Usage
          </button>
        </div>
      </form>
    </section>
  );
}

export function WeeklyUsage() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");
  const owner = searchParams.get("owner");
  const materialType = searchParams.get("materialType");
  const dateAsOf = searchParams.get("dateAsOf");

  const [weeklyUsageItems, setWeeklyUsageItems] = useState([]);

  useEffect(() => {
    const getWeeklyUsage = async () => {
      const weeklyUsageStocks = await fetchWeeklyUsageItems({
        customerId,
        owner,
        materialType,
        dateAsOf,
      });
      setWeeklyUsageItems(weeklyUsageStocks);
    };
    getWeeklyUsage();
  }, []);

  const onClickDownload = () => {
    const columns = [
      { title: "Customer", dataKey: "customerName" },
      { title: "Material Type", dataKey: "materialType" },
      { title: "Stock ID", dataKey: "stockId" },
      { title: "Ref Date Qty", dataKey: "qtyOnRefDate" },
      { title: "Avg Weekly Usage", dataKey: "avgWeeklyUsg" },
      { title: "Weeks Remaining", dataKey: "weeksRemaining" },
    ];

    const data = weeklyUsageItems.map((w: any) => ({
      customerName: w.customerName,
      materialType: w.materialType,
      stockId: w.stockId,
      qtyOnRefDate: w.qtyOnRefDate,
      avgWeeklyUsg: w.avgWeeklyUsg,
      weeksRemaining: w.weeksRemaining,
    }));

    const excelData = [
      columns.map((column) => column.title),
      ...data.map((item: any) => columns.map((column) => item[column.dataKey])),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "6-Week Usage");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `weekly_usage_report_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <section>
      <div>
        <button
          className="control-button"
          onClick={() => redirect("/usage-reports")}
        >
          Back to Reports
        </button>
        <button className="control-button" onClick={() => onClickDownload()}>
          Download the Report
        </button>
      </div>
      <h2>
        Usage Report as of{" "}
        {dateAsOf ? formatDate(dateAsOf) : new Date().toLocaleDateString()}
      </h2>
      {weeklyUsageItems.length ? (
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Material Type</th>
              <th>Stock ID</th>
              <th>Ref Date Qty</th>
              <th>Avg Weekly Usage</th>
              <th>Weeks Remaining</th>
            </tr>
          </thead>
          <tbody>
            {weeklyUsageItems.map((material: any, i) => (
              <tr key={i}>
                <td>{material.customerName}</td>
                <td>{material.materialType}</td>
                <td>{material.stockId}</td>
                <td>{toUSFormat(material.qtyOnRefDate)}</td>
                <td>{toUSFormat(material.avgWeeklyUsg)}</td>
                <td>{toUSFormat(material.weeksRemaining)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        "No usage data found for the current query parameters. Please adjust your filters or try a different search."
      )}
    </section>
  );
}

export function TransactionsLog() {
  const searchParams = useSearchParams();
  const warehouseId = searchParams.get("warehouseId");
  const customerId = searchParams.get("customerId");
  const customerName = searchParams.get("customerName");
  const owner = searchParams.get("owner");
  const materialType = searchParams.get("materialType");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const getTransactions = async () => {
      const transactions = await fetchTransactionsLog({
        warehouseId,
        customerId,
        owner,
        materialType,
        dateFrom,
        dateTo,
      });
      setTransactions(transactions);
    };
    getTransactions();
  }, []);

  return (
    <section>
      <div>
        <button
          className="control-button"
          onClick={() => redirect("/usage-reports")}
        >
          Back to Reports
        </button>
      </div>
      <h2>Transactions Log</h2>
      {transactions.length ? (
        <table>
          <thead>
            <tr>
              <th>Stock ID</th>
              <th>Material Type</th>
              <th>Location</th>
              {materialType === "CHIPS" && <th>Serial # Range</th>}
              <th>Quantity (+/-)</th>
              <th>Job Ticket</th>
              <th>Reason</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((material: any, i) => (
              <tr key={i}>
                <td>{material.stockId}</td>
                <td>{material.materialType}</td>
                <td>{material.locationName}</td>
                {materialType === "CHIPS" && (
                  <td>{material.serialNumberRange}</td>
                )}
                <td className={material.qty > 0 ? "" : "negative"}>
                  {toUSFormat(material.qty)}
                </td>
                <td>{material.jobTicket}</td>
                <td>{material.reasonDescription}</td>
                <td>{formatDate(material.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        "No transactions data found for the current query parameters. Please adjust your filters or try a different search."
      )}
    </section>
  );
}
