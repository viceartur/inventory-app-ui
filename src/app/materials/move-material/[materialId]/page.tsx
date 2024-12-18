import { MoveMaterialForm } from "../../../../components/materials";

export default async function MoveMaterialPage(props: any) {
  const { materialId } = await props.params;
  return (
    <>
      <MoveMaterialForm materialId={materialId} />
    </>
  );
}
