"use client";
import { useActionState, useEffect, useState } from "react";
import { SubmitButton } from "ui/submit-button";
import {
  createWarehouse,
  fetchLocations,
  fetchWarehouses,
} from "../actions/warehouses";
import { initialState } from "utils/constants";

export function WarehouseForm() {
  const [warehouses, setWarehouses] = useState([
    { warehouseId: 0, warehouseName: "Loading..." },
  ]);
  const [state, formAction] = useActionState(createWarehouse, initialState);

  useEffect(() => {
    const getWarehouses = async () => {
      const warehouses = await fetchWarehouses();
      setWarehouses(warehouses);
    };
    getWarehouses();
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
  const [showLocations, setShowLocations] = useState(false);

  useEffect(() => {
    const getLocations = async () => {
      const locations = await fetchLocations();
      setLocations(locations);
    };
    getLocations();
  }, []);

  return (
    <section>
      <h2>Current Locations: {locations.length}</h2>
      <button onClick={() => setShowLocations(!showLocations)}>
        {showLocations ? "Hide" : "Show"} Locations
      </button>
      {showLocations ? (
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
      ) : (
        ""
      )}
    </section>
  );
}
