"use client";
import { FormEvent, useEffect, useState } from "react";
import { redirect } from "next/navigation";

import {
  fetchMaterials,
  fetchRequestedMaterials,
} from "../../actions/materials";
import { toUSFormat } from "utils/utils";
import { SubmitButton } from "ui/submit-button";

export function RequestedMaterials() {
  const [requestedMaterials, setRequestedMaterials] = useState([]);

  useEffect(() => {
    const getRequestedMaterials = async () => {
      const materials = await fetchRequestedMaterials();
      setRequestedMaterials(materials);
    };
    getRequestedMaterials();
  }, []);

  return (
    <section>
      <h2>Requested Materials:</h2>
      <p>The list shows the Materials are requested by Production.</p>
      {requestedMaterials.length ? (
        <div className="material_list">
          <div className="list_header">
            <p>Stock ID</p>
            <p>Description</p>
            <p>Requested By</p>
            <p>Quantity</p>
            <p>Action</p>
          </div>
          {requestedMaterials.map((material: any, i) => (
            <div className="material_list-item" key={i}>
              <p>{material.stockId}</p>
              <p>{material.description}</p>
              <p>{material.username || "HSA"}</p>
              <p>{toUSFormat(material.quantity)}</p>
              <button
                onClick={() =>
                  redirect(`/requested-materials/${material.requestId}`)
                }
              >
                Handle
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>List is empty</p>
      )}
    </section>
  );
}

export function RequestedMaterialForm(props: { requestId: string }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [declineReason, setDeclineReason] = useState<string | null>(null);
  const [requestedMaterial, setRequestedMaterial] = useState<any>({});
  const [foundMaterials, setFoundMaterials] = useState([]);
  const [materialToUse, setMaterialToUse] = useState<any>({});

  useEffect(() => {
    const getRequestedMaterialInfo = async () => {
      const requestedMaterials = await fetchRequestedMaterials();
      const requestedMaterial = requestedMaterials.find(
        (m: any) => m.requestId === Number(props.requestId)
      );

      if (requestedMaterial) {
        setRequestedMaterial(requestedMaterial);
        const materials = await fetchMaterials({
          stockId: requestedMaterial.stockId,
        });

        if (materials.length > 0) {
          setFoundMaterials(materials);
          setMaterialToUse(materials[0]);
        }
      }
    };
    getRequestedMaterialInfo();
  }, []);

  const onLocationChange = (event: any) => {
    event.preventDefault();
    const locId = event.target.value;
    console.log(locId);
    const materialToUse = foundMaterials.find(
      (m: any) => m.locationId === Number(locId)
    );
    setMaterialToUse(materialToUse);
  };

  const onSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowConfirmation(true);
  };

  const confirmAction = async () => {
    setShowConfirmation(false);
    console.log("API request.Reason", declineReason);
  };

  function cancelAction() {
    setShowConfirmation(false);
    setDeclineReason(null);
  }

  return (
    <section>
      <button type="button" onClick={() => redirect("/requested-materials/")}>
        Go Back
      </button>
      <form onSubmit={onSubmitForm}>
        <div className="form-info">
          <h3>Requested Material:</h3>
          <div className="form-info-line">
            <label>Stock ID:</label>
            {requestedMaterial.stockId}
          </div>
          <div className="form-info-line">
            <label>Description:</label>
            {requestedMaterial.description}
          </div>
          <div className="form-info-line">
            <label>Requested By:</label>
            {requestedMaterial.username || "HSA"}
          </div>
          <div className="form-info-line">
            <label>Requested Qty:</label>
            {requestedMaterial.quantity}
          </div>
        </div>{" "}
        {foundMaterials.length ? (
          <div className="form-line">
            <label>Location to Use:</label>

            <select name="locationId" required onChange={onLocationChange}>
              {foundMaterials.map((material: any, i: number) => (
                <option key={i} value={material.locationId}>
                  {material.locationName} {material.isPrimary && "(Primary)"}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="submit-message">Not Found</p>
        )}
        <div>
          {foundMaterials.length &&
          requestedMaterial.quantity < materialToUse.quantity ? (
            <button
              type="button"
              onClick={() =>
                redirect(
                  `/materials/remove-material/${materialToUse.materialId}?quantity=${requestedMaterial.quantity}&requestId=${requestedMaterial.requestId}`
                )
              }
            >
              Go to Use
            </button>
          ) : (
            <p className="submit-message">
              Insufficient Amount on the Location: {materialToUse.quantity}
            </p>
          )}
          <SubmitButton title="Decline" />
        </div>
      </form>

      {showConfirmation && (
        <div className="confirmation-window">
          <p>Please Enter the Decline Reason</p>
          <input
            type="text"
            placeholder="Any reason here"
            required
            onChange={(e) => {
              setDeclineReason(e.target.value);
            }}
          />
          <div>
            <button type="button" onClick={confirmAction}>
              Confirm
            </button>
            <button type="button" onClick={cancelAction}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
