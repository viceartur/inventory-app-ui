import { Suspense } from "react";
import { ProcessedRequests } from "../../../components/materials/request_material";

export default async function ProcessedRequestsPage() {
  return (
    <Suspense>
      <ProcessedRequests />
    </Suspense>
  );
}
