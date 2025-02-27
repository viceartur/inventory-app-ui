"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import { SubmitButton } from "ui/submit-button";
import {
  fetchIncomingMaterials,
  fetchMaterialTypes,
  sendMaterial,
  updateIncomingMaterial,
} from "../../actions/materials";
import { selectState } from "utils/constants";
import { fetchCustomers } from "actions/customers";
import {
  formatUserName,
  toUSFormat,
  usePreventNumberInputScroll,
} from "utils/utils";
import { useSocket } from "context/socket-context";
import { redirect } from "next/navigation";

export function SendMaterialForm() {
  const { data: session } = useSession();
  const socket = useSocket();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [selectCustomers, setSelectCustomers] = useState([selectState]);
  const [selectMaterialTypes, setSelectMaterialTypes] = useState([selectState]);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sumbitMessage, setSubmitMessage] = useState("");
  usePreventNumberInputScroll();

  useEffect(() => {
    const getMaterialInfo = async () => {
      const customers = await fetchCustomers();
      const types = await fetchMaterialTypes();
      setSelectCustomers(customers);
      setSelectMaterialTypes(types);
    };
    getMaterialInfo();
  }, []);

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFormData(formData);
    setShowConfirmation(true);
  };

  const confirmAction = async () => {
    setShowConfirmation(false);
    const userId = session?.user.id;
    const res: any = await sendMaterial(formData, userId);
    if (res?.error) {
      setSubmitMessage(res.error);
    } else {
      setSubmitMessage(res.message);
      socket?.send("materialsUpdated");
      if (formRef.current) {
        formRef.current.reset();
      }
    }
  };

  function cancelAction() {
    setShowConfirmation(false);
    setFormData(null);
  }

  return (
    <section>
      <h2>Send Material to Warehouse</h2>
      <form ref={formRef} onSubmit={submitForm}>
        <div className="form-info">
          <p>
            CSR Staff may fill out the material information below and then send
            it to the Warehouse
          </p>
        </div>
        <div className="form-line">
          <label>Stock ID:</label>
          <input type="text" name="stockId" placeholder="Stock ID" required />
        </div>
        <div className="form-line">
          <label>Descrption:</label>
          <input
            type="text"
            name="description"
            placeholder="Description"
            required
          />
        </div>
        <div className="form-line">
          <label>Quantity:</label>
          <input type="number" name="qty" placeholder="Quantity" required />
        </div>
        <div className="form-line">
          <label>Unit Cost (USD):</label>
          <input
            type="decimal"
            name="cost"
            placeholder="Unit Cost (USD)"
            required
          />
        </div>
        <div className="form-line">
          <label>Customer:</label>
          <select name="customerId" required>
            {selectCustomers.map((customer, i) => (
              <option key={i} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-line">
          <label>Material Type:</label>
          <select name="materialType" required>
            {selectMaterialTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-line">
          <label>Min Qty:</label>
          <input
            type="number"
            name="minQty"
            placeholder="Min Quantity"
            required
          />
        </div>
        <div className="form-line">
          <label>Max Qty:</label>
          <input
            type="number"
            name="maxQty"
            placeholder="Max Quantity"
            required
          />
        </div>
        <div>
          <label>
            Tag Owned:
            <input type="checkbox" name="owner" />
          </label>
          <label>
            Allow for Use:
            <input type="checkbox" name="isActive" />
          </label>
        </div>
        <p className="submit-message">{sumbitMessage}</p>
        <div className="form-buttons">
          <SubmitButton title="Send Material" />
        </div>
      </form>

      {showConfirmation && (
        <div className="confirmation-window">
          <p>Do you want to send this material?</p>
          <p>Stock ID: "{String(formData?.get("stockId"))}"</p>
          <p>Quantity: {toUSFormat(Number(formData?.get("qty")))}</p>
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

export function PendingMaterials() {
  const [incomingMaterialsList, setIncomingMaterialsList] = useState([]);

  useEffect(() => {
    const getIncomingMaterials = async () => {
      const materials = await fetchIncomingMaterials();
      setIncomingMaterialsList(materials);
    };
    getIncomingMaterials();
  }, []);

  return (
    <section>
      <h2>Pending Materials:</h2>
      <div className="section-description">
        <p>📌⏳List of submitted Materials awaiting acceptance</p>
        <p>
          ✏️In order to make any changes just double-click🖱️👆on the specific
          material
        </p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Description</th>
            <th>Stock ID</th>
            <th>Quantity</th>
            <th>Unit Cost, USD</th>
            <th>Sent By</th>
          </tr>
        </thead>
        <tbody>
          {incomingMaterialsList.map((material: any, i) => (
            <tr
              key={i}
              onDoubleClick={() =>
                redirect(`/pending-materials/${material.shippingId}`)
              }
            >
              <td>{material.customerName}</td>
              <td>{material.description}</td>
              <td>{material.stockId}</td>
              <td>{toUSFormat(material.quantity)}</td>
              <td>{material.cost}</td>
              <td>{formatUserName(material.username)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function EditIncomingMaterial(props: any) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [incomingMaterial, setIncomingMaterial] = useState<any>({});
  const [selectCustomers, setSelectCustomers] = useState([selectState]);
  const [selectMaterialTypes, setSelectMaterialTypes] = useState([selectState]);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sumbitMessage, setSubmitMessage] = useState("");
  usePreventNumberInputScroll();

  useEffect(() => {
    const getMaterialInfo = async () => {
      const customers = await fetchCustomers();
      const types = await fetchMaterialTypes();
      const [incomingMaterial] = await fetchIncomingMaterials(props.shippingId);
      setSelectCustomers(customers);
      setSelectMaterialTypes(types);
      setIncomingMaterial(incomingMaterial);
    };
    getMaterialInfo();
  }, []);

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFormData(formData);
    setShowConfirmation(true);
  };

  const confirmAction = async () => {
    setShowConfirmation(false);
    const res: any = await updateIncomingMaterial(formData, props.shippingId);
    if (res?.error) {
      setSubmitMessage(res.error);
    } else {
      setSubmitMessage("Material Updated. Redirecting to Pending Materials...");
      setTimeout(() => {
        redirect("/pending-materials/");
      }, 2000);
    }
  };

  function cancelAction() {
    setShowConfirmation(false);
    setFormData(null);
  }

  return (
    <section>
      <h2>Edit Sent Material</h2>
      <form ref={formRef} onSubmit={submitForm}>
        <div className="form-info">
          <p>You may change the fields needed to be updated only</p>
        </div>
        <div className="form-line">
          <label>Stock ID:</label>
          <input
            type="text"
            name="stockId"
            placeholder="Stock ID"
            key={incomingMaterial.stockId}
            defaultValue={incomingMaterial.stockId}
            required
          />
        </div>
        <div className="form-line">
          <label>Descrption:</label>
          <input
            type="text"
            name="description"
            placeholder="Description"
            key={incomingMaterial.description}
            defaultValue={incomingMaterial.description}
            required
          />
        </div>
        <div className="form-line">
          <label>Quantity:</label>
          <input
            type="number"
            name="qty"
            placeholder="Quantity"
            key={incomingMaterial.quantity}
            defaultValue={incomingMaterial.quantity}
            required
          />
        </div>
        <div className="form-line">
          <label>Unit Cost (USD):</label>
          <input
            type="decimal"
            name="cost"
            placeholder="Unit Cost (USD)"
            key={incomingMaterial.cost}
            defaultValue={incomingMaterial.cost}
            required
          />
        </div>
        <div className="form-line">
          <label>Customer:</label>
          <select
            name="customerId"
            required
            key={incomingMaterial.customerId}
            defaultValue={incomingMaterial.customerId}
          >
            {selectCustomers.map((customer, i) => (
              <option key={i} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-line">
          <label>Material Type:</label>
          <select
            name="materialType"
            required
            key={incomingMaterial.materialType}
            defaultValue={incomingMaterial.materialType}
          >
            {selectMaterialTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-line">
          <label>Min Qty:</label>
          <input
            type="number"
            name="minQty"
            placeholder="Min Quantity"
            key={incomingMaterial.minQty}
            defaultValue={incomingMaterial.minQty}
            required
          />
        </div>
        <div className="form-line">
          <label>Max Qty:</label>
          <input
            type="number"
            name="maxQty"
            placeholder="Max Quantity"
            key={incomingMaterial.maxQty}
            defaultValue={incomingMaterial.maxQty}
            required
          />
        </div>
        <div>
          <label>
            Tag Owned:
            <input
              type="checkbox"
              name="owner"
              key={incomingMaterial.owner}
              defaultChecked={incomingMaterial.owner === "Tag"}
            />
          </label>
          <label>
            Allow for Use:
            <input
              type="checkbox"
              name="isActive"
              key={incomingMaterial.isActive}
              defaultChecked={incomingMaterial.isActive}
            />
          </label>
        </div>
        <p className="submit-message">{sumbitMessage}</p>
        <div className="form-buttons">
          <button type="button" onClick={() => redirect("/pending-materials")}>
            Go Back
          </button>
          <SubmitButton title="Update Material" />
        </div>
      </form>

      {showConfirmation && (
        <div className="confirmation-window">
          <p>Do you want to Update this Material?</p>
          <p>Stock ID: {String(formData?.get("stockId"))}</p>
          <p>Quantity: {toUSFormat(Number(formData?.get("qty")))}</p>
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
