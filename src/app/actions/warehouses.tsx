"use server";

import { API } from "app/utils/constants";

export async function createWarehouse(prevState: any, formData: FormData) {
  const warehouse = {
    warehouseName: formData.get("warehouseName"),
    locationName: formData.get("locationName"),
  };

  try {
    const res = await fetch(`${API}/warehouses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(warehouse),
    });

    if (res.status != 200) {
      return { message: "Error: " + res.statusText };
    }
    return {
      message: `Location "${warehouse.locationName}" attached to the Warehouse "${warehouse.warehouseName}"`,
    };
  } catch (error: any) {
    return { message: "Error: " + error.message };
  }
}
