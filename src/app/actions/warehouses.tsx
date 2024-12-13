"use server";

export async function createWarehouse(prevState: any, formData: FormData) {
  const warehouse = {
    warehouseName: formData.get("warehouseName"),
    locationName: formData.get("locationName"),
  };

  try {
    const res = await fetch(
      `http://${process.env.NEXT_PUBLIC_SERVER_HOSTNAME}:${process.env.NEXT_PUBLIC_SERVER_PORT}/warehouses`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(warehouse),
      }
    );

    console.log(res);

    if (res.status != 200) {
      return { message: "Error: " + res.statusText };
    }
    return { message: `Warehouse "${warehouse.warehouseName}" created` };
  } catch (error: any) {
    return { message: "Error: " + error.message };
  }
}
