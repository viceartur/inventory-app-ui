import { RemoveMaterialForm } from "../../../../components/materials/change_material";

export default async function RemoveMaterialPage(props: any) {
  const { materialId } = await props.params;
  return <RemoveMaterialForm materialId={materialId} />;
}
