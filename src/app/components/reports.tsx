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
      const res = await fetch("http://localhost:5000/customers");
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
    <>
      <h2>Financial Reports Page</h2>
      <p>Description:</p>
      <p>Transaction Report - all transactions and its prices</p>
      <p>Balance Report - total prices for a period of time</p>
      <p>Please enter the filter options:</p>
      <form className="filter" onChange={onChangeForm}>
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
    </>
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
        `http://localhost:5000/reports/transactions?customerId=${customerId}&materialType=${materialType}&dateFrom=${dateFrom}&dateTo=${dateTo}`
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
    <>
      <button onClick={() => redirect("/reports")}>Back to Reports</button>
      <h2>Transactions List: {transactions.length} items</h2>
      <div className="material_list">
        <div className="list_header">
          <p>Stock ID</p>
          <p>Material Type</p>
          <p>Quantity</p>
          <p>Unit Cost</p>
          <p>Cost</p>
          <p>Date</p>
        </div>
        {transactions.map((material: any, i) => (
          <div className="material_list-item" key={i}>
            <p>{material.stockId}</p>
            <p>{material.materialType}</p>
            <p>{material.qty}</p>
            <p>{material.unitCost}</p>
            <p>{material.cost}</p>
            <p>{material.date}</p>
          </div>
        ))}
      </div>
    </>
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
        `http://localhost:5000/reports/balance?customerId=${customerId}&materialType=${materialType}&dateAsOf=${dateAsOf}`
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
    <>
      <button onClick={() => redirect("/reports")}>Back to Reports</button>
      <h2>Transactions List: {transactions.length} items</h2>
      <div className="material_list">
        <div className="list_header">
          <p>Stock ID</p>
          <p>Material Type</p>
          <p>Quantity</p>
          <p>Total Value</p>
        </div>
        {transactions.map((material: any, i) => (
          <div className="material_list-item" key={i}>
            <p>{material.stockId}</p>
            <p>{material.materialType}</p>
            <p>{material.qty}</p>
            <p>{material.totalValue}</p>
          </div>
        ))}
      </div>
    </>
  );
}
