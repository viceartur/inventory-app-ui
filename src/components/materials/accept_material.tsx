"use client";
import { FormEvent, useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

import { SubmitButton } from "ui/submit-button";
import {
  createMaterial,
  fetchIncomingMaterials,
} from "../../actions/materials";
import { incomingMaterialState, selectState } from "utils/constants";
import { fetchAvailableLocations } from "actions/warehouses";
import {
  formatUserName,
  toUSFormat,
  usePreventNumberInputScroll,
} from "utils/utils";
import { useSocket } from "context/socket-context";

export function IncomingMaterials(props: any) {
  const { data: session } = useSession();
  const [incomingMaterialsList, setIncomingMaterialsList] = useState([]);

  useEffect(() => {
    const getIncomingMaterials = async () => {
      const incomingMaterials = await fetchIncomingMaterials();
      // Displays only the CARDS material type if the parameter provided,
      // Otherwise display other types.
      const materials = incomingMaterials.filter((m: any) =>
        props.isCards ? m.materialType === "CARDS" : m.materialType !== "CARDS"
      );

      setIncomingMaterialsList(materials);
    };
    getIncomingMaterials();
  }, []);

  return (
    <section>
      {props.isCards ? (
        <h2>Incoming Vault Cards:</h2>
      ) : (
        <h2>Incoming Materials List:</h2>
      )}
      {incomingMaterialsList.length ? (
        <div className="material_list">
          <div className="list_header">
            <p>Customer</p>
            <p>Stock ID</p>
            <p>Quantity</p>
            <p>Sent By</p>
            <p>Action</p>
          </div>
          {incomingMaterialsList.map((material: any, i) => (
            <div className="material_list-item" key={i}>
              <p>{material.customerName}</p>
              <p>{material.stockId}</p>
              <p>{toUSFormat(material.quantity)}</p>
              <p>{formatUserName(material.username)}</p>
              {props.isCards &&
              session?.user.role !== "admin" &&
              session?.user.name !== "jcardullo" ? (
                "Restricted"
              ) : (
                <button
                  onClick={() => {
                    if (props.isCards) {
                      redirect(`/vault-cards/${material.shippingId}`);
                    } else {
                      redirect(`/incoming-materials/${material.shippingId}`);
                    }
                  }}
                >
                  📥
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>List is empty</p>
      )}
    </section>
  );
}

export function CreateMaterialForm(props: {
  materialId: string;
  isCards: boolean;
}) {
  const socket = useSocket();
  const [incomingMaterial, setIncomingMaterial] = useState(
    incomingMaterialState
  );
  const [selectLocations, setSelectLocations] = useState([selectState]);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sumbitMessage, setSubmitMessage] = useState("");
  usePreventNumberInputScroll();

  useEffect(() => {
    const getMaterialCard = async () => {
      const [material] = await fetchIncomingMaterials(props.materialId);
      const stockId = material.stockId;
      const owner = material.owner;
      let locations = await fetchAvailableLocations(stockId, owner);
      if (props.isCards) {
        locations = locations.filter((l: any) =>
          l.warehouseName.toLowerCase().includes("vault")
        );
      }

      setIncomingMaterial(material);
      setSelectLocations(locations);
    };
    getMaterialCard();
  }, []);

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFormData(formData);
    setShowConfirmation(true);
  };

  const confirmAction = async () => {
    setShowConfirmation(false);
    const incomingMaterialId = props.materialId;
    const res: any = await createMaterial(incomingMaterialId, formData);
    if (res?.error) {
      setSubmitMessage(res.error);
    } else {
      setSubmitMessage("Material Added. Redirecting to Incoming Materials...");
      socket?.send("materialsUpdated");
      setTimeout(() => {
        if (props.isCards) {
          redirect("/vault-cards/");
        } else {
          redirect("/incoming-materials/");
        }
      }, 2000);
    }
  };

  function cancelAction() {
    setShowConfirmation(false);
    setFormData(null);
  }

  return (
    <section>
      <h2>Adding the Material to the Location</h2>
      <form onSubmit={submitForm}>
        <div className="form-info">
          <h3>Information from CSR:</h3>
          <div className="form-info-line">
            <label>Customer: </label>
            {incomingMaterial.customerName}
          </div>
          <div className="form-info-line">
            <label>Stock ID: </label>
            {incomingMaterial.stockId}
          </div>
          <div className="form-info-line">
            <label>Description:</label>
            {incomingMaterial.description}
          </div>
          <div className="form-info-line">
            <label>Type: </label>
            {incomingMaterial.materialType}
          </div>
          <div className="form-info-line">
            <label>Ownership:</label>
            {incomingMaterial.owner}
          </div>
          <div className="form-info-line">
            <label>Allow for use:</label>
            {incomingMaterial.isActive ? "Yes" : "No"}
          </div>
        </div>
        <div className="form-line">
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            key={incomingMaterial.quantity}
            defaultValue={incomingMaterial.quantity}
            required
          />
        </div>
        {incomingMaterial.materialType === "CHIPS" && (
          <div className="form-line">
            <label>Serial # range:</label>
            <input
              type="text"
              name="serialNumberRange"
              placeholder="Serial # range to accept (ex. 1-1000)"
              required
            />
          </div>
        )}
        <div className="form-line">
          <label>Location:</label>
          <select name="locationId" required>
            {selectLocations.map((location: any, i: number) => (
              <option key={i} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-line">
          <label>Notes:</label>
          <input type="text" name="notes" placeholder="Notes" />
        </div>
        <p className="submit-message">{sumbitMessage}</p>
        <div className="form-buttons">
          <button
            type="button"
            onClick={() => {
              if (props.isCards) {
                redirect("/vault-cards/");
              } else {
                redirect("/incoming-materials/");
              }
            }}
          >
            Go back
          </button>
          <SubmitButton title="Add Material" />
        </div>
      </form>

      {showConfirmation && (
        <div className="confirmation-window">
          <p>Do you want to accept this material?</p>
          <p>Stock ID: "{incomingMaterial.stockId}"</p>
          <p>Quantity: {toUSFormat(Number(formData?.get("quantity")))}</p>
          <button type="button" onClick={confirmAction}>
            Yes
          </button>
          <button type="button" onClick={cancelAction}>
            No
          </button>
        </div>
      )}
    </section>
  );
}
