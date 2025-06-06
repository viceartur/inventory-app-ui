"use server";

import { API } from "utils/constants";

interface Customer {
  customerId: number;
  customerName: string;
  customerCode: string;
  atlasName: string;
  isActive: boolean;
}

export async function createCustomer(prevState: any, formData: FormData) {
  const customer = {
    customerName: String(formData.get("customerName")).trim(),
    customerCode: String(formData.get("customerCode"))
      .trim()
      .replace(/^0+/, ""),
    atlasName: String(formData.get("atlasName")).trim(),
    isActive: Boolean(formData.get("isActive")),
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

export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const res = await fetch(`${API}/customers`);
    const data = await res.json();
    if (!data?.length) {
      return [];
    }

    const customers = data.map((customer: Customer) => ({
      id: customer.customerId,
      name: customer.customerName,
      code: customer.customerCode,
      atlasName: customer.atlasName,
      isActive: customer.isActive,
    }));
    return customers;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchCustomer(
  customerId: number
): Promise<Customer | null> {
  try {
    const res = await fetch(`${API}/customers/${customerId}`);
    if (res.status != 200) {
      return null;
    }
    const data: Customer = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateCustomer(
  customerId: number,
  formData: FormData | null
) {
  try {
    if (!formData) return { error: "Error: No Form Data" };

    const customer = {
      customerId,
      customerName: String(formData.get("customerName")).trim(),
      customerCode: String(formData.get("customerCode"))
        .trim()
        .replace(/^0+/, ""),
      atlasName: String(formData.get("atlasName")).trim(),
      isActive: Boolean(formData.get("isActive")),
    };

    console.log(customer);

    const res = await fetch(`${API}/customers`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customer),
    });
    const data = await res.json();

    if (res.status != 200) {
      return { error: "Error: " + data.message };
    }

    return data;
  } catch (error: any) {
    return { error: "Error: " + error.message };
  }
}
