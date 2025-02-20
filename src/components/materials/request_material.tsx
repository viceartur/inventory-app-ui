"use client";
import { FormEvent, useEffect, useState } from "react";
import { redirect } from "next/navigation";

import {
  fetchMaterials,
  fetchRequestedMaterials,
  updateRequestedMaterial,
} from "../../actions/materials";
import { toUSFormat } from "utils/utils";
import { SubmitButton } from "ui/submit-button";

export function RequestedMaterials() {
  const [requestedMaterials, setRequestedMaterials] = useState([]);

  useEffect(() => {
    const getRequestedMaterials = async () => {
      const materials = await fetchRequestedMaterials({ status: "pending" });
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
  const [submitMessage, setSubmitMessage] = useState("");
  const [declineReason, setDeclineReason] = useState<string | null>(null);
  const [requestedMaterial, setRequestedMaterial] = useState<any>({});
  const [foundMaterials, setFoundMaterials] = useState([]);
  const [materialToUse, setMaterialToUse] = useState<any>({});

  useEffect(() => {
    const getRequestedMaterialInfo = async () => {
      const requestedMaterials = await fetchRequestedMaterials({
        status: "pending",
      });
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
        } else {
          setSubmitMessage("Material Not Found");
        }
      }
    };
    getRequestedMaterialInfo();
  }, []);

  const onLocationChange = (event: any) => {
    event.preventDefault();
    const locId = event.target.value;
    const materialToUse = foundMaterials.find(
      (m: any) => m.locationId === Number(locId)
    );
    setMaterialToUse(materialToUse);
  };

  const onSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowConfirmation(true);
  };

  const handleUseButton = () => {
    redirect(
      `/materials/remove-material/${materialToUse.materialId}?quantity=${
        requestedMaterial.quantity < materialToUse.quantity // check whether the destination location has enough quantity
          ? requestedMaterial.quantity // send the requested quantity
          : materialToUse.quantity // send the location quantity
      }&requestId=${requestedMaterial.requestId}`
    );
  };

  const confirmDeclineAction = async () => {
    setShowConfirmation(false);
    try {
      await updateRequestedMaterial(requestedMaterial.requestId, {
        notes: declineReason,
      });
      setSubmitMessage(
        "Material Declined. Redirecting to Requested Materials..."
      );
      setTimeout(() => {
        redirect("/requested-materials");
      }, 2000);
    } catch (error: any) {
      setSubmitMessage(error.message);
    }
  };

  function cancelDeclineAction() {
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
        </div>
        {!!foundMaterials.length && (
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
        )}
        <p className="submit-message">{submitMessage}</p>
        <div className="form-buttons">
          {!!foundMaterials.length && (
            <button type="button" onClick={handleUseButton}>
              Go to Use
            </button>
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
            <button type="button" onClick={confirmDeclineAction}>
              Confirm
            </button>
            <button type="button" onClick={cancelDeclineAction}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export function ProcessedRequests() {
  const [requestedMaterials, setRequestedMaterials] = useState([]);

  useEffect(() => {
    const getRequestedMaterials = async () => {
      const materials = await fetchRequestedMaterials({});
      setRequestedMaterials(materials);
    };
    getRequestedMaterials();
  }, []);

  return (
    <section>
      <h2>Processed Materials Requests:</h2>
      <table>
        <thead>
          <tr>
            <th>Stock ID</th>
            <th>Description</th>
            <th>Requested Qty</th>
            <th>Used Qty</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {requestedMaterials.map((material: any, i) => (
            <tr key={i}>
              <td>{material.stockId}</td>
              <td>{material.description}</td>
              <td>{toUSFormat(material.qtyRequested)}</td>
              <td>{toUSFormat(material.qtyUsed)}</td>
              <td className={material.status === "declined" ? "negative" : ""}>
                {material.status}
              </td>
              <td>{material.notes}</td>
              <td>
                {new Date(material.updatedAt).toISOString().split("T")[0]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
