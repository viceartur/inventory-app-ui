"use client";
import { SubmitButton } from "ui/submit-button";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import {
  createCustomer,
  createCustomerProgram,
  Customer,
  CustomerProgram,
  fetchCustomer,
  fetchCustomerProgram,
  fetchCustomerPrograms,
  fetchCustomers,
  updateCustomer,
  updateCustomerProgram,
} from "actions/customers";
import { formatUserName } from "utils/client_utils";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

export function CustomerManagement() {
  return (
    <section>
      <h2>Customer Management</h2>
      <div className="section-cards">
        {/* Customer Block */}
        <div className="card">
          <h3>👤 Customers</h3>
          <p>
            CSR staff can create and manage <strong>Customers</strong>. Each
            customer stores one or more email addresses and is linked to a
            designated representative.
          </p>
          <p>
            <strong>Customer Reports</strong> aggregate data across all assigned
            programs and are sent to the provided email addresses, with a copy
            (CC) sent to the representative.
          </p>
          <button
            className="control-button"
            onClick={() => redirect("/customer-management/customers")}
          >
            Manage Customers
          </button>
        </div>

        {/* Program Block */}
        <div className="card">
          <h3>🧩 Customer Programs</h3>
          <p>
            <strong>Programs</strong> are tied to specific customers and store
            key information such as program codes and active status. They are
            used for material inventory management.
          </p>
          <p>
            ⚠️ <strong>Note:</strong> A program cannot be created without first
            selecting or creating an associated customer.
          </p>
          <button
            className="control-button"
            onClick={() => redirect("/customer-management/customer-programs")}
          >
            Manage Programs
          </button>
        </div>
      </div>
    </section>
  );
}

export function AddCustomerForm() {
  const { data: session } = useSession();
  const formRef = useRef<HTMLFormElement | null>(null);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const res: any = await createCustomer(formData, session?.user.id);

    if (res?.error) {
      setSubmitMessage(res.error);
    } else {
      setSubmitMessage(res.message);
      formRef.current?.reset();
    }
  };

  return (
    <section>
      <div>
        <button
          className="control-button"
          onClick={() => redirect("/customer-management")}
        >
          Go to Description
        </button>
        <button
          className="control-button"
          onClick={() => redirect("/customer-management/customer-programs")}
        >
          Go to Programs
        </button>
      </div>
      <h2>Add a Customer</h2>
      <button className="control-button" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Hide" : "Show"} the Form
      </button>
      {showForm && (
        <form ref={formRef} onSubmit={onSubmit}>
          <div className="form-line">
            <label>Customer Name:</label>
            <input
              id="customerName"
              type="text"
              name="customerName"
              placeholder="Enter the customer name (required)"
              required
            />
          </div>
          <div className="form-line">
            <label>Customer Email(s):</label>
            <input
              id="emails"
              type="text"
              name="emails"
              placeholder="Enter email(s) separated by a comma (required)"
              required
              autoComplete="off"
            />
          </div>
          <div className="form-line">
            <small>
              ⚠️ <strong>Note:</strong> Once you create a customer, your account
              will automatically be assigned as its representative.
            </small>
          </div>
          <p className="submit-message">{submitMessage}</p>
          <div className="form-buttons">
            <SubmitButton title="Add Customer" />
          </div>
        </form>
      )}
    </section>
  );
}

