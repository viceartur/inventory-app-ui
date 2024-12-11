"use server";

export async function createCustomer(prevState: any, formData: FormData) {
  const customer = {
    customerName: formData.get("customerName"),
    customerCode: formData.get("customerCode"),
  };

  try {
    const res = await fetch(
      `http://${process.env.NEXT_PUBLIC_SERVER_HOSTNAME}:${process.env.NEXT_PUBLIC_SERVER_PORT}/customers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customer),
      }
    );

    if (res.status != 200) {
      return { message: "Error: " + res.statusText };
    }
    return { message: "Customer Added" };
  } catch (error: any) {
    return { message: "Error: " + error.message };
  }
}
