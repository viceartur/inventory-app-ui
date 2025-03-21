// Filters materials based on user role
export const filterMaterialsByUserRole = (
  materials: any[],
  userRole: string
): any[] => {
  console.log(userRole);
  switch (userRole) {
    case "production":
    case "warehouse":
      return materials.filter((m: any) => m.quantity);
    case "vault":
      return materials.filter(
        (m: any) =>
          m.quantity && m.warehouseName?.toLowerCase().includes("vault")
      );
    default:
      return materials;
  }
};
