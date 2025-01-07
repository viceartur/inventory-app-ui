"use server";

import { API } from "utils/constants";

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

  try {
    const res = await fetch(`${API}/incoming_materials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(material),
    });

    if (res.status != 200) {
      return { message: res.statusText };
    }
    return { message: `Material "${material.stockId}" sent to the Warehouse` };
  } catch (error: any) {
    return { message: "Error: " + error.message };
  }
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
    const res = await fetch(`${API}/materials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(incomingMaterial),
    });
    const data = await res.json();

    if (res.status != 200) {
      return { error: "Error: " + data.message };
    }
    return null;
  } catch (error: any) {
    return { error: "Error: " + error.message };
  }
}

export async function moveMaterial(materialId: string, formData: FormData) {
  const material = {
    materialId,
    quantity: formData.get("quantity"),
    locationId: formData.get("locationId"),
  };

  try {
    const res = await fetch(`${API}/materials/move-to-location`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(material),
    });

    if (res.status != 200) {
      return { error: "Error: " + res.statusText };
    }
    return null;
  } catch (error: any) {
    return { error: "Error: " + error.message };
  }
}

export async function removeMaterial(materialId: string, formData: FormData) {
  const material = {
    materialId,
    quantity: formData.get("quantity"),
    jobTicket: formData.get("jobTicket"),
  };

  try {
    const res = await fetch(`${API}/materials/remove-from-location`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(material),
    });

    if (res.status != 200) {
      return { error: "Error: " + res.statusText };
    }
    return null;
  } catch (error: any) {
    return { error: "Error: " + error.message };
  }
}

export async function fetchMaterials(filterOpts: any) {
  const { stockId, customerName, description, locationName } = filterOpts;

  const res = await fetch(
    `${API}/materials?stockId=${stockId}&customerName=${customerName}&description=${description}&locationName=${locationName}`
  );
  if (!res) return [];

  const data = await res.json();
  if (!data?.length) return [];

  const materials = data.map((material: any) => {
    const {
      MaterialID,
      WarehouseName,
      StockID,
      CustomerID,
      CustomerName,
      LocationID,
      LocationName,
      MaterialType,
      Description,
      Notes,
      Quantity,
      UpdatedAt,
      IsActive,
      Cost,
      MinQty,
      MaxQty,
      Owner,
      IsPrimary,
    } = material;

    return {
      materialId: MaterialID,
      warehouseName: WarehouseName,
      stockId: StockID,
      customerId: CustomerID,
      customerName: CustomerName,
      locationId: LocationID,
      locationName: LocationName,
      materialType: MaterialType,
      description: Description,
      notes: Notes,
      qty: Quantity,
      updatedAt: UpdatedAt,
      isActive: IsActive,
      cost: Cost,
      minQty: MinQty,
      maxQty: MaxQty,
      owner: Owner,
      isPrimary: IsPrimary,
    };
  });

  return materials;
}
