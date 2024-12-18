"use client";
import { SubmitButton } from "ui/submit-button";
import { createWarehouse } from "../actions/warehouses";
import { useActionState } from "react";

const initialState = {
  message: "",
};

export function WarehouseForm() {
  const [state, formAction] = useActionState(createWarehouse, initialState);
  return (
    <section>
      <h2>Add Warehouse and Location</h2>
      <form action={formAction}>
        <div className="form-line">
          <label>Warehouse Name:</label>
          <input
            type="text"
            name="warehouseName"
            placeholder="Warehouse Name"
            required
          />
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
        <SubmitButton title="Add Warehouse" />
      </form>
    </section>
  );
}
