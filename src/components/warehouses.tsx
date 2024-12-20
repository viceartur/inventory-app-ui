"use client";
import { useActionState, useEffect, useState } from "react";
import { SubmitButton } from "ui/submit-button";
import { createWarehouse } from "../actions/warehouses";
import { API } from "utils/constants";

const initialState = {
  message: "",
};

export function WarehouseForm() {
  const [warehouses, setWarehouses] = useState([]);
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
          <input list="warehouses" name="warehouseName" />
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
