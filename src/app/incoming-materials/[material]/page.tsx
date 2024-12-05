import { CreateMaterialForm } from "app/components/materials";

export default async function IncomingMaterial(props: any) {
  const { material } = await props.params;
  return (
    <>
      <CreateMaterialForm materialId={material} />
    </>
  );
}
