"use server";

import { API } from "utils/constants";

export interface Customer {
  customerId?: number;
  customerName: string;
  emails: string[];
  userId: number;
  username?: string;
  isConnectedToReports: boolean;
  lastReportSentAt?: string;
  lastReportDeliveryStatus?: string;
}

export interface CustomerProgram {
  programId?: number;
  programName: string;
  programCode: string;
  isActive: boolean;
  customerId: number;
  customerName?: string;
}

export interface EmailReport {
  dateFrom: string;
  dateTo: string;
}

///////////////////////////
// CUSTOMERS OPERATIONS //
/////////////////////////

export async function createCustomer(formData: FormData, userId: number) {
  try {
    if (!formData) return { error: "Error: No Form Data" };
    if (!userId) return { error: "Error: User Not Detected" };

    const emails = String(formData.get("emails"))
      .toLowerCase()
      .replace(/\s/g, "")
      .split(",");

    const customer: Customer = {
      customerName: String(formData.get("customerName")).trim(),
      emails,
      userId: Number(userId),
      isConnectedToReports: Boolean(formData.get("isConnectedToReports")),
    };

    const res: Response = await fetch(`${API}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customer),
    });
    const data = await res.json();

    if (res.status != 200) {
      return { error: "Error: " + data.message };
    }
    return { message: data.message };
  } catch (error: any) {
    return { error: "Internal Server Error: " + error.message };
  }
}

export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const res = await fetch(`${API}/customers`);
    const data = await res.json();
    if (!data?.length) {
      return [];
    }
    const customers: Customer[] = data;
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
  userId: number,
  customerId: number,
  formData: FormData | null
) {
  try {
    if (!formData) return { error: "Error: No Form Data" };

    const emails = String(formData.get("emails"))
      .toLowerCase()
      .replace(/\s/g, "")
      .split(",");

    const customer: Customer = {
      customerName: String(formData.get("customerName")).trim(),
      emails,
      userId: Number(userId),
      isConnectedToReports: Boolean(formData.get("isConnectedToReports")),
    };

    const res: Response = await fetch(`${API}/customers/${customerId}`, {
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
    return { message: data.message };
  } catch (error: any) {
    return { error: "Internal Server Error: " + error.message };
  }
}

///////////////////////////////////
// CUSTOMER PROGRAMS OPERATIONS //
/////////////////////////////////

export async function createCustomerProgram(formData: FormData) {
  try {
    const program: CustomerProgram = {
      programName: String(formData.get("programName")).trim(),
      programCode: String(formData.get("programCode"))
        .trim()
        .replace(/^0+/, ""),
      isActive: Boolean(formData.get("isActiveProgram")),
      customerId: Number(formData.get("customerId")),
    };

    const res: Response = await fetch(`${API}/customer_programs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(program),
    });
    const data = await res.json();

    if (res.status != 200) {
      return { error: "Error: " + data.message };
    }
    return { message: data.message };
  } catch (error: any) {
    return { error: "Internal Server Error: " + error.message };
  }
}

export async function fetchCustomerPrograms(): Promise<CustomerProgram[]> {
  try {
    const res = await fetch(`${API}/customer_programs`);
    const data = await res.json();
    if (!data?.length) {
      return [];
    }
    const programs: CustomerProgram[] = data;
    return programs;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchCustomerProgram(
  programId: number
): Promise<CustomerProgram | null> {
  try {
    const res = await fetch(`${API}/customer_programs/${programId}`);
    if (res.status != 200) {
      return null;
    }
    const data: CustomerProgram = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateCustomerProgram(
  programId: number,
  formData: FormData | null
) {
  try {
    if (!formData) return { error: "Error: No Form Data" };

    const program: CustomerProgram = {
      programName: String(formData.get("programName")).trim(),
      programCode: String(formData.get("programCode"))
        .trim()
        .replace(/^0+/, ""),
      isActive: Boolean(formData.get("isActiveProgram")),
      customerId: Number(formData.get("customerId")),
    };

    const res: Response = await fetch(`${API}/customer_programs/${programId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(program),
    });
    const data = await res.json();

    if (res.status != 200) {
      return { error: "Error: " + data.message };
    }
    return { message: data.message };
  } catch (error: any) {
    return { error: "Internal Server Error: " + error.message };
  }
}

export async function sendEmailToCustomer(
  customerId: number,
  formData: FormData
) {
  try {
    if (!formData) return { error: "Error: No Form Data" };

    const emailReport: EmailReport = {
      dateFrom: String(formData.get("dateFrom")).split("T")[0],
      dateTo: String(formData.get("dateTo")).split("T")[0],
    };

    console.log("emailReport", emailReport);

    const res: Response = await fetch(
      `${API}/email_customer_report/${customerId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailReport),
      }
    );
    const data = await res.json();

    if (res.status != 200) {
      return { error: "Error: " + data.message };
    }
    return { message: data.message };
  } catch (error: any) {
    return { error: "Internal Server Error: " + error.message };
  }
}
