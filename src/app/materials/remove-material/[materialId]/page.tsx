import { RemoveMaterialForm } from "app/components/materials";

export default async function RemoveMaterialPage(props: any) {
  const { materialId } = await props.params;
  return (
    <>
      <RemoveMaterialForm materialId={materialId} />
    </>
  );
}
