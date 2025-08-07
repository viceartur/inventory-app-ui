import { EditIncomingMaterial } from "../../../components/materials/send_material";

export default async function EditIncomingMaterialPage(props: any) {
  const { shippingId } = await props.params;
  return <EditIncomingMaterial shippingId={shippingId} />;
}
