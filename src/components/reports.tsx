"use client";

import { redirect, useSearchParams } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

import {
  OWNER_TYPES,
  reportsSearchParamsState,
  selectState,
} from "utils/constants";
import { fetchCustomers } from "actions/customers";
import { fetchMaterialTypes } from "actions/materials";
import { fetchBalance, fetchTransactions } from "actions/reports";
import { toUSFormat } from "utils/client_utils";

export function Reports() {
  const [searchParams, setSearchParams] = useState(reportsSearchParamsState);
  const [selectCustomers, setSelectCustomers] = useState([
    { ...selectState, name: "" },
  ]);
  const [selectMaterialTypes, setSelectMaterialTypes] = useState([
    { ...selectState, name: "" },
  ]);

  useEffect(() => {
    const getReportInfo = async () => {
      const customers = await fetchCustomers();
      const materialTypes = await fetchMaterialTypes();
      setSelectCustomers([...selectCustomers, ...customers]);
      setSelectMaterialTypes([...selectMaterialTypes, ...materialTypes]);
    };
    getReportInfo();
  }, []);

  const onChangeForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const customer = formData.get("customer")?.toString().split("%");
    const customerId = customer ? customer[0] : "";
    const customerName = customer ? customer[1] : "";
    const owner = formData.get("owner")?.toString() || "";
    const materialType = formData.get("materialType")?.toString() || "";
    const dateFrom = formData.get("dateFrom")?.toString() || "";
    const dateTo = formData.get("dateTo")?.toString() || "";
    const dateAsOf = formData.get("dateAsOf")?.toString() || "";

    setSearchParams({
      customerId,
      customerName,
      owner,
      materialType,
      dateFrom,
      dateTo,
      dateAsOf,
    });
  };

  const handleTransactionsRedirect = () => {
    const {
      customerId = "",
      customerName = "",
      owner = "",
      materialType = "",
      dateFrom = "",
      dateTo = "",
    } = searchParams;
    const queryParams = new URLSearchParams({
      customerId,
      customerName,
      owner,
      materialType,
      dateFrom,
      dateTo,
    });
    redirect(`/reports/transactions?${queryParams.toString()}`);
  };

  const handleBalanceRedirect = () => {
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
    redirect(`/reports/balance?${queryParams.toString()}`);
  };

  return (
    <section>
      <h2>Financial Reports Page</h2>
      <form onChange={onChangeForm}>
        <div className="form-info">
          <h3>📊Transaction Report (T):</h3>
          <p>- Shows the transactions and its cost (Date From/To).</p>
          <p>
            - When "CHIPS" Material Type is chosen, "Serial # Range" is
            displayed.
          </p>
          <h3>💰Balance Report (B):</h3>
          <p>- Shows total cost for the specific date (Date As Of).</p>
        </div>
        <div className="form-line">
          <label>Customer:</label>
          <select name="customer" required>
            {selectCustomers.map((customer, i) => (
              <option key={i} value={`${customer.id}%${customer.name}`}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-line">
          <label>Material Type:</label>
          <select name="materialType" required>
            {selectMaterialTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-line">
          <label>Owner:</label>
          <select name="owner" required>
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
          <label>(B) Date As Of:</label>
          <input type="date" name="dateAsOf" />
        </div>
        <div className="form-buttons">
          <button type="button" onClick={handleTransactionsRedirect}>
            Get Transactions Report
          </button>
          <button type="button" onClick={handleBalanceRedirect}>
            Get Balance Report
          </button>
        </div>
      </form>
    </section>
  );
}

export function Transactions() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");
  const customerName = searchParams.get("customerName");
  const owner = searchParams.get("owner");
  const materialType = searchParams.get("materialType");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const getTransactions = async () => {
      const transactions = await fetchTransactions({
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

  const onClickDownload = () => {
    const columns = [
      { title: "Stock ID", dataKey: "stockId" },
      { title: "Material Type", dataKey: "materialType" },
      { title: "Qty", dataKey: "qty" },
      { title: "Serial # Range", dataKey: "serialNumberRange" },
      { title: "Unit Cost", dataKey: "unitCost" },
      { title: "Cost", dataKey: "cost" },
      { title: "Date", dataKey: "date" },
    ];

    const data = transactions.map((transaction: any) => ({
      stockId: transaction.stockId,
      materialType: transaction.materialType,
      qty: transaction.qty,
      unitCost: transaction.unitCost,
      cost: transaction.cost,
      date: transaction.date,
      serialNumberRange: transaction.serialNumberRange,
    }));

    const excelData = [
      columns.map((column) => column.title),
      ...data.map((item: any) => columns.map((column) => item[column.dataKey])),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(
      blob,
      `${
        customerName || "general"
      }_transaction_report_${new Date().toLocaleDateString()}.xlsx`
    );
  };

  return (
    <section>
      <div>
        <button onClick={() => redirect("/reports")}>Back to Reports</button>
        <button onClick={onClickDownload}>Download this Report</button>
      </div>
      <h2>{customerName || "General"} Transaction Report</h2>
      <table>
        <thead>
          <tr>
            <th>Stock ID</th>
            <th>Material Type</th>
            <th>Quantity (+/-)</th>
            {materialType === "CHIPS" && <th>Serial # Range</th>}
            <th>Unit Cost, USD</th>
            <th>Cost, USD</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((material: any, i) => (
            <tr key={i}>
              <td>{material.stockId}</td>
              <td>{material.materialType}</td>
              <td className={material.qty > 0 ? "" : "negative"}>
                {toUSFormat(material.qty)}
              </td>
              {materialType === "CHIPS" && (
                <td>{material.serialNumberRange}</td>
              )}
              <td>{material.unitCost}</td>
              <td>{material.cost}</td>
              <td>{material.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function Balance() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");
  const customerName = searchParams.get("customerName");
  const owner = searchParams.get("owner");
  const materialType = searchParams.get("materialType");
  const dateAsOf = searchParams.get("dateAsOf");
  const [balance, setBalance] = useState([]);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const getBalance = async () => {
      const balance = await fetchBalance({
        customerId,
        owner,
        materialType,
        dateAsOf,
      });
      const totalValue = balance
        .reduce((acc: number, t: any) => {
          return acc + +t.totalValue.slice(1).replaceAll(",", "");
        }, 0)
        .toFixed(2);
      setBalance(balance);
      setTotalValue(totalValue);
    };
    getBalance();
  }, []);

  const onClickDownload = () => {
    const columns = [
      { title: "Stock ID", dataKey: "stockId" },
      { title: "Description", dataKey: "description" },
      { title: "Material Type", dataKey: "materialType" },
      { title: "Qty", dataKey: "qty" },
      { title: "Total Value", dataKey: "totalValue" },
    ];

    const data = balance.map((b: any) => ({
      stockId: b.stockId,
      description: b.description,
      materialType: b.materialType,
      qty: b.qty,
      totalValue: b.totalValue,
    }));

    const excelData = [
      columns.map((column) => column.title),
      ...data.map((item: any) => columns.map((column) => item[column.dataKey])),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(
      blob,
      `${
        customerName || "general"
      }_balance_report_${new Date().toLocaleDateString()}.xlsx`
    );
  };

  return (
    <section>
      <div>
        <button onClick={() => redirect("/reports")}>Back to Reports</button>
        <button onClick={onClickDownload}>Download this Report</button>
      </div>
      <h2>
        {customerName || "General"} Balance Report: ${toUSFormat(totalValue)}
      </h2>
      {dateAsOf ? <h2>As of {dateAsOf}</h2> : ""}
      <table>
        <thead>
          <tr>
            <th>Stock ID</th>
            <th>Description</th>
            <th>Material Type</th>
            <th>Quantity</th>
            <th>Total Value, USD</th>
          </tr>
        </thead>
        <tbody>
          {balance.map((material: any, i) => (
            <tr key={i}>
              <td>{material.stockId}</td>
              <td>{material.description}</td>
              <td>{material.materialType}</td>
              <td>{toUSFormat(material.qty)}</td>
              <td>{material.totalValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
