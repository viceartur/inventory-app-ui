"use server";

export async function createWarehouse(prevState: any, formData: FormData) {
  const warehouse = {
    warehouseName: formData.get("warehouseName"),
    locationName: formData.get("locationName"),
  };

  console.log(warehouse);

  const res = await fetch("http://192.168.6.59:8080/warehouses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(warehouse),
  });

  console.log(res);

  if (res.status != 200) {
    return { message: "Error: " + res.statusText };
  }

  return { message: "Warehouse Created" };
}