export function Customers() {
  const { data: session } = useSession();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomers, setShowCustomers] = useState(false);
  const [showEditingWindow, setShowEditingWindow] = useState(false);
  const [customerOnUpdate, setCustomerOnUpdate] = useState<Customer | null>();
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
    if (!customerOnUpdate || !customerOnUpdate.customerId) return;

    const formData = new FormData(event.currentTarget);

    const res: any = await updateCustomer(
      session?.user.id,
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
              <th>Customer Emails</th>
              <th>Representative</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, i) => (
              <tr
                key={i}
                onDoubleClick={() => {
                  if (customer.customerId) {
                    fetchCustomerInfo(customer.customerId);
                  }
                }}
              >
                <td>
                  <strong>{customer.customerName}</strong>
                </td>
                <td>
                  {customer.emails && Array.isArray(customer.emails)
                    ? customer.emails.map((email: string) => (
                        <span key={email}>
                          <small>{email}</small>
                          {<br />}
                        </span>
                      ))
                    : "-"}
                </td>
                <td>
                  {customer.username
                    ? formatUserName(customer.username)
                    : "Not assigned"}
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
                <label>Customer Name:</label>
                <input
                  id="customerName"
                  type="text"
                  name="customerName"
                  placeholder="Enter the customer name (required)"
                  required
                  defaultValue={customerOnUpdate?.customerName || ""}
                />
              </div>
              <div className="form-line">
                <label>Customer Email(s):</label>
                <input
                  id="emails"
                  type="text"
                  name="emails"
                  placeholder="Enter email(s) separated by a comma (required)"
                  required
                  autoComplete="off"
                  defaultValue={customerOnUpdate?.emails?.join(",") || ""}
                />
              </div>
              <div className="form-line">
                <small>
                  ⚠️ <strong>Note:</strong> Once you update this customer, your
                  account will automatically be assigned as its representative.
                </small>
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

export function AddCustomerProgramForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const getCustomers = async () => {
      const customers = await fetchCustomers();
      setCustomers(customers);
    };
    getCustomers();
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const res: any = await createCustomerProgram(formData);

    if (res?.error) {
      setSubmitMessage(res.error);
    } else {
      setSubmitMessage(res.message);
      formRef.current?.reset();
    }
  };

  return (
    <section>
      <div>
        <button
          className="control-button"
          onClick={() => redirect("/customer-management")}
        >
          Go to Description
        </button>
        <button
          className="control-button"
          onClick={() => redirect("/customer-management/customers")}
        >
          Go to Customers
        </button>
      </div>
      <h2>Add a Customer Program</h2>
      <button className="control-button" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Hide" : "Show"} the Form
      </button>
      {showForm && (
        <form ref={formRef} onSubmit={onSubmit}>
          <div className="form-line">
            <label htmlFor="programName">Program Name:</label>
            <input
              id="programName"
              type="text"
              name="programName"
              placeholder="Enter the program name (required)"
              required
            />
          </div>
          <div className="form-line">
            <label htmlFor="programCode">Program Code:</label>
            <input
              id="programCode"
              type="text"
              name="programCode"
              placeholder="Enter the customer program code (required)"
              required
              autoComplete="off"
            />
          </div>
          <div className="form-line">
            <label htmlFor="programCode">Customer:</label>
            <select name="customerId" id="customerId" required>
              <option value="">-- Choose a customer --</option>
              {customers.map((customer) => (
                <option value={customer.customerId} key={customer.customerId}>
                  {customer.customerName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-checkboxes">
            <label htmlFor="isActiveProgram">Active Program</label>
            <input
              id="isActiveProgram"
              type="checkbox"
              name="isActiveProgram"
            />
            <small>(Check if this customer program is currently active)</small>
          </div>
          <p className="submit-message">{submitMessage}</p>
          <div className="form-buttons">
            <SubmitButton title="Add Program" />
          </div>
        </form>
      )}
    </section>
  );
}

export function CustomerPrograms() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [programs, setPrograms] = useState<Record<string, CustomerProgram[]>>(
    {}
  );
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomers, setShowCustomers] = useState(false);
  const [showEditingWindow, setShowEditingWindow] = useState(false);
  const [programOnUpdate, setProgramOnUpdate] =
    useState<CustomerProgram | null>();
  const [submitMessage, setSubmitMessage] = useState<string>("");

  useEffect(() => {
    if (showCustomers) {
      fetchAndSetPrograms();
    }
  }, [showCustomers]);

  const fetchAndSetPrograms = async () => {
    const programs = await fetchCustomerPrograms();
    const groupedPrograms = programs.reduce((acc, program) => {
      const customerName = program.customerName || "Unknown";
      if (!acc[customerName]) acc[customerName] = [];
      acc[customerName].push(program);
      return acc;
    }, {} as Record<string, typeof programs>);
    setPrograms(groupedPrograms);
  };

  const fetchProgramInfo = async (programId: number) => {
    const program = await fetchCustomerProgram(programId);
    const customers = await fetchCustomers();
    setCustomers(customers);
    setProgramOnUpdate(program);
    setShowEditingWindow(true);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!programOnUpdate || !programOnUpdate.programId) return;

    const formData = new FormData(event.currentTarget);
    const res: any = await updateCustomerProgram(
      programOnUpdate.programId,
      formData
    );

    if (res?.error) {
      setSubmitMessage(res.error);
    } else {
      setSubmitMessage(res.message + " Returning back to the list...");
      await fetchAndSetPrograms();
      setTimeout(() => {
        setShowEditingWindow(false);
        setSubmitMessage("");
      }, 1000);
    }
  };

  const cancelEditing = () => {
    setShowEditingWindow(false);
    setSubmitMessage("");
    setProgramOnUpdate(null);
  };

  return (
    <section>
      <h2>Current Programs</h2>
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
              <th>Program Name</th>
              <th>Program Code</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(programs).map(([customerName, programs], i) => (
              <React.Fragment key={i}>
                <tr>
                  <td colSpan={3} className="group-header">
                    👤 <strong>{customerName}</strong>
                  </td>
                </tr>
                {programs.map((program) => (
                  <tr
                    key={program.programId}
                    onDoubleClick={() => {
                      if (program.programId) {
                        fetchProgramInfo(program.programId);
                      }
                    }}
                  >
                    <td>
                      <strong>{program.programName}</strong>
                    </td>
                    <td>{program.programCode.padStart(3, "0")}</td>
                    <td className={program.isActive ? "positive" : "negative"}>
                      {program.isActive ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
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
                <label htmlFor="programName">Program Name:</label>
                <input
                  id="programName"
                  type="text"
                  name="programName"
                  placeholder="Enter the program name (required)"
                  defaultValue={programOnUpdate?.programName}
                  required
                />
              </div>
              <div className="form-line">
                <label htmlFor="programCode">Program Code:</label>
                <input
                  id="programCode"
                  type="text"
                  name="programCode"
                  placeholder="Enter the program code (required)"
                  required
                  defaultValue={programOnUpdate?.programCode}
                  autoComplete="off"
                />
              </div>
              <div className="form-line">
                <label htmlFor="programCode">Customer:</label>
                <select
                  name="customerId"
                  id="customerId"
                  required
                  defaultValue={programOnUpdate?.customerId}
                >
                  <option value="">-- Choose a customer --</option>
                  {customers.map((customer) => (
                    <option
                      value={customer.customerId}
                      key={customer.customerId}
                    >
                      {customer.customerName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-checkboxes">
                <label htmlFor="isActiveProgram">Active Program</label>
                <input
                  id="isActiveProgram"
                  type="checkbox"
                  name="isActiveProgram"
                  defaultChecked={!!programOnUpdate?.isActive}
                />
                <small>
                  (Check if this customer program is currently active)
                </small>
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
