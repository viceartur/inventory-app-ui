"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";

import { SubmitButton } from "ui/submit-button";
import {
  createMaterial,
  fetchIncomingMaterials,
  fetchMaterials,
  fetchMaterialTypes,
  moveMaterial,
  removeMaterial,
  sendMaterial,
  updateMaterial,
  uploadMaterials,
} from "../actions/materials";
import {
  incomingMaterialState,
  materialState,
  selectState,
} from "utils/constants";
import { fetchCustomers } from "actions/customers";
import { fetchAvailableLocations } from "actions/warehouses";
import { toUSFormat, usePreventNumberInputScroll } from "utils/utils";
import { useSocket } from "context/socket-context";

export function SendMaterialForm() {
  const socket = useSocket();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [selectCustomers, setSelectCustomers] = useState([selectState]);
  const [selectMaterialTypes, setSelectMaterialTypes] = useState([selectState]);
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

    const material = {
      customerId: formData.get("customerId"),
      stockId: formData.get("stockId"),
      type: formData.get("materialType"),
      quantity: formData.get("qty"),
      cost: formData.get("cost"),
      minQuantity: formData.get("minQty"),
      maxQuantity: formData.get("maxQty"),
      description: formData.get("description"),
      owner: formData.get("owner") == "on" ? "Tag" : "Customer",
      isActive: formData.get("isActive") == "on",
    };

    const res: any = await sendMaterial(material);
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

  return (
    <section>
      <h2>Send Material to Incoming</h2>
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
          <input type="number" name="minQty" placeholder="Min Quantity" />
        </div>
        <div className="form-line">
          <label>Max Qty:</label>
          <input type="number" name="maxQty" placeholder="Max Quantity" />
        </div>
        <div className="form-line">
          <label>Descrption:</label>
          <input type="text" name="description" placeholder="Description" />
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
        <SubmitButton title="Send Material" />
      </form>
    </section>
  );
}

