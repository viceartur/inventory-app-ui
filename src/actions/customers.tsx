"use server";

import { API } from "utils/constants";

export async function createCustomer(prevState: any, formData: FormData) {
  const customer = {
    customerName: formData.get("customerName"),
    customerCode: formData.get("customerCode"),
  };

  try {
    const res = await fetch(`${API}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customer),
    });

    if (res.status != 200) {
      return { message: "Error: " + res.statusText };
    }
    return { message: `Customer "${customer.customerName}" added` };
  } catch (error: any) {
    return { message: "Error: " + error.message };
  }
}

export async function fetchCustomers() {
  try {
    const res = await fetch(`${API}/customers`);
    const data = await res.json();
    if (!data?.length) {
      return [];
    }

    const customers = data.map((customer: any) => ({
      id: customer.ID,
      name: customer.Name,
      code: customer.Code,
    }));
    return customers;
  } catch (error) {
    console.error(error);
    return [];
  }
}
