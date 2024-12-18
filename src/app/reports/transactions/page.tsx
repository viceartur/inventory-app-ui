"use client";
import { Transactions } from "../../../components/reports";
import { Suspense } from "react";

export default function TransactionsPage() {
  return (
    <Suspense>
      <Transactions />
    </Suspense>
  );
}
