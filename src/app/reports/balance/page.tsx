"use client";
import { Balance } from "../../../components/reports";
import { Suspense } from "react";

export default function BalancePage() {
  return (
    <Suspense>
      <Balance />
    </Suspense>
  );
}
