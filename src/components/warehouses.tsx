"use client";
import { useActionState, useEffect, useState } from "react";
import { SubmitButton } from "ui/submit-button";
import { createWarehouse } from "../actions/warehouses";
import { API } from "utils/constants";

const initialState = {
  message: "",
};

export function WarehouseForm() {
  const [warehouses, setWarehouses] = useState([
    { warehouseId: 0, warehouseName: "" },
  ]);
  const [state, formAction] = useActionState(createWarehouse, initialState);

  useEffect(() => {
    async function fetchMaterials() {
      const res = await fetch(`${API}/warehouses`);
      if (!res) return;

      const data = await res.json();
      if (!data?.length) return;

      const warehouses = data.map((warehouse: any) => ({
        warehouseId: warehouse.WarehouseID,
        warehouseName: warehouse.WarehouseName,
      }));

      setWarehouses(warehouses);
    }

    fetchMaterials();
  }, []);

  return (
    <section>
      <h2>Add a Location to a Warehouse</h2>
      <form action={formAction}>
        <div className="form-line">
          <label>Warehouse Name:</label>
          <input
            list="warehouses"
            name="warehouseName"
            placeholder="Warehouse Name"
            defaultValue={warehouses[0].warehouseName}
            key={warehouses[0].warehouseName}
          />
          <datalist id="warehouses">
            {warehouses.map((w: any, i: number) => (
              <option key={i} value={w.warehouseName} />
            ))}
          </datalist>
        </div>
        <div className="form-line">
          <label>Location Name:</label>
          <input
            type="text"
            name="locationName"
            placeholder="Location Name"
            required
          />
        </div>
        <p className="submit-message">{state?.message}</p>
        <SubmitButton title="Add Location" />
      </form>
    </section>
  );
}

export function Locations() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    async function fetchLocations() {
      const res = await fetch(`${API}/locations`);
      const data = await res.json();
      if (!data?.length) {
        setLocations([]);
        return;
      }

      const locations = data.map((location: any) => ({
        id: location.ID,
        locationName: location.Name,
        warehouseName: location.WarehouseName,
      }));
      setLocations(locations);
    }
    fetchLocations();
  }, []);

  return (
    <section>
      <h2>Current Locations List: {locations.length}</h2>
      <table>
        <thead>
          <tr>
            <th>Location Name</th>
            <th>Warehouse Name</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location: any, i) => (
            <tr key={i}>
              <td>{location.locationName}</td>
              <td>{location.warehouseName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
