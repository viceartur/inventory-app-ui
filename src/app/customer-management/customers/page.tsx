"use client";

import { AddCustomerForm, Customers } from "components/customers";

export default function CustomersPage() {
  return (
    <>
      <AddCustomerForm />
      <Customers />
    </>
  );
}
