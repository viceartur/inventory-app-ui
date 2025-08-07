import { Material } from "actions/materials";

// Filters materials based on user role
export const filterMaterialsByUserRole = (
  materials: Material[],
  userRole: string
): any[] => {
  switch (userRole) {
    case "warehouse":
      return materials.filter(
        (m: any) =>
          m.quantity && m.warehouseName?.toLowerCase().includes("warehouse")
      );
    case "vault":
      return materials.filter(
        (m: any) =>
          m.quantity && m.warehouseName?.toLowerCase().includes("vault")
      );
    default:
      return materials;
  }
};
