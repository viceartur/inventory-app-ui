"use client";
import { Transactions } from "app/components/reports";
import { Suspense } from "react";

export default function TransactionsPage() {
  return (
    <Suspense>
      <Transactions />
    </Suspense>
  );
}
