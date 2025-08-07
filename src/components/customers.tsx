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
  sendEmailToCustomer,
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
            <textarea
              id="emails"
              name="emails"
              placeholder="Enter email(s) separated by a comma (required)"
              required
              autoComplete="off"
            />
          </div>
          <div className="form-checkboxes">
            <label>Connect to Reports:</label>
            <input
              id="isConnectedToReports"
              type="checkbox"
              name="isConnectedToReports"
            />
            <small>
              (Check if this customer is connected to sending email reports)
            </small>
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomers, setShowCustomers] = useState(false);
  const [showEditingWindow, setShowEditingWindow] = useState(false);
  const [showEmailWindow, setShowEmailWindow] = useState(false);
  const [customerId, setCustomerId] = useState<number>(0);
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

  const onSubmit = async (
    event: FormEvent<HTMLFormElement>,
    actionType: string
  ) => {
    event.preventDefault();
    if (!customerOnUpdate?.customerId && !customerId) {
      setSubmitMessage("No customer data defined from the form.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    let res: any;
    if (actionType === "updateCustomer") {
      if (customerOnUpdate?.customerId) {
        res = await updateCustomer(
          session?.user.id,
          customerOnUpdate.customerId,
          formData
        );
      }
    } else if (actionType === "sendEmail") {
      res = await sendEmailToCustomer(customerId, formData);
    }

    if (res?.error) {
      setSubmitMessage(res.error);
    } else {
      setSubmitMessage(res?.message + " Returning back to the list...");
      await fetchAndSetCustomers();
      setTimeout(() => {
        setShowEditingWindow(false);
        setShowEmailWindow(false);
        setSubmitMessage("");
      }, 1000);
    }
  };

  const cancelEditing = () => {
    setShowEditingWindow(false);
    setShowEmailWindow(false);
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
        <div className="customer-list">
          {customers.map((customer, i) => (
            <div key={i} className="customer-card">
              <div className="customer-card__header">
                <div className="customer-card__name">
                  {customer.customerName}
                </div>
                <p className="customer-card__rep">
                  Representative:{" "}
                  {customer.username
                    ? formatUserName(customer.username)
                    : "Not assigned"}
                </p>
              </div>

              <div className="customer-card__section">
                <p className="customer-card__label">Customer Emails:</p>
                {customer.emails && Array.isArray(customer.emails) ? (
                  <ul className="customer-card__emails">
                    {customer.emails.map((email: string) => (
                      <li key={email} className="customer-card__email">
                        {email}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="customer-card__empty">-</p>
                )}
              </div>

              <div className="customer-card__section">
                <span
                  className={`customer-card__status ${
                    customer.isConnectedToReports
                      ? "customer-card__status--positive"
                      : "customer-card__status--negative"
                  }`}
                >
                  {customer.isConnectedToReports ? "" : "Not"} Connected to
                  Reports.
                </span>
              </div>

              <div className="customer-card__section">
                <p className="customer-card__label">Last Report Sent:</p>
                <p className="customer-card__value">
                  {customer.lastReportSentAt &&
                  customer.lastReportSentAt !== "0001-01-01T00:00:00Z"
                    ? new Date(customer.lastReportSentAt).toLocaleString()
                    : "No data"}
                </p>
              </div>

              {customer.lastReportDeliveryStatus && (
                <div className="customer-card__section">
                  <span
                    className={`customer-card__delivery ${
                      customer.lastReportDeliveryStatus
                        .toLowerCase()
                        .includes("success")
                        ? "customer-card__delivery--positive"
                        : "customer-card__delivery--negative"
                    }`}
                  >
                    {customer.lastReportDeliveryStatus}
                  </span>
                </div>
              )}
              <div className="customer-card__footer">
                <button
                  className="customer-card__button"
                  onClick={() => {
                    if (customer.customerId) {
                      fetchCustomerInfo(customer.customerId);
                    }
                  }}
                >
                  Edit Info
                </button>

                {customer.isConnectedToReports && (
                  <button
                    className="customer-card__button customer-card__button--primary"
                    onClick={() => {
                      if (customer.customerId) {
                        setCustomerId(customer.customerId);
                        setShowEmailWindow(true);
                      }
                    }}
                  >
                    Email Report
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit the customer information */}
      {showEditingWindow && (
        <>
          <div className="blur-overlay" onClick={cancelEditing} />
          <div className="editing-window">
            <form
              onSubmit={(e: FormEvent<HTMLFormElement>) =>
                onSubmit(e, "updateCustomer")
              }
            >
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
                <textarea
                  id="emails"
                  name="emails"
                  placeholder="Enter email(s) separated by a comma (required)"
                  required
                  autoComplete="off"
                  defaultValue={customerOnUpdate?.emails?.join(",") || ""}
                />
              </div>
              <div className="form-checkboxes">
                <label>Connect to Reports:</label>
                <input
                  id="isConnectedToReports"
                  type="checkbox"
                  name="isConnectedToReports"
                  defaultChecked={!!customerOnUpdate?.isConnectedToReports}
                />
                <small>
                  (Check if this customer is connected to sending email reports)
                </small>
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

      {/* Email the report */}
      {showEmailWindow && (
        <>
          <div className="blur-overlay" onClick={cancelEditing} />
          <div className="editing-window">
            <form
              onSubmit={(e: FormEvent<HTMLFormElement>) =>
                onSubmit(e, "sendEmail")
              }
            >
              <div className="form-info">
                <p>
                  Please select a valid reporting period. Both dates are
                  required, and the end date cannot be in the future.
                </p>
              </div>

              <div className="form-line">
                <label htmlFor="dateFrom">Date From:</label>
                <input
                  id="dateFrom"
                  type="date"
                  name="dateFrom"
                  required
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="form-line">
                <label htmlFor="dateTo">Date To:</label>
                <input
                  id="dateTo"
                  type="date"
                  name="dateTo"
                  required
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="form-line">
                <small>
                  ⚠️ <strong>Note:</strong> The customer report will include{" "}
                  <em>starting quantity</em>, <em>ending quantity</em>,{" "}
                  <em>used</em>, <em>spoiled</em>, and a{" "}
                  <em>6-week forecast</em>, based on the selected period. It
                  will be sent to the specified email addresses and CC’d to the
                  assigned representative.
                </small>
              </div>

              {submitMessage && (
                <p className="submit-message" role="alert">
                  {submitMessage}
                </p>
              )}

              <div className="form-buttons">
                <button type="button" onClick={cancelEditing}>
                  Exit
                </button>
                <SubmitButton title={"Send Report"} />
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
