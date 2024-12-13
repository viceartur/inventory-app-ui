"use client";

import { redirect, useSearchParams } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { API } from "app/utils/constants";

export function Reports() {
  const [searchParams, setSearchParams] = useState({
    customerId: "",
    materialType: "",
    dateFrom: "",
    dateTo: "",
    dateAsOf: "",
  });
  const [selectCustomers, setSelectCustomers] = useState([
    {
      id: "",
      name: "Loading...",
      code: "Loading...",
    },
  ]);

  useEffect(() => {
    async function fetchCustomers() {
      const res = await fetch(`${API}/customers`);
      const data = await res.json();
      if (!data?.length) setSelectCustomers([]);

      const customers = data.map((customer: any) => ({
        id: customer.ID,
        name: customer.Name,
      }));
      setSelectCustomers(customers);
    }
    fetchCustomers();
  }, []);

  function onChangeForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const customerId = formData.get("customerId")?.toString();
    const materialType = formData.get("materialType")?.toString();
    const dateFrom = formData.get("dateFrom")?.toString();
    const dateTo = formData.get("dateTo")?.toString();
    const dateAsOf = formData.get("dateAsOf")?.toString();

    setSearchParams({
      customerId: customerId ? customerId : "",
      materialType: materialType ? materialType : "",
      dateFrom: dateFrom ? dateFrom : "",
      dateTo: dateTo ? dateTo : "",
      dateAsOf: dateAsOf ? dateAsOf : "",
    });
  }

  return (
    <section>
      <h2>Financial Reports Page</h2>
      <form onChange={onChangeForm}>
        <div className="form-info">
          <h3>Transaction Report</h3>
          <p>Shows the transactions and its cost (Date From/To)</p>
          <h3>Balance Report</h3>
          <p>Shows total cost for the current date (Date As Of)</p>
        </div>
        <div className="form-line">
          <label>Customer:</label>
          <select name="customerId" required>
            {selectCustomers.map((customer, i) => (
              <option key={i} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-line">
          <label>Material Type:</label>
          <input type="text" name="materialType" placeholder="Material Type" />
        </div>
        <div className="form-line">
          <label>Date From:</label>
          <input type="date" name="dateFrom" />
        </div>
        <div className="form-line">
          <label>Date To:</label>
          <input type="date" name="dateTo" />
        </div>
        <div className="form-line">
          <label>Date As Of:</label>
          <input type="date" name="dateAsOf" />
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              const { customerId, materialType, dateFrom, dateTo } =
                searchParams;
              redirect(
                `/reports/transactions?customerId=${customerId}&materialType=${materialType}&dateFrom=${dateFrom}&dateTo=${dateTo}`
              );
            }}
          >
            Get Transactions Report
          </button>
          <button
            type="button"
            onClick={() => {
              const { customerId, materialType, dateAsOf } = searchParams;
              redirect(
                `/reports/balance?customerId=${customerId}&materialType=${materialType}&dateAsOf=${dateAsOf}`
              );
            }}
          >
            Get Balance Report
          </button>{" "}
        </div>
      </form>
    </section>
  );
}

export function Transactions() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");
  const materialType = searchParams.get("materialType");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const [transactions, setTransaction] = useState([]);

  useEffect(() => {
    async function fetchMaterials() {
      const res = await fetch(
        API +
          `/reports/transactions?customerId=${customerId}&materialType=${materialType}&dateFrom=${dateFrom}&dateTo=${dateTo}`
      );
      if (!res) return;

      const data = await res.json();
      if (!data?.length) return;

      const transactions = data.map((material: any) => ({
        stockId: material.StockID,
        materialType: material.MaterialType,
        qty: material.Qty,
        unitCost: material.UnitCost,
        cost: material.Cost,
        date: material.Date,
      }));

      setTransaction(transactions);
    }

    fetchMaterials();
  }, []);

  const onClickDownload = () => {
    const columns = [
      { title: "Stock ID", dataKey: "stockId" },
      { title: "Material Type", dataKey: "materialType" },
      { title: "Qty", dataKey: "qty" },
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
    saveAs(blob, `transaction_report_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <section>
      <div>
        <button onClick={() => redirect("/reports")}>Back to Reports</button>
        <button onClick={onClickDownload}>Download this Report</button>
      </div>
      <h2>Transaction Report</h2>
      <table>
        <thead>
          <tr>
            <th>Stock ID</th>
            <th>Material Type</th>
            <th>Quantity (+/-)</th>
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
              <td>{material.qty}</td>
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
  const materialType = searchParams.get("materialType");
  const dateAsOf = searchParams.get("dateAsOf");
  const [transactions, setTransaction] = useState([]);

  useEffect(() => {
    async function fetchMaterials() {
      const res = await fetch(
        API +
          `/reports/balance?customerId=${customerId}&materialType=${materialType}&dateAsOf=${dateAsOf}`
      );
      if (!res) return;

      const data = await res.json();
      if (!data?.length) return;

      const transactions = data.map((material: any) => ({
        stockId: material.StockID,
        materialType: material.MaterialType,
        qty: material.Qty,
        totalValue: material.TotalValue,
      }));

      setTransaction(transactions);
    }

    fetchMaterials();
  }, []);

  const onClickDownload = () => {
    const columns = [
      { title: "Stock ID", dataKey: "stockId" },
      { title: "Material Type", dataKey: "materialType" },
      { title: "Qty", dataKey: "qty" },
      { title: "Total Value", dataKey: "totalValue" },
    ];

    const data = transactions.map((transaction: any) => ({
      stockId: transaction.stockId,
      materialType: transaction.materialType,
      qty: transaction.qty,
      totalValue: transaction.totalValue,
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
    saveAs(blob, `balance_report_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <section>
      <div>
        <button onClick={() => redirect("/reports")}>Back to Reports</button>
        <button onClick={onClickDownload}>Download this Report</button>
      </div>
      <h2>Balance Report</h2>
      <table>
        <thead>
          <tr>
            <th>Stock ID</th>
            <th>Material Type</th>
            <th>Quantity (+/-)</th>
            <th>Total Value, USD</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((material: any, i) => (
            <tr key={i}>
              <td>{material.stockId}</td>
              <td>{material.materialType}</td>
              <td>{material.qty}</td>
              <td>{material.totalValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
