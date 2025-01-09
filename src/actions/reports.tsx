"use server";

import { API } from "utils/constants";

export async function fetchTransactions(params: any) {
  const {
    customerId = "",
    owner = "",
    materialType = "",
    dateFrom = "",
    dateTo = "",
  } = params;
  const queryParams = new URLSearchParams({
    customerId,
    owner,
    materialType,
    dateFrom,
    dateTo,
  });
  try {
    const res = await fetch(
      `${API}/reports/transactions?${queryParams.toString()}`
    );
    if (!res) return [];
    const data = await res.json();
    if (!data?.length) return [];
    const transactions = data.map((material: any) => ({
      stockId: material.StockID,
      materialType: material.MaterialType,
      qty: material.Qty,
      unitCost: material.UnitCost,
      cost: material.Cost,
      date: material.Date,
    }));
    return transactions;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchBalance(params: any) {
  const {
    customerId = "",
    owner = "",
    materialType = "",
    dateAsOf = "",
  } = params;
  const queryParams = new URLSearchParams({
    customerId,
    owner,
    materialType,
    dateAsOf,
  });
  try {
    const res = await fetch(`${API}/reports/balance?${queryParams.toString()}`);
    if (!res) return [];
    const data = await res.json();
    if (!data?.length) return [];
    const balance = data.map((material: any) => ({
      stockId: material.StockID,
      description: material.Description,
      materialType: material.MaterialType,
      qty: material.Qty,
      totalValue: material.TotalValue,
    }));
    return balance;
  } catch (error) {
    console.error(error);
    return [];
  }
}
