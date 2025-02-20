"use client";
import { SubmitButton } from "ui/submit-button";
import { useActionState, useEffect, useState } from "react";
import { createCustomer, fetchCustomers } from "actions/customers";

const initialState = {
  message: "",
};

export function CustomerForm() {
  const [state, formAction] = useActionState(createCustomer, initialState);
  return (
    <section>
      <h2>Add Customer</h2>
      <form action={formAction}>
        <div className="form-line">
          <label>Customer Code:</label>
          <input
            type="text"
            name="customerCode"
            placeholder="Customer Code"
            required
          />
        </div>
        <div className="form-line">
          <label>Customer Name:</label>
          <input
            type="text"
            name="customerName"
            placeholder="Customer Name"
            required
          />
        </div>
        <p className="submit-message">{state?.message}</p>
        <div className="form-buttons">
          <SubmitButton title="Add Customer" />
        </div>
      </form>
    </section>
  );
}

export function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showCustomers, setShowCustomers] = useState(false);

  useEffect(() => {
    const getCustomers = async () => {
      const customers = await fetchCustomers();
      setCustomers(customers);
    };
    getCustomers();
  }, []);

  return (
    <section>
      <h2>Current Customers: {customers.length}</h2>
      <button onClick={() => setShowCustomers(!showCustomers)}>
        {showCustomers ? "Hide" : "Show"} Customers
      </button>
      {showCustomers ? (
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Customer Code</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer: any, i) => (
              <tr key={i}>
                <td>{customer.name}</td>
                <td>{customer.code.padStart(3, "0")}</td>
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
