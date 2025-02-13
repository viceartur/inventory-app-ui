import { RequestedMaterialForm } from "../../../components/materials/request_material";

export default async function HandleRequestedMaterialPage(props: any) {
  const { requestId } = await props.params;
  return (
    <>
      <RequestedMaterialForm requestId={requestId} />
    </>
  );
}
