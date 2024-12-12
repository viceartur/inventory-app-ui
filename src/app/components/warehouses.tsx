"use client";
import { SubmitButton } from "app/ui/submit-button";
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
        <label>Warehouse Name:</label>
        <input
          type="text"
          name="warehouseName"
          placeholder="Warehouse Name"
          required
        />
        <label>Location Name:</label>
        <input
          type="text"
          name="locationName"
          placeholder="Location Name"
          required
        />
        <p>{state?.message}</p>
        <SubmitButton title="Add Warehouse" />
      </form>
    </section>
  );
}
