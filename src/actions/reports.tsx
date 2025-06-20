"use server";

import { API } from "utils/constants";

interface MaterialWeeklyUsage {
  customerName?: string;
  programName?: string;
  materialType: string;
  stockId: string;
  qtyOnRefDate: number;
  avgWeeklyUsg: number;
  weeksRemaining: number;
}

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
      serialNumberRange: material.SerialNumberRange,
      cumulativeQty: material.CumulativeQty,
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

export async function fetchWeeklyUsageItems(params: any) {
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
    const res = await fetch(
      `${API}/reports/weekly_usage?${queryParams.toString()}`
    );
    if (!res) return [];
    const data = await res.json();
    if (!data?.length) return [];
    const weeklyUsageItems = data.map((material: MaterialWeeklyUsage) => ({
      customerName: material.programName,
      materialType: material.materialType,
      stockId: material.stockId,
      qtyOnRefDate: material.qtyOnRefDate,
      avgWeeklyUsg: material.avgWeeklyUsg,
      weeksRemaining: material.weeksRemaining,
    }));
    return weeklyUsageItems;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchTransactionsLog(params: any) {
  const {
    warehouseId = "",
    customerId = "",
    owner = "",
    materialType = "",
    dateFrom = "",
    dateTo = "",
  } = params;
  const queryParams = new URLSearchParams({
    warehouseId,
    customerId,
    owner,
    materialType,
    dateFrom,
    dateTo,
  });
  try {
    const res = await fetch(
      `${API}/reports/transactions_log?${queryParams.toString()}`
    );
    if (!res) return [];
    const data = await res.json();
    if (!data?.length) return [];
    const transactions = data.map((material: any) => ({
      stockId: material.StockID,
      locationName: material.LocationName,
      materialType: material.MaterialType,
      qty: material.Qty,
      date: material.Date,
      serialNumberRange: material.SerialNumberRange,
      jobTicket: material.JobTicket,
      reasonDescription: material.ReasonDescription,
    }));
    return transactions;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchVaultReport() {
  try {
    const res = await fetch(`${API}/reports/vault`);
    if (!res) return [];

    const data = await res.json();
    if (!data?.length) return [];

    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
