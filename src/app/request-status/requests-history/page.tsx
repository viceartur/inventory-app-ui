import { Suspense } from "react";
import { RequestStatus } from "../../../components/materials/request_material";

export default async function ProcessedRequestsPage() {
  return (
    <Suspense>
      <RequestStatus />
    </Suspense>
  );
}
