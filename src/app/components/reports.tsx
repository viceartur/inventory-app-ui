"use client";

import { redirect, useSearchParams } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";

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
      const res = await fetch(
        `http://${process.env.NEXT_PUBLIC_SERVER_HOSTNAME}:${process.env.NEXT_PUBLIC_SERVER_PORT}/customers`
      );
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
      <p>Description:</p>
      <p>Transaction Report - all transactions and its prices</p>
      <p>Balance Report - total prices for a period of time</p>
      <p>Please enter the filter options:</p>
      <form onChange={onChangeForm}>
        <label>Customer:</label>
        <select name="customerId" required>
          {selectCustomers.map((customer, i) => (
            <option key={i} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
        <input type="text" name="materialType" placeholder="Material Type" />
        <label>Date From (transactions):</label>
        <input type="date" name="dateFrom" />
        <label>Date To (transactions):</label>
        <input type="date" name="dateTo" />
        <label>Date As Of (balance):</label>
        <input type="date" name="dateAsOf" />
      </form>
      <button
        onClick={() => {
          const { customerId, materialType, dateFrom, dateTo } = searchParams;
          redirect(
            `/reports/transactions?customerId=${customerId}&materialType=${materialType}&dateFrom=${dateFrom}&dateTo=${dateTo}`
          );
        }}
      >
        Get Transactions Report
      </button>
      <button
        onClick={() => {
          const { customerId, materialType, dateAsOf } = searchParams;
          redirect(
            `/reports/balance?customerId=${customerId}&materialType=${materialType}&dateAsOf=${dateAsOf}`
          );
        }}
      >
        Get Balance Report
      </button>
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
        `http://${process.env.NEXT_PUBLIC_SERVER_HOSTNAME}:${process.env.NEXT_PUBLIC_SERVER_PORT}/reports/transactions?customerId=${customerId}&materialType=${materialType}&dateFrom=${dateFrom}&dateTo=${dateTo}`
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

  return (
    <section>
      <button onClick={() => redirect("/reports")}>Back to Reports</button>
      <h2>Transactions List: {transactions.length} items</h2>
      <div className="material_list">
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
      </div>
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
        `http://${process.env.NEXT_PUBLIC_SERVER_HOSTNAME}:${process.env.NEXT_PUBLIC_SERVER_PORT}/reports/balance?customerId=${customerId}&materialType=${materialType}&dateAsOf=${dateAsOf}`
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

  return (
    <section>
      <button onClick={() => redirect("/reports")}>Back to Reports</button>
      <h2>Balance List: {transactions.length} items</h2>
      <div className="material_list">
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
      </div>
    </section>
  );
}
