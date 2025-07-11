"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { redirect, useSearchParams } from "next/navigation";
// import * as XLSX from "xlsx";
import { useSession } from "next-auth/react";

import { SubmitButton } from "ui/submit-button";
import {
  Material,
  fetchMaterials,
  fetchMaterialsByStockID,
  fetchMaterialTransactions,
  fetchMaterialUsageReasons,
  fetchRequestedMaterials,
  moveMaterial,
  removeMaterial,
  updateMaterial,
  updateRequestedMaterial,
  // uploadMaterials,
} from "../../actions/materials";
import { selectState } from "utils/constants";
import { fetchAvailableLocations } from "actions/warehouses";
import {
  debounce,
  DEBOUNCE_DELAY,
  toUSFormat,
  usePreventNumberInputScroll,
} from "utils/client_utils";
import { useSocket } from "context/socket-context";

export function Materials() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [filterOpts, setFilterOpts] = useState<{
    stockId: string;
    programName: string;
    description: string;
    locationName: string;
  } | null>(null);

  useEffect(() => {
    // Don't show the full materials list if no params exist
    const entries = [...searchParams.entries()];
    if (entries.every(([_, v]) => !v)) return;

    setFilterOpts({
      stockId: searchParams.get("stockId") || "",
      programName: searchParams.get("programName") || "",
      description: searchParams.get("description") || "",
      locationName: searchParams.get("locationName") || "",
    });
  }, [searchParams]);

  useEffect(() => {
    if (!filterOpts || !session?.user.role) return;

    const getMaterials = async () => {
      const materials = await fetchMaterials({
        ...filterOpts,
        userRole: session.user.role,
      });
      setMaterialsList(materials.filter((m) => m.quantity));
    };

    getMaterials();
  }, [filterOpts, session]);

  async function onFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const stockId = formData.get("stockId")?.toString() || "";
    const programName = formData.get("programName")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const locationName = formData.get("locationName")?.toString() || "";
    const opts = {
      stockId,
      programName,
      description,
      locationName,
    };
    setFilterOpts(opts);
  }

  const handlePrimaryItem = async (materialId: number) => {
    const primaryMaterial: any = materialsList.find(
      (m: any) => m.materialId == materialId
    );
    if (primaryMaterial) {
      const material = {
        materialId: Number(materialId),
        isPrimary: !primaryMaterial.isPrimary,
      };
      await updateMaterial(material);
      const materials = await fetchMaterials({
        ...filterOpts,
        userRole: session?.user.role,
      });
      setMaterialsList(materials);
    }
  };

  return (
    <section>
      <h2>Inventory List</h2>
      <form className="filter" onSubmit={onFilterSubmit}>
        <input
          type="text"
          name="stockId"
          placeholder="Stock ID"
          defaultValue={filterOpts?.stockId}
        />
        <input
          type="text"
          name="programName"
          placeholder="Customer"
          defaultValue={filterOpts?.programName}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          defaultValue={filterOpts?.description}
        />
        <input
          type="text"
          name="locationName"
          placeholder="Location"
          defaultValue={filterOpts?.locationName}
        />
        <SubmitButton title="Look Up" />
      </form>
      {!materialsList.length ? (
        <p>No items yet. Found Materials will be displayed here</p>
      ) : (
        <>
          <h2>Found Materials: {materialsList.length}</h2>
          <div className="material_list">
            <div className="list_header">
              <p>Stock ID</p>
              <p>Description</p>
              <p>Warehouse</p>
              <p>Location</p>
              <p>
                Quantity (total):{" "}
                {toUSFormat(
                  materialsList.reduce(
                    (sum, item: any) => (sum += item.quantity),
                    0
                  )
                )}
              </p>
              <p>Actions</p>
            </div>
            {materialsList.map((material, i) => (
              <div
                className={`material_list-item${
                  material.owner === "Tag" ? " tag-owned" : " customer-owned"
                }${
                  !material.isActiveProgram || !material.isActiveMaterial
                    ? " inactive"
                    : ""
                }${material.isPrimary ? " primary" : ""}`}
                key={i}
                onDoubleClick={() =>
                  session?.user.role == "warehouse" &&
                  handlePrimaryItem(material.materialId)
                }
              >
                <p>
                  <strong>{material.stockId}</strong>
                </p>
                <p>
                  <small>{material.description}</small>
                </p>
                <p>{material.warehouseName}</p>
                <p>{material.locationName}</p>
                <p>
                  <strong>{toUSFormat(material.quantity)}</strong>
                </p>
                <div className="buttons-box">
                  <button
                    onClick={() =>
                      redirect(
                        `/materials/remove-material/${
                          material.materialId
                        }?${new URLSearchParams(filterOpts || "").toString()}`
                      )
                    }
                  >
                    ❌
                  </button>
                  <button
                    onClick={() =>
                      redirect(
                        `/materials/move-material/${
                          material.materialId
                        }?${new URLSearchParams(filterOpts || "").toString()}`
                      )
                    }
                  >
                    🔀
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export function MoveMaterialForm(props: { materialId: string }) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [sumbitMessage, setSubmitMessage] = useState("");
  const [material, setMaterial] = useState<Material>();
  const [selectLocations, setSelectLocations] = useState([selectState]);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  usePreventNumberInputScroll();

  useEffect(() => {
    if (!session?.user.role) return;

    const getMaterialInfo = async () => {
      const [material] = await fetchMaterials({ materialId: props.materialId });
      const stockId = material.stockId;
      const owner = material.owner;
      const locations = await fetchAvailableLocations(stockId, owner);

      // Filter available Locations depending on User Role
      const filteredLocations = locations.filter((location: any) => {
        if (session.user.role === "vault") {
          return location.warehouseName.toLowerCase().includes("vault");
        } else if (session.user.role === "warehouse") {
          return location.warehouseName.toLowerCase().includes("warehouse");
        } else {
          return true;
        }
      });

      setMaterial(material);
      setSelectLocations(filteredLocations);
    };
    getMaterialInfo();
  }, [session]);

  async function onSubmitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFormData(formData);
    setShowConfirmation(true);
  }

  async function confirmAction() {
    setShowConfirmation(false);
    const materialId = Number(props.materialId);
    const res: any = await moveMaterial(materialId, formData);
    if (res?.error) {
      setSubmitMessage(res.error);
    } else {
      setSubmitMessage("Material Moved. Redirecting to Inventory...");
      setTimeout(() => {
        redirect(`/materials?${new URLSearchParams(searchParams).toString()}`);
      }, 1000);
    }
  }

  function cancelAction() {
    setShowConfirmation(false);
    setFormData(null);
  }

  return (
    <section>
      <h2>Move a Material to the Location</h2>
      <form onSubmit={onSubmitForm}>
        <div className="form-info">
          <h3>The Material will be moved to a Location</h3>
          <div className="form-info-line">
            <label>Customer Program:</label>
            {material?.programName}
          </div>
          <div className="form-info-line">
            <label>Stock ID:</label>
            {material?.stockId}
          </div>
          <div className="form-info-line">
            <label>Description:</label>
            {material?.description}
          </div>
          <div className="form-info-line">
            <label>Warehouse:</label>
            {material?.warehouseName}
          </div>
          <div className="form-info-line">
            <label>Location:</label>
            {material?.locationName}
          </div>
          <div className="form-info-line">
            <label>Type:</label>
            {material?.materialType}
          </div>
          {material?.materialType === "CHIPS" && (
            <div className="form-info-line">
              <label>Serial # range:</label>
              {material?.serialNumberRange}
            </div>
          )}
          <div className="form-info-line">
            <label>Ownership:</label>
            {material?.owner}
          </div>
          <div className="form-info-line">
            <label>Notes:</label>
            {material?.notes}
          </div>
          <div className="form-info-line">
            <label>Current Qty:</label>
            {toUSFormat(material?.quantity || 0)}
          </div>
        </div>
        <div className="form-line">
          <label>Quantity to Move:</label>
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            required
          />
        </div>
        <div className="form-line">
          <label>New location:</label>
          <select name="locationId" required>
            {selectLocations.map((location: any, i: number) => (
              <option key={i} value={location.id}>
                {location.name} ({location.warehouseName})
              </option>
            ))}
          </select>
        </div>
        <p className="submit-message">{sumbitMessage}</p>
        <div className="form-buttons">
          <button
            type="button"
            onClick={() =>
              redirect(
                `/materials?${new URLSearchParams(searchParams).toString()}`
              )
            }
          >
            Go back
          </button>
          <SubmitButton title="Move Material" />
        </div>
      </form>

      {showConfirmation && (
        <div className="confirmation-window">
          <p>
            Are you sure you want to move this material to another location?
          </p>
          <p>
            The quantity after moving will be{" "}
            {material
              ? toUSFormat(
                  material.quantity - Number(formData?.get("quantity"))
                )
              : ""}
          </p>
          <button type="button" onClick={confirmAction}>
            Yes
          </button>
          <button type="button" onClick={cancelAction}>
            No
          </button>
        </div>
      )}
    </section>
  );
}

export function RemoveMaterialForm(props: { materialId: string }) {
  const socket = useSocket();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId"); // requested materials
  const requestedQty = searchParams.get("quantity"); // requested materials
  const [usageReasons, setUsageReasons] = useState<[]>([]);
  const [submitMessage, setSubmitMessage] = useState("");
  const [material, setMaterial] = useState<Material>();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  usePreventNumberInputScroll();

  useEffect(() => {
    const getMaterialInfo = async () => {
      const [material] = await fetchMaterials({ materialId: props.materialId });
      setMaterial(material);

      if (material.materialType.includes("CARDS")) {
        const reasons = await fetchMaterialUsageReasons();
        setUsageReasons(reasons);
      }
    };
    getMaterialInfo();
  }, []);

  async function onSubmitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFormData(formData);
    setShowConfirmation(true);
  }

  async function confirmAction() {
    try {
      setShowConfirmation(false);
      const materialId = Number(props.materialId);
      await removeMaterial(materialId, formData);

      // If the Request ID was provided, then update the Request Material
      if (requestId) {
        const quantity = Number(formData?.get("quantity"));

        // Check the removing quantity
        const [requestedMaterial] = await fetchRequestedMaterials({
          requestId,
        });
        if (requestedMaterial.quantity > quantity) {
          await updateRequestedMaterial(Number(requestId), {
            quantity,
            status: "pending",
            notes: "Delivered partially",
          });
        } else {
          await updateRequestedMaterial(Number(requestId), {
            quantity,
            status: "sent",
            notes: "Delivered in full",
          });
        }

        // Send WebSocket.
        socket?.send("requestedMaterialsRemoved");

        setSubmitMessage(
          "Material Removed. Redirecting to Requested Materials..."
        );
        setTimeout(() => {
          redirect("/requested-materials");
        }, 1000);
      } else {
        setSubmitMessage("Material Removed. Redirecting to Inventory...");
        setTimeout(() => {
          redirect(
            `/materials?${new URLSearchParams(searchParams).toString()}`
          );
        }, 1000);
      }
    } catch (error: any) {
      setSubmitMessage(error.message);
    }
  }

  function cancelAction() {
    setShowConfirmation(false);
    setFormData(null);
  }

  return (
    <section>
      <h2>Use a Material</h2>
      <form onSubmit={onSubmitForm}>
        <div className="form-info">
          <h3>The Material will be removed from the Location</h3>
          <div className="form-info-line">
            <label>Customer Program:</label>
            {material?.programName}
          </div>
          <div className="form-info-line">
            <label>Stock ID:</label>
            {material?.stockId}
          </div>
          <div className="form-info-line">
            <label>Description:</label>
            {material?.description}
          </div>
          <div className="form-info-line">
            <label>Warehouse:</label>
            {material?.warehouseName}
          </div>
          <div className="form-info-line">
            <label>Location:</label>
            {material?.locationName}
          </div>
          <div className="form-info-line">
            <label>Type:</label>
            {material?.materialType}
          </div>
          {material?.materialType === "CHIPS" && (
            <div className="form-info-line">
              <label>Serial # range:</label>
              {material?.serialNumberRange}
            </div>
          )}
          <div className="form-info-line">
            <label>Ownership:</label>
            {material?.owner}
          </div>
          <div className="form-info-line">
            <label>Allow for use:</label>
            {material?.isActiveProgram && material?.isActiveMaterial
              ? "Yes"
              : "No"}
          </div>
          <div className="form-info-line">
            <label>Notes:</label>
            {material?.notes}
          </div>
          <div className="form-info-line">
            <label>Current Qty:</label>
            {toUSFormat(material?.quantity || 0)}
          </div>
        </div>
        <div className="form-line">
          <label>Quantity to Use:</label>
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            defaultValue={requestedQty || ""}
            required
          />
        </div>
        {material?.materialType === "CHIPS" && (
          <div className="form-line">
            <label>Serial # range:</label>
            <input
              type="text"
              name="serialNumberRange"
              placeholder="Enter Serial # Range"
              required
            />
          </div>
        )}
        <div className="form-line">
          <label>Job Ticket #:</label>
          <input
            type="text"
            name="jobTicket"
            placeholder="Enter Job Ticket #"
            // required={VAULT_MATERIAL_TYPES.includes(material.materialType)}
            required={false}
          />
        </div>
        {material?.materialType.includes("CARDS") && (
          <div className="form-line">
            <label htmlFor="remakeReasons">Remake Reason:</label>
            <select name="remakeReasons" id="remakeReasons" defaultValue="">
              <option value="">-- Choose a reason if applicable --</option>
              {usageReasons.map((reason: any) => (
                <option key={reason.reasonId} value={reason.reasonId}>
                  {reason.code}: {reason.description}
                </option>
              ))}
            </select>
          </div>
        )}
        <p className="submit-message">{submitMessage}</p>
        <div className="form-buttons">
          <button
            type="button"
            onClick={() => {
              requestedQty
                ? redirect(`/requested-materials/${requestId}`)
                : redirect(
                    `/materials?${new URLSearchParams(searchParams).toString()}`
                  );
            }}
          >
            Go back
          </button>
          <SubmitButton title="Use Material" />
        </div>
      </form>

      {showConfirmation && (
        <div className="confirmation-window">
          <p>Are you sure you want to use this material?</p>
          <p>
            The quantity after using will be{" "}
            {material
              ? toUSFormat(
                  material.quantity - Number(formData?.get("quantity"))
                )
              : ""}
          </p>
          <button type="button" onClick={confirmAction}>
            Yes
          </button>
          <button type="button" onClick={cancelAction}>
            No
          </button>
        </div>
      )}
    </section>
  );
}

export function MaterialReplenishment() {
  const { data: session } = useSession();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [jobTicketInput, setJobTicketInput] = useState<string>("");
  const [isJobTicketFound, setIsJobTicketFound] = useState<boolean>(false);
  const [stockIdInput, setStockIdInput] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [locations, setLocations] = useState<object[]>([]);
  const [quantityInput, setQuantityInput] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");
  usePreventNumberInputScroll();

  // Job Ticket Search Debounce Handling
  const debouncedJobTicketSearch = useCallback(
    debounce((value: string) => {
      setJobTicketInput(value);
      if (value) {
        fetchTranscationsByJobTicket(value);
      } else {
        setIsJobTicketFound(false);
        setStockIdInput("");
        setSelectedLocation("");
        setLocations([]);
        setQuantityInput("");
      }
    }, DEBOUNCE_DELAY),
    []
  );

  // Stock ID Search Debounce Handling
  const debouncedStockIdSearch = useCallback(
    debounce((value: string) => {
      setStockIdInput(value);
      if (value && !isJobTicketFound) {
        fetchLocationsByStock(value);
      }
    }, DEBOUNCE_DELAY),
    [isJobTicketFound]
  );

  const mapMaterialsToLocations = (materials: any) => {
    return (
      materials
        // Display only items with a current location and owned by the Customer (not Tag)
        .filter((m: any) => m.locationName !== "None" && m.owner == "Customer")
        .map((m: any) => ({
          id: m.locationId,
          name: m.locationName,
          materialId: m.materialId,
          warehouseName: m.warehouseName,
        }))
    );
  };

  // Get a Transaction and its Materials info to populate Locations
  const fetchTranscationsByJobTicket = async (jobTicket: string) => {
    const transactions = await fetchMaterialTransactions({ jobTicket });

    if (transactions?.length > 0) {
      const tx = transactions[0];
      setStockIdInput(tx.stockId);
      setQuantityInput(Math.abs(tx.quantity).toString());
      setSelectedLocation(tx.locationName);

      const materials = await fetchMaterials({ stockId: tx.stockId });
      setLocations(mapMaterialsToLocations(materials));
      setIsJobTicketFound(true);
    } else {
      setIsJobTicketFound(false);
    }
  };

  // Get all Locations for the Stock ID
  const fetchLocationsByStock = async (stockId: string) => {
    const materials = await fetchMaterialsByStockID(
      stockId,
      session?.user.role
    );
    setLocations(mapMaterialsToLocations(materials));
  };

  // Form Confirmation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    setFormData(data);
    setShowConfirmation(true);
  };

  const confirmAction = async () => {
    setShowConfirmation(false);
    const material = {
      materialId: Number(formData?.get("location")),
      quantity: Number(formData?.get("qty")),
      jobTicket: String(formData?.get("jobTicket")) + " (replenished)",
    };

    const res: any = await updateMaterial(material);
    if (res?.error) {
      setSubmitMessage(res.error);
    } else {
      setSubmitMessage(res.message);

      // Reset the form
      setIsJobTicketFound(false);
      setJobTicketInput("");
      setStockIdInput("");
      setSelectedLocation("");
      setLocations([]);
      setQuantityInput("");
      formRef.current?.reset();
    }
  };

  const cancelAction = () => {
    setShowConfirmation(false);
  };

  return (
    <section>
      <h2>Material Replenishment</h2>
      <div className="section-description">
        <p>
          📦 Stock adjustments are permitted only for materials owned by the
          Customer. If materials are owned by Tag and need to be replenished, a
          new shipment should be initiated by the CSR.
        </p>
        <p>
          🎫 If a Job Ticket is provided and matches, details will auto-fill.
          Otherwise, enter the stock information manually.
        </p>
        <p>✏️ You can update the quantity and select a location.</p>
        <p>
          ⚠️ If no locations are found, the stock is either not stored or is
          owned by Tag.
        </p>
      </div>
      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="form-line">
          <label>Job Ticket #:</label>
          <input
            type="text"
            placeholder="Job Ticket #"
            name="jobTicket"
            required
            value={jobTicketInput}
            onChange={(e) => {
              setJobTicketInput(e.target.value);
              debouncedJobTicketSearch(e.target.value);
            }}
          />
        </div>
        <div className="form-line">
          <label>Stock ID:</label>
          <input
            type="text"
            placeholder="Stock ID"
            name="stockId"
            required
            value={stockIdInput}
            onChange={(e) => {
              if (!isJobTicketFound) {
                setStockIdInput(e.target.value);
                debouncedStockIdSearch(e.target.value);
              }
            }}
            disabled={isJobTicketFound}
          />
        </div>
        <div className="form-line">
          <label>Locations ({locations.length}):</label>
          <select
            name="location"
            required
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">Select Location</option>
            {locations.map((loc: any) => (
              <option key={loc.id} value={loc.materialId}>
                {loc.name} ({loc.warehouseName})
              </option>
            ))}
          </select>
        </div>
        <div className="form-line">
          <label>Quantity Received:</label>
          <input
            type="number"
            name="qty"
            placeholder={"Enter quantity"}
            required
            value={quantityInput}
            onChange={(e) => setQuantityInput(e.target.value)}
          />
        </div>
        <p className="submit-message">{submitMessage}</p>
        <div className="form-buttons">
          <SubmitButton title="Replenish Stock" />
        </div>
      </form>

      {showConfirmation && (
        <div className="confirmation-window">
          <p>Are you sure you want to replenish the stock?</p>
          <p>Job Ticket #: "{jobTicketInput}"</p>
          <p>Stock ID: "{stockIdInput}"</p>
          <p>
            Quantity to be added: {toUSFormat(Number(formData?.get("qty")))}
          </p>
          <button type="button" onClick={confirmAction}>
            Yes
          </button>
          <button type="button" onClick={cancelAction}>
            No
          </button>
        </div>
      )}
    </section>
  );
}
