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
  const [warehouses, setWarehouses] = useState([]);

  const [state, formAction] = useActionState(createWarehouse, initialState);

  useEffect(() => {
    const getWarehouses = async () => {
      const warehouses = await fetchWarehouses();
      console.log(warehouses);
      setWarehouses(warehouses);
    };
    getWarehouses();
  }, []);

  return (
    <section>
      <h2>Add a Location to the Warehouse</h2>
      <form action={formAction}>
        <div className="form-line">
          <label>Warehouse Name:</label>
          <select name="warehouseName" required>
            <option value="">-- Choose a warehouse --</option>
            {warehouses.map((warehouse: any) => (
              <option
                key={warehouse.warehouseId}
                value={warehouse.warehouseName}
              >
                {warehouse.warehouseName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-line">
          <label>Location Name:</label>
          <input
            type="text"
            name="locationName"
            placeholder="Enter the location name assigned"
            required
          />
        </div>
        <p className="submit-message">{state?.message}</p>
        <div className="form-buttons">
          <SubmitButton title="Add Location" />
        </div>
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
      <button
        className="control-button"
        onClick={() => setShowLocations(!showLocations)}
      >
        {showLocations ? "Hide" : "Show"} Locations
      </button>
      {showLocations ? (
        <table>
          <thead>
            <tr>
              <th>Warehouse Name</th>
              <th>Location Name</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((location: any, i) => (
              <tr key={i}>
                <td>{location.warehouseName}</td>
                <td>{location.locationName}</td>
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
