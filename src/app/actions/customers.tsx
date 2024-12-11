"use server";

export async function createCustomer(prevState: any, formData: FormData) {
  const customer = {
    customerName: formData.get("customerName"),
    customerCode: formData.get("customerCode"),
  };

  const res = await fetch("http://localhost:8080/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  });

  if (res.status != 200) {
    return { message: res.statusText };
  }

  return { message: "Customer Added" };
}
