"use client";
import { SubmitButton } from "app/ui/submit-button";
import {
  createMaterial,
  moveMaterial,
  removeMaterial,
  sendMaterial,
} from "../actions/materials";
import { FormEvent, useActionState, useEffect, useState } from "react";
import { redirect } from "next/navigation";

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

export function IncomingMaterials() {
  const [incomingMaterialsList, setIncomingMaterialsList] = useState([]);

  useEffect(() => {
    async function fetchIncomingMaterials() {
      const res = await fetch("http://localhost:5000/incoming_materials");
      if (!res) return setIncomingMaterialsList([]);

      const data = await res.json();
      if (!data?.length) return setIncomingMaterialsList([]);

      const materials = data.map((material: any) => ({
        shippingId: material.ShippingID,
        customerName: material.CustomerName,
        stockId: material.StockID,
        qty: material.Quantity,
      }));
      setIncomingMaterialsList(materials);
    }
    fetchIncomingMaterials();
  }, []);

  return (
    <>
      <h2>Incoming Materials List: {incomingMaterialsList.length} items</h2>
      {incomingMaterialsList.length ? (
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
      ) : (
        <p>List is empty</p>
      )}
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

export function Materials() {
  const [materialsList, setMaterialsList] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    async function fetchMaterials() {
      const res = await fetch("http://localhost:5000/materials");
      if (!res) return setMaterialsList([]);

      const data = await res.json();
      if (!data?.length) return setMaterialsList([]);

      const materials = data.map((material: any) => {
        const {
          MaterialID,
          WarehouseName,
          StockID,
          CustomerID,
          CustomerName,
          LocationID,
          LocationName,
          MaterialType,
          Description,
          Notes,
          Quantity,
          UpdatedAt,
          IsActive,
          Cost,
          MinQty,
          MaxQty,
          Owner,
        } = material;

        return {
          materialId: MaterialID,
          warehouseName: WarehouseName,
          stockId: StockID,
          customerId: CustomerID,
          customerName: CustomerName,
          locationId: LocationID,
          locationName: LocationName,
          materialType: MaterialType,
          description: Description,
          notes: Notes,
          qty: Quantity,
          updatedAt: UpdatedAt,
          isActive: IsActive,
          cost: Cost,
          minQty: MinQty,
          maxQty: MaxQty,
          owner: Owner,
        };
      });
      setMaterialsList(materials);
      setFilteredItems(materials);
    }
    fetchMaterials();
  }, []);

  async function onFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const stockId = formData.get("stockId");
    const customerName = formData.get("customerName");
    const locationName = formData.get("locationName");

    if (!stockId && !customerName && !locationName) {
      setFilteredItems(materialsList);
      return;
    }

    const filteredMaterials = materialsList.filter((material: any) => {
      let found = false;

      if (stockId) {
        found = material.stockId
          .toLowerCase()
          .includes(stockId?.toString().toLowerCase());
        if (!found) return found;
      }

      if (customerName) {
        found = material.customerName
          .toLowerCase()
          .includes(customerName?.toString().toLowerCase());
        if (!found) return found;
      }

      if (locationName) {
        found = material.locationName
          .toLowerCase()
          .includes(locationName?.toString().toLowerCase());
        if (!found) return found;
      }

      return found;
    });

    setFilteredItems(filteredMaterials);
  }

  return (
    <>
      <h2>Filter Options</h2>
      <form className="filter" onSubmit={onFilterSubmit}>
        <input type="text" name="stockId" placeholder="Stock ID" />
        <input type="text" name="customerName" placeholder="Customer Name" />
        <input type="text" name="locationName" placeholder="Location Name" />
        <SubmitButton title="Filter Items" />
      </form>

      <h2>Inventory List: {filteredItems.length} items</h2>

      <div className="material_list">
        <div className="list_header">
          <p>Customer</p>
          <p>Stock ID</p>
          <p>Quantity</p>
          <p>Location</p>
          <p>Action Buttons</p>
        </div>
        {filteredItems.map((material: any, i) => (
          <div className="material_list-item" key={i}>
            <p>{material.customerName}</p>
            <p>{material.stockId}</p>
            <p>{material.qty}</p>
            <p>{material.locationName}</p>
            <button
              onClick={() =>
                redirect(`/materials/remove-material/${material.materialId}`)
              }
            >
              Use Material
            </button>
            <button
              onClick={() =>
                redirect(`/materials/move-material/${material.materialId}`)
              }
            >
              Move Material
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export function MoveMaterialForm(props: { materialId: string }) {
  const [sumbitMessage, setSubmitMessage] = useState("");
  const [material, setMaterial] = useState({
    MaterialID: "Loading...",
    CustomerName: "Loading...",
    CustomerID: "Loading...",
    LocationName: "Loading...",
    LocationID: "Loading...",
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
    async function fetchMaterials() {
      const res = await fetch("http://localhost:5000/materials");
      if (!res) return;

      const data = await res.json();
      if (!data?.length) return;

      const foundMaterial = data.find(
        (material: any) => material.MaterialID == props.materialId
      );
      if (!foundMaterial) return;

      setMaterial(foundMaterial);
    }

    fetchMaterials();
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
    const materialId = props.materialId;

    const { message } = await moveMaterial(materialId, formData);
    setSubmitMessage(message);
  }

  return (
    <>
      <button onClick={() => redirect("/materials/")}>Go back</button>
      <h2>Move Material to Location</h2>
      <p>Info: An item will be moved to the different location</p>
      <form onSubmit={onSubmitForm}>
        <label>Customer: {material.CustomerName}</label>
        <label>Stock ID: {material.StockID}</label>
        <label>Current Location: {material.LocationName}</label>
        <label>Type: {material.MaterialType}</label>
        <label>Ownership: {material.Owner}</label>
        <label>Allow for use: {material.IsActive ? "Yes" : "No"}</label>
        <label>Descripion: {material.Notes}</label>
        <label>Current Qty: {material.Quantity}</label>
        <input
          type="number"
          name="quantity"
          placeholder="Quantity to Move"
          required
        />
        <label>New location:</label>
        <select name="locationId" required>
          {selectLocations.map((location: any, i: number) => (
            <option key={i} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
        <p>{sumbitMessage}</p>
        <SubmitButton title="Move Material" />
      </form>
    </>
  );
}

export function RemoveMaterialForm(props: { materialId: string }) {
  const [sumbitMessage, setSubmitMessage] = useState("");
  const [material, setMaterial] = useState({
    MaterialID: "Loading...",
    CustomerName: "Loading...",
    CustomerID: "Loading...",
    LocationName: "Loading...",
    LocationID: "Loading...",
    StockID: "stock123",
    Cost: "Loading...",
    Quantity: "Loading...",
    MinQty: "Loading...",
    MaxQty: "Loading...",
    Description: "Loading...",
    Notes: "Loading...",
    IsActive: "Loading...",
    MaterialType: "Loading...",
    Owner: "Loading...",
  });

  useEffect(() => {
    async function fetchMaterials() {
      const res = await fetch("http://localhost:5000/materials");
      if (!res) return;

      const data = await res.json();
      if (!data?.length) return;

      const foundMaterial = data.find(
        (material: any) => material.MaterialID == props.materialId
      );
      if (!foundMaterial) return;

      setMaterial(foundMaterial);
    }

    fetchMaterials();
  }, []);

  async function onSubmitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const materialId = props.materialId;

    const { message } = await removeMaterial(materialId, formData);
    setSubmitMessage(message);
  }

  return (
    <>
      <button onClick={() => redirect("/materials/")}>Go back</button>
      <h2>Use Material</h2>
      <p>Info: An item will be removed from the location</p>
      <form onSubmit={onSubmitForm}>
        <label>Customer: {material.CustomerName}</label>
        <label>Stock ID: {material.StockID}</label>
        <label>Current Location: {material.LocationName}</label>
        <label>Type: {material.MaterialType}</label>
        <label>Ownership: {material.Owner}</label>
        <label>Allow for use: {material.IsActive ? "Yes" : "No"}</label>
        <label>Descripion: {material.Description}</label>
        <label>Current Qty: {material.Quantity}</label>
        <input
          type="number"
          name="quantity"
          placeholder="Quantity to Use"
          required
        />
        <input
          type="text"
          name="jobTicket"
          placeholder="Job Ticket #"
          required
        />
        <p>{sumbitMessage}</p>
        <SubmitButton title="Use Material" />
      </form>
    </>
  );
}