export function IncomingMaterials() {
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
      <h2>Incoming Materials List: {incomingMaterialsList.length} items</h2>
      {incomingMaterialsList.length ? (
        <div className="material_list">
          <div className="list_header">
            <p>Customer</p>
            <p>Stock ID</p>
            <p>Quantity</p>
            <p>Action</p>
          </div>
          {incomingMaterialsList.map((material: any, i) => (
            <div className="material_list-item" key={i}>
              <p>{material.customerName}</p>
              <p>{material.stockId}</p>
              <p>{toUSFormat(material.quantity)}</p>
              <button
                onClick={() =>
                  redirect(`/incoming-materials/${material.shippingId}`)
                }
              >
                📥
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

export function CreateMaterialForm(props: { materialId: string }) {
  const socket = useSocket();
  const [sumbitMessage, setSubmitMessage] = useState("");
  const [incomingMaterial, setIncomingMaterial] = useState(
    incomingMaterialState
  );
  const [selectLocations, setSelectLocations] = useState([selectState]);
  usePreventNumberInputScroll();

  useEffect(() => {
    const getMaterialCard = async () => {
      const [material] = await fetchIncomingMaterials(props.materialId);
      const stockId = material.stockId;
      const owner = material.owner;
      const locations = await fetchAvailableLocations(stockId, owner);

      setIncomingMaterial(material);
      setSelectLocations(locations);
    };
    getMaterialCard();
  }, []);

  async function onSubmitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const incomingMaterialId = props.materialId;

    const res: any = await createMaterial(incomingMaterialId, formData);
    if (res?.error) {
      setSubmitMessage(res.error);
    } else {
      setSubmitMessage("Material Added. Redirecting to Incoming Materials...");
      socket?.send("materialsUpdated");
      setTimeout(() => {
        redirect("/incoming-materials/");
      }, 2000);
    }
  }

  return (
    <section>
      <h2>Adding the Material to the Location</h2>
      <form onSubmit={onSubmitForm}>
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
        <div>
          <button
            type="button"
            onClick={() => redirect("/incoming-materials/")}
          >
            Go back
          </button>
          <SubmitButton title="Add Material" />
        </div>
      </form>
    </section>
  );
}

export function Materials() {
  const [materialsList, setMaterialsList] = useState([]);
  const [filterOpts, setFilterOpts] = useState({
    stockId: "",
    customerName: "",
    description: "",
    locationName: "",
  });

  async function onFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const stockId = formData.get("stockId")?.toString() || "";
    const customerName = formData.get("customerName")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const locationName = formData.get("locationName")?.toString() || "";
    const opts = {
      stockId,
      customerName,
      description,
      locationName,
    };
    setFilterOpts(opts);
    const materials = await fetchMaterials(opts);
    setMaterialsList(materials);
  }

  const handlePrimaryItem = async (materialId: string) => {
    const primaryMaterial: any = materialsList.find(
      (m: any) => m.materialId == materialId
    );
    if (primaryMaterial) {
      const material = {
        materialId: materialId.toString(),
        isPrimary: !primaryMaterial.isPrimary,
      };
      await updateMaterial(material);
      const materials = await fetchMaterials(filterOpts);
      setMaterialsList(materials);
    }
  };

  return (
    <section>
      <h2>Inventory List</h2>
      <form className="filter" onSubmit={onFilterSubmit}>
        <div>
          <input
            type="text"
            name="stockId"
            placeholder="Stock ID"
            defaultValue={filterOpts.stockId}
          />
          <input
            type="text"
            name="customerName"
            placeholder="Customer Name"
            defaultValue={filterOpts.customerName}
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            defaultValue={filterOpts.description}
          />
          <input
            type="text"
            name="locationName"
            placeholder="Location Name"
            defaultValue={filterOpts.locationName}
          />
          <SubmitButton title="🔍" />
        </div>
      </form>
      {!materialsList.length ? (
        <p>No items yet. Found Materials will be displayed here</p>
      ) : (
        <>
          <h2>Found Materials:</h2>
          <div className="material_list">
            <div className="list_header">
              <p>Stock ID: {materialsList.length}</p>
              <p>Description</p>
              <p>Owner</p>
              <p>Location</p>
              <p>
                Quantity:{" "}
                {toUSFormat(
                  materialsList.reduce(
                    (sum, item: any) => (sum += item.quantity),
                    0
                  )
                )}
              </p>
              <p>Actions</p>
            </div>
            {materialsList.map((material: any, i) => (
              <div
                className={`material_list-item${
                  material.isPrimary ? " primary" : ""
                }`}
                key={i}
                onDoubleClick={() => handlePrimaryItem(material.materialId)}
              >
                <p>{material.stockId}</p>
                <p>{material.description}</p>
                <p>{material.owner}</p>
                <p>{material.locationName}</p>
                <p>{toUSFormat(material.quantity)}</p>
                <button
                  onClick={() =>
                    redirect(
                      `/materials/remove-material/${material.materialId}`
                    )
                  }
                >
                  ❌
                </button>
                <button
                  onClick={() =>
                    redirect(`/materials/move-material/${material.materialId}`)
                  }
                >
                  🔀
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export function MoveMaterialForm(props: { materialId: string }) {
  const [sumbitMessage, setSubmitMessage] = useState("");
  const [material, setMaterial] = useState(materialState);
  const [selectLocations, setSelectLocations] = useState([selectState]);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  usePreventNumberInputScroll();

  useEffect(() => {
    const getMaterialInfo = async () => {
      const [material] = await fetchMaterials({ materialId: props.materialId });
      const stockId = material.stockId;
      const owner = material.owner;
      const locations = await fetchAvailableLocations(stockId, owner);
      setMaterial(material);
      setSelectLocations(locations);
    };
    getMaterialInfo();
  }, []);

  async function onSubmitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFormData(formData);
    setShowConfirmation(true);
  }

  async function confirmAction() {
    setShowConfirmation(false);
    const materialId = props.materialId;
    const res: any = await moveMaterial(materialId, formData);
    if (res?.error) {
      setSubmitMessage(res.error);
    } else {
      setSubmitMessage("Material Moved. Redirecting to Inventory...");
      setTimeout(() => {
        redirect("/materials/");
      }, 2000);
    }
  }

  function cancelAction() {
    setShowConfirmation(false);
    setFormData(null);
  }

  return (
    <section>
      <h2>Move Material to Location</h2>
      <form onSubmit={onSubmitForm}>
        <div className="form-info">
          <h3>The Material will be moved to a Location</h3>
          <div className="form-info-line">
            <label>Customer:</label>
            {material.customerName}
          </div>
          <div className="form-info-line">
            <label>Stock ID:</label>
            {material.stockId}
          </div>
          <div className="form-info-line">
            <label>Description:</label>
            {material.description}
          </div>
          <div className="form-info-line">
            <label>Current Location:</label>
            {material.locationName}
          </div>
          <div className="form-info-line">
            <label>Type:</label>
            {material.materialType}
          </div>
          <div className="form-info-line">
            <label>Ownership:</label>
            {material.owner}
          </div>
          <div className="form-info-line">
            <label>Allow for use:</label>
            {material.isActive ? "Yes" : "No"}
          </div>
          <div className="form-info-line">
            <label>Notes:</label>
            {material.notes}
          </div>
          <div className="form-info-line">
            <label>Current Qty:</label>
            {toUSFormat(+material.quantity)}
          </div>
        </div>
        <div className="form-line">
          <label>Quantity to Move:</label>
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            required
          />
        </div>
        <div className="form-line">
          <label>New location:</label>
          <select name="locationId" required>
            {selectLocations.map((location: any, i: number) => (
              <option key={i} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <p className="submit-message">{sumbitMessage}</p>
        <div>
          <button type="button" onClick={() => redirect("/materials/")}>
            Go back
          </button>
          <SubmitButton title="Move Material" />
        </div>
      </form>

      {showConfirmation && (
        <div className="confirmation-window">
          <p>
            Are you sure you want to move this material to another location?
          </p>
          <p>
            The quantity after moving will be{" "}
            {toUSFormat(+material.quantity - Number(formData?.get("quantity")))}
          </p>
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

export function RemoveMaterialForm(props: { materialId: string }) {
  const [sumbitMessage, setSubmitMessage] = useState("");
  const [material, setMaterial] = useState(materialState);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  usePreventNumberInputScroll();

  useEffect(() => {
    const getMaterial = async () => {
      const [material] = await fetchMaterials({ materialId: props.materialId });
      setMaterial(material);
    };
    getMaterial();
  }, []);

  async function onSubmitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFormData(formData);
    setShowConfirmation(true);
  }

  async function confirmAction() {
    setShowConfirmation(false);
    const materialId = props.materialId;
    const response: any = await removeMaterial(materialId, formData);
    if (response?.error) {
      setSubmitMessage(response.error);
    } else {
      setSubmitMessage("Material Removed. Redirecting to Inventory...");
      setTimeout(() => {
        redirect("/materials/");
      }, 2000);
    }
  }

  function cancelAction() {
    setShowConfirmation(false);
    setFormData(null);
  }

  return (
    <section>
      <h2>Use Material</h2>
      <form onSubmit={onSubmitForm}>
        <div className="form-info">
          <h3>The Material will be removed from the Location</h3>
          <div className="form-info-line">
            <label>Customer:</label>
            {material.customerName}
          </div>
          <div className="form-info-line">
            <label>Stock ID:</label>
            {material.stockId}
          </div>
          <div className="form-info-line">
            <label>Description:</label>
            {material.description}
          </div>
          <div className="form-info-line">
            <label>Current Location:</label>
            {material.locationName}
          </div>
          <div className="form-info-line">
            <label>Type:</label>
            {material.materialType}
          </div>
          <div className="form-info-line">
            <label>Ownership:</label>
            {material.owner}
          </div>
          <div className="form-info-line">
            <label>Allow for use:</label>
            {material.isActive ? "Yes" : "No"}
          </div>
          <div className="form-info-line">
            <label>Notes:</label>
            {material.notes}
          </div>
          <div className="form-info-line">
            <label>Current Qty:</label>
            {toUSFormat(+material.quantity)}
          </div>
        </div>
        <div className="form-line">
          <label>Quantity to Use:</label>
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            required
          />
        </div>
        <div className="form-line">
          <label>Job Ticket #:</label>
          <input
            type="text"
            name="jobTicket"
            placeholder="Job Ticket #"
            required
          />
        </div>
        <p className="submit-message">{sumbitMessage}</p>
        <div>
          <button type="button" onClick={() => redirect("/materials/")}>
            Go back
          </button>
          <SubmitButton title="Use Material" />
        </div>
      </form>

      {showConfirmation && (
        <div className="confirmation-window">
          <p>Are you sure you want to use this material?</p>
          <p>
            The quantity after using will be{" "}
            {toUSFormat(+material.quantity - Number(formData?.get("quantity")))}
          </p>
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

export function ImportMaterials() {
  const [response, setResponse] = useState({
    message: "",
    data: {
      Records: 0,
      Imported_Records: 0,
      Not_Imported_Records: 0,
      Not_Imported_Data: [],
    },
  });
  const [dataToImport, setDataToImport] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: any) => {
    setResponse({
      message: "",
      data: {
        Records: 0,
        Imported_Records: 0,
        Not_Imported_Records: 0,
        Not_Imported_Data: [],
      },
    });

    const file = e.target.files[0];
    if (file && file.name.endsWith(".xlsx")) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any = XLSX.utils.sheet_to_json(firstSheet);
        jsonData.forEach((d: any) => {
          d["Stock ID"] = d["Stock ID"].toString();
          d["Customer Code"] = d["Customer Code"].toString();
        });
        setDataToImport(jsonData);
      };
      reader.readAsBinaryString(file);
    } else {
      alert("Please upload a valid .xlsx file.");
    }
  };

  const handleSumbit = async (e: any) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const jsonData = JSON.stringify({ data: dataToImport });
      const dataResult: any = await uploadMaterials(jsonData);
      setResponse(dataResult);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      alert("Error: " + error.message);
    }
  };

  return (
    <section>
      <h2>Upload Excel File</h2>
      <form onSubmit={handleSumbit}>
        <div className="form-info">
          <p className="submit-message">
            This action will UPDATE the Database with new items
          </p>
          <p>The items which already exist will not be imported</p>
          <p>An error message (if applicable) will be displayed below</p>
        </div>
        <input type="file" accept=".xlsx" onChange={handleFileChange} />
        <p className="submit-message">{response?.message}</p>
        {response?.message ? (
          <div>
            <p>Total Uploaded: {response?.data.Records}</p>
            <p>Imported: {response?.data.Imported_Records}</p>
            <p>Not Imported: {response?.data.Not_Imported_Records}</p>
            <p className="submit-message">Errors:</p>
            {response?.data.Not_Imported_Data.map((record: any, i: number) => (
              <div key={i}>
                <p>StockID: {record.StockID}</p>
                <p>Error: {record.ERR_REASON}</p>
                <br />
              </div>
            ))}
          </div>
        ) : (
          ""
        )}
        <SubmitButton
          title={isLoading ? "Importing..." : "Import Data"}
          disabled={isLoading}
        />
      </form>
    </section>
  );
}
