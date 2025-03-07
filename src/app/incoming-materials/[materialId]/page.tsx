import { CreateMaterialForm } from "../../../components/materials/accept_material";

export default async function IncomingMaterialPage(props: any) {
  const { materialId } = await props.params;
  return <CreateMaterialForm materialId={materialId} isCards={false} />;
}
