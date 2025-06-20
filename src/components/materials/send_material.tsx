"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "context/socket-context";
import { redirect } from "next/navigation";
import { SubmitButton } from "ui/submit-button";
import {
  deleteIncomingMaterial,
  fetchIncomingMaterials,
  fetchMaterialDescription,
  fetchMaterialTypes,
  IncomingMaterial,
  sendMaterial,
  updateIncomingMaterial,
} from "../../actions/materials";
import { VAULT_MATERIAL_TYPES } from "utils/constants";
import { CustomerProgram, fetchCustomerPrograms } from "actions/customers";
import {
  formatUserName,
  toUSFormat,
  usePreventNumberInputScroll,
} from "utils/client_utils";

export function SendMaterialForm() {
  const { data: session } = useSession();
  const socket = useSocket();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [customerPrograms, setCustomerPrograms] = useState<CustomerProgram[]>(
    []
  );
  const [selectMaterialTypes, setSelectMaterialTypes] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [stockId, setStockId] = useState("");
  const [description, setDescription] = useState("");
  const [isDescriptionLocked, setIsDescriptionLocked] = useState(false);
  usePreventNumberInputScroll();

  // Fetch customers and material types for the select options
  useEffect(() => {
    const getMaterialInfo = async () => {
      const programs = await fetchCustomerPrograms();
      const types = await fetchMaterialTypes();
      setCustomerPrograms(programs);
      setSelectMaterialTypes(types);
    };
    getMaterialInfo();
  }, []);

  // Check if the stock ID exists in the database
  // Set the description if it exists
  const checkStockId = async (id: string) => {
    if (!id.trim()) {
      setDescription("");
      setIsDescriptionLocked(false);
      return;
    }
    const description = await fetchMaterialDescription({ stockId: id });
    if (description) {
      setDescription(description);
      setIsDescriptionLocked(true);
    } else {
      setDescription("");
      setIsDescriptionLocked(false);
    }
  };

  // Check if the stock ID exists and set the description accordingly
  const handleStockIdBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    const stockIdInput = event.target.value.trim().toUpperCase();
    setStockId(stockIdInput);
    checkStockId(stockIdInput);
  };

  // Set the description to uppercase when the input loses focus
  const handleDescriptionBlur = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDescription(event.target.value.trim().toUpperCase());
  };

  // Submit the form and show confirmation
  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("stockId", stockId);
    formData.set("description", description);
    setFormData(formData);
    setShowConfirmation(true);
  };

  // Confirm the action and send the material
  const confirmAction = async () => {
    setShowConfirmation(false);
    const userId = session?.user.id;
    const res: any = await sendMaterial(formData, userId);
    if (res?.error) {
      setSubmitMessage(res.error);
    } else {
      setSubmitMessage(res.message);

      // Reset the form
      setStockId("");
      setDescription("");
      setIsDescriptionLocked(false);
      formRef.current?.reset();

      // Send a message to the socket
      const isVault = VAULT_MATERIAL_TYPES.includes(
        String(formData?.get("materialType"))
      );
      if (isVault) {
        socket?.send("vaultUpdated");
      } else {
        socket?.send("materialsUpdated");
      }
    }
  };

  // Cancel the action
  function cancelAction() {
    setShowConfirmation(false);
    setFormData(null);
  }

  return (
    <section>
      <h2>Send a Material to the Warehouse</h2>
      <div className="section-description">
        <p>
          📦 CSR Staff may fill out the material information below and then send
          it to the Warehouse 🚛
        </p>
        <p>
          📝 The Description field is auto-populated based on the Stock ID
          provided 🔍
        </p>
      </div>
      <form ref={formRef} onSubmit={submitForm}>
        <div className="form-line">
          <label>Stock ID:</label>
          <input
            type="text"
            placeholder="Stock ID"
            required
            defaultValue={stockId}
            key={stockId}
            onBlur={handleStockIdBlur}
          />
        </div>
        <div className="form-line">
          <label>Description:</label>
          <input
            type="text"
            placeholder="Description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            disabled={isDescriptionLocked}
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
          <label>Customer Program:</label>
          <select name="programId" required>
            {customerPrograms.map((p, i) => (
              <option key={i} value={p.programId}>
                {p.programName}
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
          <label>Owner:</label>
          <select name="owner" required>
            <option value="">Select Owner</option>
            {["Tag", "Customer"].map((owner, i) => (
              <option key={i} value={owner}>
                {owner}
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
        <div className="form-checkboxes">
          <label htmlFor="isActive">Allow for Use:</label>
          <input type="checkbox" name="isActive" />
          <small>(Check if this material is currently allowed for use)</small>
        </div>
        <p className="submit-message">{submitMessage}</p>
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
  const { data: session } = useSession();
  const [incomingMaterialsList, setIncomingMaterialsList] = useState<
    IncomingMaterial[]
  >([]);

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
      {incomingMaterialsList.length ? (
        <table>
          <thead>
            <tr>
              <th>Customer Program</th>
              <th>Description</th>
              <th>Stock ID</th>
              <th>Quantity</th>
              <th>Unit Cost, USD</th>
              <th>Sent By</th>
            </tr>
          </thead>
          <tbody>
            {incomingMaterialsList.map((material, i) => (
              <tr
                key={i}
                onDoubleClick={() =>
                  session?.user.role === "admin" ||
                  material.username === session?.user.name
                    ? redirect(`/pending-materials/${material.shippingId}`)
                    : alert("You are not allowed to edit this Material")
                }
              >
                <td>{material.programName}</td>
                <td>{material.description}</td>
                <td>{material.stockId}</td>
                <td>{toUSFormat(material.quantity)}</td>
                <td>{material.cost}</td>
                <td>
                  {material.username
                    ? formatUserName(material.username)
                    : "Not assigned"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No items to be displayed yet.</p>
      )}
    </section>
  );
}

export function EditIncomingMaterial(props: any) {
  const socket = useSocket();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [incomingMaterial, setIncomingMaterial] = useState<IncomingMaterial>();
  const [owner, setOwner] = useState<string>("");
  const [selectCustomers, setSelectCustomers] = useState<CustomerProgram[]>([]);
  const [selectMaterialTypes, setSelectMaterialTypes] = useState([]);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [sumbitMessage, setSubmitMessage] = useState("");
  usePreventNumberInputScroll();

  useEffect(() => {
    const getMaterialInfo = async () => {
      const customers = await fetchCustomerPrograms();
      const types = await fetchMaterialTypes();
      const [incomingMaterial] = await fetchIncomingMaterials(props.shippingId);
      setSelectCustomers(customers);
      setSelectMaterialTypes(types);
      setIncomingMaterial(incomingMaterial);
      setOwner(incomingMaterial.owner);
    };
    getMaterialInfo();
  }, []);

  // Delete Handling
  const onDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirmation(false);
    const res: any = await deleteIncomingMaterial(props.shippingId);
    if (res?.error) {
      setSubmitMessage(res.error);
    } else {
      setSubmitMessage("Material Deleted. Redirecting to Pending Materials...");
      setTimeout(() => {
        redirect("/pending-materials/");
      }, 2000);

      socket?.send("vaultUpdated");
      socket?.send("materialsUpdated");
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  // Submit Handling
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFormData(formData);
    setShowSubmitConfirmation(true);
  };

  const confirmSubmit = async () => {
    setShowSubmitConfirmation(false);
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

  const cancelSubmit = () => {
    setShowSubmitConfirmation(false);
    setFormData(null);
  };

  return (
    <section>
      <h2>Edit Submitted Material</h2>
      <div className="section-description">
        <p>
          You may <strong>Update</strong> any necessary fields or{" "}
          <strong>Delete</strong> the Material from the Pending list
        </p>
      </div>
      <form ref={formRef} onSubmit={onSubmit}>
        <div className="form-line">
          <label>Stock ID:</label>
          <input
            type="text"
            name="stockId"
            placeholder="Stock ID"
            key={incomingMaterial?.stockId}
            defaultValue={incomingMaterial?.stockId}
            required
          />
        </div>
        <div className="form-line">
          <label>Descrption:</label>
          <input
            type="text"
            name="description"
            placeholder="Description"
            key={incomingMaterial?.description}
            defaultValue={incomingMaterial?.description}
            required
          />
        </div>
        <div className="form-line">
          <label>Quantity:</label>
          <input
            type="number"
            name="qty"
            placeholder="Quantity"
            key={incomingMaterial?.quantity}
            defaultValue={incomingMaterial?.quantity}
            required
          />
        </div>
        <div className="form-line">
          <label>Unit Cost (USD):</label>
          <input
            type="decimal"
            name="cost"
            placeholder="Unit Cost (USD)"
            key={incomingMaterial?.cost}
            defaultValue={incomingMaterial?.cost}
            required
          />
        </div>
        <div className="form-line">
          <label>Customer:</label>
          <select
            name="programId"
            required
            key={incomingMaterial?.programId}
            defaultValue={incomingMaterial?.programId}
          >
            {selectCustomers.map((customer, i) => (
              <option key={i} value={customer.programId}>
                {customer.programName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-line">
          <label>Material Type:</label>
          <select
            name="materialType"
            required
            key={incomingMaterial?.materialType}
            defaultValue={incomingMaterial?.materialType}
          >
            {selectMaterialTypes.map((type: any) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-line">
          <label>Owner:</label>
          <select
            name="owner"
            required
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          >
            <option value="">Select Owner</option>
            {["Tag", "Customer"].map((ownerOption, i) => (
              <option key={i} value={ownerOption}>
                {ownerOption}
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
            key={incomingMaterial?.minQuantity}
            defaultValue={incomingMaterial?.minQuantity}
            required
          />
        </div>
        <div className="form-line">
          <label>Max Qty:</label>
          <input
            type="number"
            name="maxQty"
            placeholder="Max Quantity"
            key={incomingMaterial?.maxQuantity}
            defaultValue={incomingMaterial?.maxQuantity}
            required
          />
        </div>
        <div className="form-checkboxes">
          <label htmlFor="isActive">Allow for Use:</label>
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={!!incomingMaterial?.isActive}
            onChange={(e) =>
              setIncomingMaterial((prev) =>
                prev ? { ...prev, isActive: e.target.checked } : prev
              )
            }
          />
          <small>(Check if this material is currently allowed for use)</small>
        </div>
        <p className="submit-message">{sumbitMessage}</p>
        <div className="form-buttons">
          <button type="button" onClick={() => redirect("/pending-materials")}>
            Go Back
          </button>
          <button
            type="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => onDelete(e)}
          >
            Delete Material
          </button>
          <SubmitButton title="Update Material" />
        </div>
      </form>

      {showSubmitConfirmation && (
        <div className="confirmation-window">
          <p>Do you want to Update this Material?</p>
          <p>Stock ID: {String(formData?.get("stockId"))}</p>
          <p>Quantity: {toUSFormat(Number(formData?.get("qty")))}</p>
          <button type="button" onClick={confirmSubmit}>
            Yes
          </button>
          <button type="button" onClick={cancelSubmit}>
            No
          </button>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="confirmation-window">
          <p>
            Are you sure you want to Delete this Material? Once deleted, the
            Warehouse will no longer be able to Accept it.
          </p>
          <button type="button" onClick={confirmDelete}>
            Yes
          </button>
          <button type="button" onClick={cancelDelete}>
            No
          </button>
        </div>
      )}
    </section>
  );
}
