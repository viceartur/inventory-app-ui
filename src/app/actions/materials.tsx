"use server";

export async function sendMaterial(prevState: any, formData: FormData) {
  const material = {
    customerId: formData.get("customerId"),
    stockId: formData.get("stockId"),
    type: formData.get("materialType"),
    quantity: formData.get("qty"),
    cost: formData.get("cost"),
    minQuantity: formData.get("minQty"),
    maxQuantity: formData.get("maxQty"),
    description: formData.get("description"),
    owner: formData.get("owner") == "on" ? "Tag" : "Customer",
    isActive: formData.get("isActive") == "on",
  };

  const res = await fetch(
    `http://${process.env.NEXT_PUBLIC_SERVER_HOSTNAME}:${process.env.NEXT_PUBLIC_SERVER_PORT}/incoming_materials`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(material),
    }
  );

  if (res.status != 200) {
    return { message: res.statusText };
  }

  return { message: "Material Sent" };
}

export async function createMaterial(
  incomingMaterialId: string,
  formData: FormData
) {
  const incomingMaterial = {
    materialId: incomingMaterialId,
    quantity: formData.get("quantity"),
    locationId: formData.get("locationId"),
    notes: formData.get("notes"),
  };

  try {
    const res = await fetch(
      `http://${process.env.NEXT_PUBLIC_SERVER_HOSTNAME}:${process.env.NEXT_PUBLIC_SERVER_PORT}/materials`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(incomingMaterial),
      }
    );

    if (res.status != 200) {
      return { message: "Error: " + res.statusText };
    }
    return { message: "Material Added" };
  } catch (error: any) {
    return { message: "Error: " + error.message };
  }
}

export async function moveMaterial(materialId: string, formData: FormData) {
  const material = {
    materialId,
    quantity: formData.get("quantity"),
    locationId: formData.get("locationId"),
    notes: formData.get("notes"),
  };

  try {
    const res = await fetch(
      `http://${process.env.NEXT_PUBLIC_SERVER_HOSTNAME}:${process.env.NEXT_PUBLIC_SERVER_PORT}/materials/move-to-location`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(material),
      }
    );

    if (res.status != 200) {
      return { message: "Error: " + res.statusText };
    }
    return { message: "Material Moved" };
  } catch (error: any) {
    return { message: "Error: " + error.message };
  }
}

export async function removeMaterial(materialId: string, formData: FormData) {
  const material = {
    materialId,
    quantity: formData.get("quantity"),
    jobTicket: formData.get("jobTicket"),
  };

  try {
    const res = await fetch(
      `http://${process.env.NEXT_PUBLIC_SERVER_HOSTNAME}:${process.env.NEXT_PUBLIC_SERVER_PORT}/materials/remove-from-location`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(material),
      }
    );

    if (res.status != 200) {
      return { message: "Error: " + res.statusText };
    }
    return { message: "Material Removed" };
  } catch (error: any) {
    return { message: "Error: " + error.message };
  }
}
