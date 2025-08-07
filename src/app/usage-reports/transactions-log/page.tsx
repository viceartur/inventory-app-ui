"use client";
import { TransactionsLog } from "components/reports/usage-reports";
import { Suspense } from "react";

export default function TransactionsLogPage() {
  return (
    <Suspense>
      <TransactionsLog />
    </Suspense>
  );
}
