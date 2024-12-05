"use client";
import { SubmitButton } from "app/ui/submit-button";
import { createMaterial, sendMaterial } from "../actions/materials";
import { FormEvent, useActionState, useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Material from "app/send-material/page";

const initialFormState = {
  message: "",
};

const selectState = {
  id: "",
  name: "Loading...",
  code: "Loading...",
};

export function SendMaterialForm() {
  const [state, materialFormAction] = useActionState(
    sendMaterial,
    initialFormState
  );
  const [selectCustomers, setSelectCustomers] = useState([selectState]);
  const [selectMaterialTypes, setSelectMaterialTypes] = useState([selectState]);

  useEffect(() => {
    async function fetchCustomers() {
      const res = await fetch("http://localhost:5000/customers");
      const data = await res.json();
      if (!data?.length) setSelectCustomers([]);

      console.log(data);

      const customers = data.map((customer: any) => ({
        id: customer.ID,
        name: customer.Name,
      }));
      setSelectCustomers(customers);
    }
    fetchCustomers();
  }, []);

  useEffect(() => {
    async function fetchMaterialTypes() {
      const res = await fetch("http://localhost:5000/material_types");
      const data = await res.json();
      if (!data?.length) setSelectMaterialTypes([]);

      const types = data.map((type: any, i: number) => ({
        id: i,
        name: type,
      }));
      setSelectMaterialTypes(types);
    }
    fetchMaterialTypes();
  }, []);

  return (
    <>
      <h2>Send Material</h2>
      <form action={materialFormAction}>
        <input type="text" name="stockId" placeholder="Stock ID" required />
        <input type="number" name="qty" placeholder="Quantity" required />
        <input
          type="decimal"
          name="cost"
          placeholder="Unit Cost (USD)"
          required
        />
        <select name="customerId" required>
          {selectCustomers.map((customer, i) => (
            <option key={i} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
        <select name="materialType" required>
          {selectMaterialTypes.map((type) => (
            <option key={type.id} value={type.name}>
              {type.name}
            </option>
          ))}
        </select>
        <input type="number" name="minQty" placeholder="Min Quantity" />
        <input type="number" name="maxQty" placeholder="Max Quantity" />
        <input type="text" name="description" placeholder="Description" />

        <label>
          <input type="checkbox" name="owner" />
          Tag Owned
        </label>
        <label>
          <input type="checkbox" name="isActive" />
          Allow for Use
        </label>
        <p>{state?.message}</p>
        <SubmitButton title="Send Material" />
      </form>
    </>
  );
}

export function IncomingMaterialsComponent() {
  const [incomingMaterialsList, setIncomingMaterialsList] = useState([{}]);

  useEffect(() => {
    async function fetchIncomingMaterials() {
      const res = await fetch("http://localhost:5000/incoming_materials");
      const data = await res.json();
      if (!data?.length) setIncomingMaterialsList([]);

      const materials = data.map((material: any) => ({
        shippingId: material.ShippingID,
        customerName: material.CustomerName,
        stockId: material.StockID,
        qty: material.Quantity,
      }));
      setIncomingMaterialsList(materials);
    }
    fetchIncomingMaterials();
  }, [incomingMaterialsList]);

  return (
    <>
      <h2>Incoming Materials List: {incomingMaterialsList.length} items</h2>
      <div className="material_list">
        {incomingMaterialsList.map((material: any, i) => (
          <div className="material_list-item" key={i}>
            <p>Customer: {material.customerName}</p>
            <p>Stock ID: {material.stockId}</p>
            <p>Qty: {material.qty}</p>

            <button
              onClick={() =>
                redirect(`/incoming-materials/${material.shippingId}`)
              }
            >
              Accept Material
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export function CreateMaterialForm(props: { materialId: string }) {
  const [sumbitMessage, setSubmitMessage] = useState("");
  const [incomingMaterial, setIncomingMaterial] = useState({
    ShippingID: "Loading...",
    CustomerName: "Loading...",
    CustomerID: "Loading...",
    StockID: "stock123",
    Cost: "Loading...",
    Quantity: "Loading...",
    MinQty: "Loading...",
    MaxQty: "Loading...",
    Notes: "Loading...",
    IsActive: "Loading...",
    MaterialType: "Loading...",
    Owner: "Loading...",
  });
  const [selectLocations, setSelectLocations] = useState([selectState]);

  useEffect(() => {
    async function fetchIncomingMaterials() {
      const res = await fetch("http://localhost:5000/incoming_materials");
      const data = await res.json();
      if (!data?.length) return;

      const material = data.find(
        (material: any) => material.ShippingID == props.materialId
      );

      if (material) {
        setIncomingMaterial(material);
      }
    }
    fetchIncomingMaterials();
  }, []);

  useEffect(() => {
    async function fetchLocations() {
      const res = await fetch("http://localhost:5000/locations");
      const data = await res.json();
      if (!data?.length) return;

      const locations = data.map((location: any) => ({
        id: location.ID,
        name: location.Name,
      }));

      setSelectLocations(locations);
    }
    fetchLocations();
  }, []);

  async function onSubmitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const incomingMaterialId = props.materialId;

    const { message } = await createMaterial(incomingMaterialId, formData);
    setSubmitMessage(message);
  }

  return (
    <>
      <button onClick={() => redirect("/incoming-materials/")}>Go back</button>
      <form onSubmit={onSubmitForm}>
        <label>Customer: {incomingMaterial.CustomerName}</label>

        <label>Stock ID: {incomingMaterial.StockID}</label>
        <label>Type: {incomingMaterial.MaterialType}</label>
        <label>Ownership: {incomingMaterial.Owner}</label>
        <label>Allow for use: {incomingMaterial.IsActive ? "Yes" : "No"}</label>
        <label>Descripion: {incomingMaterial.Notes}</label>

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          defaultValue={incomingMaterial.Quantity}
          required
        />
        <select name="locationId" required>
          {selectLocations.map((location: any, i: number) => (
            <option key={i} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
        <input type="text" name="notes" placeholder="Notes" />
        <p>{sumbitMessage}</p>
        <SubmitButton title="Add Material" />
      </form>
    </>
  );
}
