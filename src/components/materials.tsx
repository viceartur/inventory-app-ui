"use client";
import { FormEvent, useActionState, useEffect, useState } from "react";
import { redirect } from "next/navigation";

import { SubmitButton } from "ui/submit-button";
import {
  createMaterial,
  moveMaterial,
  removeMaterial,
  sendMaterial,
} from "../actions/materials";
import { API } from "utils/constants";

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
      const res = await fetch(`${API}/customers`);
      const data = await res.json();
      if (!data?.length) {
        setSelectCustomers([]);
        return;
      }

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
      const res = await fetch(`${API}/material_types`);
      if (!res) return;

      const data = await res.json();
      if (!data?.length) return;

      const types = data.map((type: any, i: number) => ({
        id: i,
        name: type,
      }));
      setSelectMaterialTypes(types);
    }
    fetchMaterialTypes();
  }, []);

  return (
    <section>
      <h2>Send Material to Incoming</h2>
      <form action={materialFormAction}>
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
        <p className="submit-message">{state?.message}</p>
        <SubmitButton title="Send Material" />
      </form>
    </section>
  );
}

export function IncomingMaterials() {
  const [incomingMaterialsList, setIncomingMaterialsList] = useState([]);

  useEffect(() => {
    async function fetchIncomingMaterials() {
      const res = await fetch(`${API}/incoming_materials`);
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
              <p>{material.qty}</p>
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
    </section>
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
    Description: "Loading...",
    IsActive: "Loading...",
    MaterialType: "Loading...",
    Owner: "Loading...",
  });
  const [selectLocations, setSelectLocations] = useState([selectState]);

  useEffect(() => {
    async function fetchIncomingMaterials() {
      const res = await fetch(`${API}/incoming_materials`);
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
      if (
        incomingMaterial.StockID == "Loading..." ||
        incomingMaterial.Owner == "Loading..."
      )
        return;

      const res = await fetch(
        API +
          `/available_locations?stockId=${incomingMaterial.StockID}&owner=${incomingMaterial.Owner}`
      );
      const data = await res.json();
      if (!data?.length) {
        setSelectLocations([]);
        return;
      }

      const locations = data.map((location: any) => ({
        id: location.ID,
        name: location.Name,
      }));

      setSelectLocations(locations);
    }
    fetchLocations();
  }, [incomingMaterial]);

  async function onSubmitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const incomingMaterialId = props.materialId;

    const res: any = await createMaterial(incomingMaterialId, formData);
    if (res?.error) {
      setSubmitMessage(res.error);
    } else {
      setSubmitMessage("Material Added. Redirecting to Incoming Materials...");
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
          <div>
            <label>Customer: </label>
            {incomingMaterial.CustomerName}
          </div>
          <div>
            <label>Stock ID: </label>
            {incomingMaterial.StockID}
          </div>
          <div>
            <label>Type: </label>
            {incomingMaterial.MaterialType}
          </div>
          <div>
            <label>Ownership:</label>
            {incomingMaterial.Owner}
          </div>
          <div>
            <label>Allow for use:</label>
            {incomingMaterial.IsActive ? "Yes" : "No"}
          </div>
          <div>
            <label>Description:</label>
            {incomingMaterial.Description}
          </div>
        </div>
        <div className="form-line">
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            key={incomingMaterial.Quantity}
            defaultValue={incomingMaterial.Quantity}
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
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    async function fetchMaterials() {
      const res = await fetch(`${API}/materials`);
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
    <section>
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
          <p>Owner</p>
          <p>Action Buttons</p>
        </div>
        {filteredItems.map((material: any, i) => (
          <div className="material_list-item" key={i}>
            <p>{material.customerName}</p>
            <p>{material.stockId}</p>
            <p>{material.qty}</p>
            <p>{material.locationName}</p>
            <p>{material.owner}</p>
            <button
              disabled={material.qty == 0}
              onClick={() =>
                redirect(`/materials/remove-material/${material.materialId}`)
              }
            >
              Use Material
            </button>
            <button
              disabled={material.qty == 0}
              onClick={() =>
                redirect(`/materials/move-material/${material.materialId}`)
              }
            >
              Move Material
            </button>
          </div>
        ))}
      </div>
    </section>
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
    Description: "Loading...",
    Notes: "Loading...",
    IsActive: "Loading...",
    MaterialType: "Loading...",
    Owner: "Loading...",
  });
  const [selectLocations, setSelectLocations] = useState([selectState]);

  useEffect(() => {
    async function fetchMaterials() {
      const res = await fetch(`${API}/materials`);
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
      if (material.StockID == "Loading..." || material.Owner == "Loading...")
        return;

      const res = await fetch(
        API +
          `/available_locations?stockId=${material.StockID}&owner=${material.Owner}`
      );
      const data = await res.json();
      if (!data?.length) return;

      const locations = data
        .map((location: any) => ({
          id: location.ID,
          name: location.Name,
        }))
        .filter((location: any) => material.LocationID != location.id);

      setSelectLocations(locations);
    }
    fetchLocations();
  }, [material]);

  async function onSubmitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
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

  return (
    <section>
      <h2>Move Material to Location</h2>
      <form onSubmit={onSubmitForm}>
        <div className="form-info">
          <h3>The Material will be moved to a Location</h3>
          <div>
            <label>Customer:</label>
            {material.CustomerName}
          </div>
          <div>
            <label>Stock ID:</label>
            {material.StockID}
          </div>
          <div>
            <label>Description:</label>
            {material.Description}
          </div>
          <div>
            <label>Current Location:</label>
            {material.LocationName}
          </div>
          <div>
            <label>Type:</label>
            {material.MaterialType}
          </div>
          <div>
            <label>Ownership:</label>
            {material.Owner}
          </div>
          <div>
            <label>Allow for use:</label>
            {material.IsActive ? "Yes" : "No"}
          </div>
          <div>
            <label>Notes:</label>
            {material.Notes}
          </div>
          <div>
            <label>Current Qty:</label>
            {material.Quantity}
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
    </section>
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
      const res = await fetch(`${API}/materials`);
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

  return (
    <section>
      <h2>Use Material</h2>
      <form onSubmit={onSubmitForm}>
        <div className="form-info">
          <h3>The Material will be removed from the Location</h3>
          <div>
            <label>Customer:</label>
            {material.CustomerName}
          </div>
          <div>
            <label>Stock ID:</label>
            {material.StockID}
          </div>
          <div>
            <label>Description:</label>
            {material.Description}
          </div>
          <div>
            <label>Current Location:</label>
            {material.LocationName}
          </div>
          <div>
            <label>Type:</label>
            {material.MaterialType}
          </div>
          <div>
            <label>Ownership:</label>
            {material.Owner}
          </div>
          <div>
            <label>Allow for use:</label>
            {material.IsActive ? "Yes" : "No"}
          </div>
          <div>
            <label>Notes:</label>
            {material.Notes}
          </div>
          <div>
            <label>Current Qty:</label>
            {material.Quantity}
          </div>{" "}
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
    </section>
  );
}
