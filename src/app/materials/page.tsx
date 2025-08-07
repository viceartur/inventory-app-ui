import { Suspense } from "react";
import { Materials } from "../../components/materials/change_material";

export default async function MaterialsPage() {
  return (
    <Suspense>
      <Materials />
    </Suspense>
  );
}
