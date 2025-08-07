"use client";
import { WeeklyUsage } from "../../../components/reports/usage-reports";
import { Suspense } from "react";

export default function TransactionsPage() {
  return (
    <Suspense>
      <WeeklyUsage />
    </Suspense>
  );
}
