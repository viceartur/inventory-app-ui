"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { redirect, useSearchParams } from "next/navigation";

import {
  fetchMaterials,
  fetchRequestedMaterials,
  Material,
  RequestedInfo,
  RequestedMaterial,
  requestMaterial,
  updateRequestedMaterial,
} from "../../actions/materials";
import {
  formatUserName,
  toUSFormat,
  usePreventNumberInputScroll,
} from "utils/client_utils";
import { SubmitButton } from "ui/submit-button";
import { requestStatusClassName, REQUEST_STATUSES } from "utils/constants";
import { useSession } from "next-auth/react";
import { useSocket } from "context/socket-context";

export function RequestMaterials() {
  const socket = useSocket();
  const { data: session } = useSession();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [descriptionsMap, setDescriptionsMap] = useState<Map<string, string>>(
    new Map()
  );
  const [submitMessage, setSubmitMessage] = useState<string>("");
  usePreventNumberInputScroll();

  useEffect(() => {
    const getMaterialsData = async () => {
      const materials = await fetchMaterials({});
      const descriptionsMap = new Map<string, string>();
      materials
        .filter((material) =>
          material.warehouseName?.toLowerCase().includes("warehouse")
        )
        .forEach((material) => {
          if (!descriptionsMap.has(material.description)) {
            descriptionsMap.set(material.description, material.stockId);
          }
        });
      setDescriptionsMap(descriptionsMap);
    };
    getMaterialsData();
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const description = String(formData.get("description"));
    const stockId = descriptionsMap.get(description) || "";
    const quantity = Number(formData.get("qty"));

    const materialData: RequestedMaterial = {
      description,
      stockId,
      quantity,
    };

    const res: any = await requestMaterial(
      materialData,
      Number(session?.user.id)
    );
    if (res.error) {
      setSubmitMessage(res.error);
    } else {
      setSubmitMessage(res.message);
      formRef.current?.reset();
      socket?.send("requestedMaterialsUpdated");
    }
  };

  return (
    <section>
      <h2>Request Materials from the Warehouse</h2>
      <div className="section-description">
        <p>
          Production staff may request materials for delivery from the warehouse
          using the form below. Please select the desired material currently
          available in the warehouse and specify the required quantity.
        </p>
      </div>
      <form ref={formRef} onSubmit={onSubmit}>
        <div className="form-line">
          <label>Material:</label>
          <select name="description" id="description" required>
            <option value="">-- Choose an available material --</option>
            {Array.from(descriptionsMap.entries()).map(
              ([description, stockId]) => (
                <option key={stockId} value={description}>
                  {description} ({stockId})
                </option>
              )
            )}
          </select>
        </div>
        <div className="form-line">
          <label>Quantity:</label>
          <input
            type="number"
            name="qty"
            placeholder="Enter the quantity (required)"
            required
          />
        </div>
        <div className="form-line">
          <p>
            <small>
              <strong>⚠️ Note:</strong> Ensure the quantity entered reflects the
              number of individual pieces, not boxes.
            </small>
          </p>
        </div>
        <p className="submit-message">{submitMessage}</p>
        <div className="form-buttons">
          <SubmitButton title="Request Material" />
        </div>
      </form>
    </section>
  );
}

export function RequestedMaterials() {
  const socket = useSocket();
  const [requestedMaterials, setRequestedMaterials] = useState([]);

  const getRequestedMaterials = async () => {
    const materials = await fetchRequestedMaterials({ status: "pending" });
    setRequestedMaterials(materials);
  };

  // Get requested materials once the page rendered first time.
  useEffect(() => {
    getRequestedMaterials();
  }, []);

  // Listen for WebSocket events and update the materials state.
  useEffect(() => {
    if (!socket) return;
    const handleMessage = (event: MessageEvent) => {
      const response = JSON.parse(event.data);
      switch (response.type) {
        case "requestedMaterialsQty":
          getRequestedMaterials();
      }
    };
    socket.addEventListener("message", handleMessage);
    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  return (
    <section>
      <h2>Requested Materials:</h2>
      <div className="section-description">
        <p>
          Below is a list of materials requested by the Production team. You may
          choose to <strong>fulfill</strong> each request either fully or
          partially, or <strong>decline</strong> it by providing a reason.
          Please review all entries carefully before taking action.
        </p>
        <p>
          <small>
            ⚠️ Note: If a request is partially fulfilled, the remaining quantity
            will remain available for future processing.
          </small>
        </p>
      </div>
      {requestedMaterials.length ? (
        <div className="material_list">
          <div className="list_header">
            <p>Stock ID</p>
            <p>Description</p>
            <p>Requested By</p>
            <p>Quantity</p>
            <p>Action</p>
          </div>
          {requestedMaterials.map((material: any, i) => (
            <div className="material_list-item" key={i}>
              <p>
                <strong>{material.stockId}</strong>
              </p>
              <p>
                <small>{material.description}</small>
              </p>
              <p>
                {material.username
                  ? formatUserName(material.username)
                  : "Prod (HSA)"}
              </p>
              <p>
                <strong>{toUSFormat(material.quantity)}</strong>
              </p>
              <div className="buttons-box">
                <button
                  onClick={() =>
                    redirect(`/requested-materials/${material.requestId}`)
                  }
                >
                  📥
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>List is empty</p>
      )}
    </section>
  );
}

export function RequestedMaterialForm(props: { requestId: string }) {
  const socket = useSocket();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [declineReason, setDeclineReason] = useState<string>("");
  const [requestedMaterial, setRequestedMaterial] = useState<any>({});
  const [foundMaterials, setFoundMaterials] = useState<Material[]>([]);
  const [materialToUse, setMaterialToUse] = useState<any>({});

  const getRequestedMaterialInfo = async () => {
    const requestedMaterials = await fetchRequestedMaterials({
      status: "pending",
    });
    const requestedMaterial = requestedMaterials.find(
      (m: any) => m.requestId === Number(props.requestId)
    );

    if (requestedMaterial) {
      setRequestedMaterial(requestedMaterial);
      const materials = await fetchMaterials({
        stockId: requestedMaterial.stockId,
      });

      if (materials.length > 0) {
        setFoundMaterials(materials);
        setMaterialToUse(materials[0]);
      } else {
        setSubmitMessage("Material Not Found");
      }
    }
  };

  useEffect(() => {
    getRequestedMaterialInfo();
  }, []);

  const onLocationChange = (event: any) => {
    event.preventDefault();
    const locId = event.target.value;
    const materialToUse = foundMaterials.find(
      (m) => m.locationId === Number(locId)
    );
    setMaterialToUse(materialToUse);
  };

  const onSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowConfirmation(true);
  };

  const handleUseButton = () => {
    redirect(
      `/materials/remove-material/${materialToUse.materialId}?quantity=${
        requestedMaterial.quantity < materialToUse.quantity // check whether the destination location has enough quantity
          ? requestedMaterial.quantity // send the requested quantity
          : materialToUse.quantity // send the location quantity
      }&requestId=${requestedMaterial.requestId}`
    );
  };

  const confirmDeclineAction = async () => {
    setShowConfirmation(false);
    try {
      const requestedInfo: RequestedInfo = {
        notes: declineReason,
      };
      await updateRequestedMaterial(requestedMaterial.requestId, requestedInfo);

      // Send WebSocket.
      socket?.send("requestedMaterialsRemoved");

      setSubmitMessage(
        "Material Declined. Redirecting to Requested Materials..."
      );
      setTimeout(() => {
        redirect("/requested-materials");
      }, 2000);
    } catch (error: any) {
      setSubmitMessage(error.message);
    }
  };

  function cancelDeclineAction() {
    setShowConfirmation(false);
    setDeclineReason("");
  }

  return (
    <section>
      <button
        className="control-button"
        type="button"
        onClick={() => redirect("/requested-materials/")}
      >
        Go Back
      </button>
      <form onSubmit={onSubmitForm}>
        <div className="form-info">
          <h3>Requested Material:</h3>
          <div className="form-info-line">
            <label>Stock ID:</label>
            {requestedMaterial.stockId}
          </div>
          <div className="form-info-line">
            <label>Description:</label>
            {requestedMaterial.description}
          </div>
          <div className="form-info-line">
            <label>Requested By:</label>
            {requestedMaterial.username
              ? formatUserName(requestedMaterial.username)
              : "Prod (HSA)"}
          </div>
          <div className="form-info-line">
            <label>Requested Qty:</label>
            {requestedMaterial.quantity}
          </div>
          <div className="form-info-line">
            <label>Notes:</label>
            {requestedMaterial.notes}
          </div>
        </div>
        {!!foundMaterials.length && (
          <div className="form-line">
            <label>Location to Use:</label>
            <select name="locationId" required onChange={onLocationChange}>
              {foundMaterials.map((material: any, i: number) => (
                <option key={i} value={material.locationId}>
                  {material.locationName} {material.isPrimary && "(Primary)"}
                </option>
              ))}
            </select>
          </div>
        )}
        <p className="submit-message">{submitMessage}</p>
        <div className="form-buttons">
          {!!foundMaterials.length && (
            <button type="button" onClick={handleUseButton}>
              Go to Use
            </button>
          )}
          <SubmitButton title="Decline" />
        </div>
      </form>

      {showConfirmation && (
        <div className="confirmation-window">
          <p>Please Enter the Decline Reason</p>
          <input
            type="text"
            placeholder="Any reason here"
            required
            onChange={(e) => {
              setDeclineReason(e.target.value);
            }}
          />
          <div>
            <button type="button" onClick={confirmDeclineAction}>
              Confirm
            </button>
            <button type="button" onClick={cancelDeclineAction}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export function Requests() {
  const [searchParams, setSearchParams] = useState({
    stockId: "",
    status: "",
    requestedFrom: "",
    requestedTo: "",
  });

  const onChangeForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const stockId = formData.get("stockId")?.toString() || "";
    const status = formData.get("status")?.toString() || "";
    const requestedFrom = formData.get("requestedFrom")?.toString() || "";
    const requestedTo = formData.get("requestedTo")?.toString() || "";

    setSearchParams({
      stockId,
      status,
      requestedFrom,
      requestedTo,
    });
  };

  const handleRequestsHistory = () => {
    const { stockId, status, requestedFrom, requestedTo } = searchParams;
    const queryParams = new URLSearchParams({
      stockId,
      status,
      requestedFrom,
      requestedTo,
    });
    redirect(`/request-status/requests-history?${queryParams.toString()}`);
  };

  return (
    <section>
      <h2>Material Requests</h2>
      <form onChange={onChangeForm}>
        <div className="form-info">
          <p>
            Use the filter form below to view all material requests, check their
            current status, and compare the requested and delivered quantities.
          </p>
        </div>
        <div className="form-line">
          <label htmlFor="stockId">Stock ID:</label>
          <input
            type="text"
            id="stockId"
            name="stockId"
            placeholder="Enter a Stock ID (optional)"
            title="Enter at least 2 characters for partial search"
          />
        </div>
        <div className="form-line">
          <label>Status:</label>
          <select name="status">
            <option value="">-- Choose a status --</option>
            {REQUEST_STATUSES.map((status: any, i: number) => (
              <option key={i} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="form-line">
          <label>Requested From:</label>
          <input type="date" name="requestedFrom" />
        </div>
        <div className="form-line">
          <label>Requested To:</label>
          <input type="date" name="requestedTo" />
        </div>
        <div className="form-line">
          <small>
            ⚠️ Note: You can enter a full or partial Stock ID to filter
            requests.
          </small>
        </div>
        <div className="form-buttons">
          <button type="button" onClick={handleRequestsHistory}>
            Show requests
          </button>
        </div>
      </form>
    </section>
  );
}

export function RequestStatus() {
  const searchParams = useSearchParams();
  const stockId = searchParams.get("stockId");
  const status = searchParams.get("status");
  const requestedFrom = searchParams.get("requestedFrom");
  const requestedTo = searchParams.get("requestedTo");

  const [requestedMaterials, setRequestedMaterials] = useState([]);

  useEffect(() => {
    const getRequestedMaterials = async () => {
      const materials = await fetchRequestedMaterials({
        stockId,
        status,
        requestedFrom,
        requestedTo,
      });
      setRequestedMaterials(materials);
    };
    getRequestedMaterials();
  }, []);

  return (
    <section>
      <button
        className="control-button"
        onClick={() => redirect("/request-status")}
      >
        Back to Filter
      </button>
      <h2>Processed Materials Requests:</h2>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Stock ID</th>
            <th>Requested Qty</th>
            <th>Delivered Qty</th>
            <th>Request Status</th>
            <th>Status Note</th>
            <th>Last Updated</th>
            <th>Requested On</th>
          </tr>
        </thead>
        <tbody>
          {requestedMaterials.map((material: any, i) => (
            <tr key={i}>
              <td>
                <small>{material.description}</small>
              </td>
              <td>
                <strong>{material.stockId}</strong>
              </td>
              <td>{toUSFormat(material.qtyRequested)}</td>
              <td>{toUSFormat(material.qtyUsed)}</td>
              <td className={requestStatusClassName[material.status]}>
                {material.status}
              </td>
              <td>{material.notes}</td>
              <td>
                {new Date(material.updatedAt).toLocaleDateString("en-US")}
              </td>
              <td>
                {new Date(material.requestedAt).toLocaleDateString("en-US")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
