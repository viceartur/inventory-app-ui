"use client";
import { SubmitButton } from "ui/submit-button";
import { FormEvent, useActionState, useEffect, useRef, useState } from "react";
import {
  createCustomer,
  fetchCustomer,
  fetchCustomers,
  updateCustomer,
} from "actions/customers";

const initialState = {
  message: "",
};

export function AddCustomerForm() {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [state, formAction] = useActionState(createCustomer, initialState);
  return (
    <section>
      <h2>Add a Customer</h2>
      <div className="section-description">
        <p>
          To add a new customer to the database, CSR staff should complete the
          customer information form below.
        </p>
      </div>
      <button className="control-button" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Hide" : "Show"} the Form
      </button>
      {showForm && (
        <form action={formAction}>
          <div className="form-line">
            <label htmlFor="customerName">Customer Name:</label>
            <input
              id="customerName"
              type="text"
              name="customerName"
              placeholder="Enter the unique customer's full name (required)"
              required
              autoComplete="off"
            />
          </div>
          <div className="form-line">
            <label htmlFor="customerCode">Customer Code:</label>
            <input
              id="customerCode"
              type="text"
              name="customerCode"
              placeholder="Enter the customer code (required)"
              required
              autoComplete="off"
            />
          </div>
          <div className="form-line">
            <label htmlFor="atlasName">Atlas Name:</label>
            <input
              id="atlasName"
              type="text"
              name="atlasName"
              placeholder="Atlas-specific customer name (optional)"
              autoComplete="off"
            />
          </div>
          <div className="form-checkboxes">
            <label htmlFor="isActive">Active Customer</label>
            <input id="isActive" type="checkbox" name="isActive" />
            <small>(Check if this customer is currently active)</small>
          </div>
          <p className="submit-message">{state?.message}</p>
          <div className="form-buttons">
            <SubmitButton title="Add Customer" />
          </div>
        </form>
      )}
    </section>
  );
}

export function Customers() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showCustomers, setShowCustomers] = useState(false);
  const [showEditingWindow, setShowEditingWindow] = useState(false);
  const [customerOnUpdate, setCustomerOnUpdate] = useState<any | null>({});
  const [submitMessage, setSubmitMessage] = useState<string>("");

  useEffect(() => {
    if (showCustomers) {
      fetchAndSetCustomers();
    }
  }, [showCustomers]);

  const fetchAndSetCustomers = async () => {
    const customers = await fetchCustomers();
    setCustomers(customers);
  };

  const fetchCustomerInfo = async (customerId: number) => {
    const customer = await fetchCustomer(customerId);
    setCustomerOnUpdate(customer);
    setShowEditingWindow(true);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customerOnUpdate) return;

    const formData = new FormData(event.currentTarget);
    const res: any = await updateCustomer(
      customerOnUpdate.customerId,
      formData
    );

    if (res?.error) {
      setSubmitMessage(res.error);
    } else {
      setSubmitMessage(res.message + " Returning back to the list...");
      await fetchAndSetCustomers();
      setTimeout(() => {
        setShowEditingWindow(false);
        setSubmitMessage("");
      }, 1000);
    }
  };

  const cancelEditing = () => {
    setShowEditingWindow(false);
    setSubmitMessage("");
    setCustomerOnUpdate(null);
  };

  return (
    <section>
      <h2>Current Customers</h2>
      <div className="section-description">
        <p>
          Below is the list of current customers. <strong>Double-click</strong>{" "}
          on a customer to edit their information.
        </p>
      </div>
      <button
        className="control-button"
        onClick={() => setShowCustomers(!showCustomers)}
      >
        {showCustomers ? "Hide" : "Show"} Customers
      </button>

      {showCustomers && (
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Customer Code</th>
              <th>Atlas Name</th>
              <th>Is Active</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer: any, i) => (
              <tr key={i} onDoubleClick={() => fetchCustomerInfo(customer.id)}>
                <td>
                  <strong>{customer.name}</strong>
                </td>
                <td>{customer.code.padStart(3, "0")}</td>
                <td>{customer.atlasName || "-"}</td>
                <td className={customer.isActive ? "positive" : "negative"}>
                  {customer.isActive ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showEditingWindow && (
        <>
          <div className="blur-overlay" onClick={cancelEditing} />
          <div className="editing-window">
            <form ref={formRef} onSubmit={onSubmit}>
              <div className="form-line">
                <label htmlFor="customerName">Customer Name:</label>
                <input
                  id="customerName"
                  type="text"
                  name="customerName"
                  placeholder="Enter the unique customer's full name (required)"
                  required
                  autoComplete="off"
                  defaultValue={customerOnUpdate.customerName}
                />
              </div>
              <div className="form-line">
                <label htmlFor="customerCode">Customer Code:</label>
                <input
                  id="customerCode"
                  type="text"
                  name="customerCode"
                  placeholder="Enter the customer code (required)"
                  required
                  autoComplete="off"
                  defaultValue={customerOnUpdate.customerCode}
                />
              </div>
              <div className="form-line">
                <label htmlFor="atlasName">Atlas Name:</label>
                <input
                  id="atlasName"
                  type="text"
                  name="atlasName"
                  placeholder="Atlas-specific customer name (optional)"
                  autoComplete="off"
                  defaultValue={customerOnUpdate.atlasName}
                />
              </div>
              <div className="form-checkboxes">
                <label htmlFor="isActive">Active Customer</label>
                <input
                  id="isActive"
                  type="checkbox"
                  name="isActive"
                  defaultChecked={!!customerOnUpdate.isActive}
                />
                <small>(Check if this customer is currently active)</small>
              </div>

              {submitMessage && (
                <p className="submit-message">{submitMessage}</p>
              )}

              <div className="form-buttons">
                <button type="button" onClick={cancelEditing}>
                  Cancel Editing
                </button>
                <SubmitButton title="Update Customer" />
              </div>
            </form>
          </div>
        </>
      )}
    </section>
  );
}
