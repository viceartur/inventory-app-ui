"use server";

import { API } from "utils/constants";
import { filterMaterialsByUserRole } from "utils/server_utils";

export interface IncomingMaterial {
  shippingId: number;
  programName?: string;
  programId: number;
  stockId: string;
  cost: number;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  description: string;
  materialStatus: string;
  materialType: string;
  owner: string;
  username?: string;
}

export interface Material {
  materialId: number;
  warehouseName: string;
  stockId: string;
  programId: number;
  programName: string;
  isActiveProgram: boolean;
  locationId: number;
  locationName: string;
  materialType: string;
  description: string;
  notes: string;
  quantity: number;
  updatedAt: string;
  materialStatus: string;
  minQty: number;
  maxQty: number;
  cost: number;
  owner: string;
  isPrimary: boolean;
  serialNumberRange: string;
  requestId: number;
  userName: string;
  status: string;
  qtyRequested: number;
  qtyUsed: number;
  requestedAt: string;
}

export interface RequestedMaterial {
  description: string;
  stockId: string;
  quantity: number;
}

export interface RequestedInfo {
  quantity?: number;
  status?: string;
  notes: string;
}

export async function fetchMaterialTypes() {
  try {
    const res = await fetch(`${API}/material_types`);
    if (!res) return [];

    const data = await res.json();
    if (!data?.length) return [];

    const types = data
      .map((type: any, i: number) => ({
        id: i,
        name: type,
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    return types;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchMaterialUsageReasons() {
  try {
    const res = await fetch(`${API}/material_usage_reasons`);
    if (!res) return [];

    const data = await res.json();
    if (!data?.length) return [];

    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function sendMaterial(formData: FormData | null, userId: number) {
  if (!formData) return { error: "Error: No Form Data" };
  if (!userId) return { error: "Error: User Not Detected" };

  const material = {
    programId: Number(formData.get("programId")),
    stockId: String(formData.get("stockId")),
    materialType: String(formData.get("materialType")),
    quantity: Number(formData.get("qty")),
    cost: Number(formData.get("cost")),
    minQuantity: Number(formData.get("minQty")),
    maxQuantity: Number(formData.get("maxQty")),
    description: String(formData.get("description")),
    owner: String(formData.get("owner")),
    materialStatus: String(formData.get("materialStatus")),
    userId: Number(userId),
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
    return { error: "Error: " + error.message };
  }
}

export async function fetchIncomingMaterials(
  shippingId: number = 0
): Promise<IncomingMaterial[]> {
  try {
    const queryParams = new URLSearchParams({
      materialId: String(shippingId),
    });

    const res = await fetch(
      `${API}/incoming_materials?${queryParams.toString()}`
    );
    if (!res) return [];

    const data = await res.json();
    if (!data?.length) return [];

    const materials: IncomingMaterial[] = data;

    return materials;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateIncomingMaterial(
  formData: FormData | null,
  shippingId: number
) {
  if (!formData) return { error: "Error: No Form Data" };

  const material: IncomingMaterial = {
    shippingId: Number(shippingId),
    programId: Number(formData.get("programId")),
    stockId: String(formData.get("stockId")),
    materialType: String(formData.get("materialType")),
    quantity: Number(formData.get("qty")),
    cost: Number(formData.get("cost")),
    minQuantity: Number(formData.get("minQty")),
    maxQuantity: Number(formData.get("maxQty")),
    description: String(formData.get("description")),
    owner: String(formData.get("owner")),
    materialStatus: String(formData.get("materialStatus")),
  };

  try {
    const res = await fetch(`${API}/incoming_materials`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(material),
    });

    if (res.status != 200) {
      return { message: res.statusText };
    }
    return null;
  } catch (error: any) {
    return { error: "Error: " + error.message };
  }
}

export async function deleteIncomingMaterial(shippingId: number) {
  const body = {
    shippingId: Number(shippingId),
  };

  try {
    const res = await fetch(`${API}/incoming_materials`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.status != 200) {
      return { message: res.statusText };
    }
    return null;
  } catch (error: any) {
    return { error: "Error: " + error.message };
  }
}

export async function createMaterial(
  incomingMaterialId: number,
  formData: FormData | null
) {
  if (!formData) return { error: "Error: No Form Data" };

  const incomingMaterial = {
    materialId: Number(incomingMaterialId),
    quantity: Number(formData.get("quantity")),
    locationId: Number(formData.get("locationId")),
    notes: String(formData.get("notes")),
    serialNumberRange: String(formData.get("serialNumberRange")),
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

export async function updateMaterial(material: any) {
  try {
    const res = await fetch(`${API}/materials`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(material),
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

export async function moveMaterial(
  materialId: number,
  formData: FormData | null
) {
  if (!formData) return { error: "Error: No Form Data" };

  const material = {
    materialId: Number(materialId),
    quantity: Number(formData.get("quantity")),
    locationId: Number(formData.get("locationId")),
  };

  try {
    const res = await fetch(`${API}/materials/move-to-location`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(material),
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

export async function removeMaterial(
  materialId: number,
  formData: FormData | null
) {
  try {
    if (!formData) return { error: "Error: No Form Data" };

    const material = {
      materialId: Number(materialId),
      quantity: Number(formData.get("quantity")),
      jobTicket: String(formData.get("jobTicket")),
      serialNumberRange: String(formData.get("serialNumberRange")),
      reasonId: Number(formData.get("remakeReasons")),
    };

    const res: any = await fetch(`${API}/materials/remove-from-location`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(material),
    });
    const data = await res.json();
    if (res.status != 200) throw new Error(data.message);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function fetchMaterials(filterOpts: any): Promise<Material[]> {
  const {
    materialId = "",
    stockId = "",
    programName = "",
    description = "",
    locationName = "",
    userRole = "",
  } = filterOpts;

  const queryParams = new URLSearchParams({
    materialId,
    stockId,
    programName,
    description,
    locationName,
  });

  try {
    const res = await fetch(`${API}/materials/like?${queryParams.toString()}`);
    if (!res) return [];

    const data = await res.json();
    if (!data?.length) return [];

    let materials: Material[] = data;

    // Filter materials based on user role
    materials = filterMaterialsByUserRole(materials, userRole);

    return materials;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchMaterialsByStockID(
  stockId: string,
  userRole: string
): Promise<Material[]> {
  try {
    const res = await fetch(`${API}/materials/exact?stockId=${stockId}`);
    if (!res) return [];

    const data = await res.json();
    if (!data?.length) return [];

    let materials: Material[] = data;

    // Filter materials based on user role
    materials = filterMaterialsByUserRole(materials, userRole);

    return materials;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchRequestedMaterials(filterOpts: any) {
  try {
    const {
      requestId = "",
      stockId = "",
      status = "",
      requestedFrom = "",
      requestedTo = "",
    } = filterOpts;
    const queryParams = new URLSearchParams({
      requestId,
      stockId,
      status,
      requestedFrom,
      requestedTo,
    });

    const res = await fetch(
      `${API}/requested_materials?${queryParams.toString()}`
    );
    if (!res) return [];

    const data = await res.json();
    if (!data?.data?.length) return [];

    const materials = data.data.map((material: any) => ({
      ...material,
      quantity: material.qtyRequested - material.qtyUsed,
    }));

    return materials;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateRequestedMaterial(
  requestId: number,
  requestInfo: RequestedInfo
) {
  try {
    const { quantity = 0, status = "declined", notes = "" } = requestInfo;

    const data = {
      materialId: Number(requestId),
      quantity: Number(quantity),
      status,
      notes,
    };

    const res: any = await fetch(`${API}/requested_materials`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.status != 200) throw new Error(json.message);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function fetchMaterialDescription(filterOpts: {
  stockId: string;
}) {
  try {
    const { stockId = "" } = filterOpts;
    const queryParams = new URLSearchParams({
      stockId,
    });

    const res = await fetch(
      `${API}/materials/description?${queryParams.toString()}`
    );
    if (!res) return "";

    const data = await res.json();
    if (!data?.data) return "";

    return data.data;
  } catch (error) {
    console.error(error);
    return "";
  }
}

export async function fetchMaterialTransactions(filterOpts: {
  jobTicket: string;
}) {
  try {
    const { jobTicket = "" } = filterOpts;
    const queryParams = new URLSearchParams({
      jobTicket,
    });

    const res = await fetch(
      `${API}/materials/transactions?${queryParams.toString()}`
    );
    if (!res) return [];

    const data = await res.json();
    if (!data?.data) return [];

    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function requestMaterial(
  materialData: RequestedMaterial,
  userId: number
) {
  if (!materialData) return { error: "Error: No Material data provided" };
  if (!userId) return { error: "Error: User not detected" };

  const body = {
    materials: [materialData],
    userId,
  };

  try {
    const res = await fetch(`${API}/requested_materials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.status != 200) {
      return { message: res.statusText };
    }

    return {
      message: `Material "${materialData.description} (${materialData.stockId})" successfully requested from the Warehouse.`,
    };
  } catch (error: any) {
    return { error: "Error: " + error.message };
  }
}

export async function fetchRequestedMaterialsCount(): Promise<number> {
  try {
    const res = await fetch(`${API}/requested_materials/count`);
    if (!res) return 0;

    const data = await res.json();
    if (!data?.data) return 0;

    return data.data;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export async function fetchMaterialsGroupedByStockID(): Promise<Material[]> {
  try {
    const res = await fetch(`${API}/materials/grouped-by-stock`);
    if (!res) return [];

    const data = await res.json();
    if (!data?.length) return [];

    let materials: Material[] = data;

    return materials;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateStockIDStatus(formData: FormData, stockId: string) {
  try {
    const status = formData.get("materialStatus");

    const res = await fetch(`${API}/materials/${stockId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
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
