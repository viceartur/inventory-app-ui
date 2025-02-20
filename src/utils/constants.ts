export const API = `http://${process.env.NEXT_PUBLIC_SERVER_HOSTNAME}:${process.env.NEXT_PUBLIC_SERVER_PORT}`;
export const WS = `ws://${process.env.NEXT_PUBLIC_SERVER_HOSTNAME}:${process.env.NEXT_PUBLIC_SERVER_PORT}/ws`;

export interface Route {
  path: string;
  label: string;
  restrict: string[];
}

export const APP_ROUTES: Route[] = [
  {
    path: "/",
    label: "Main Page",
    restrict: ["admin", "csr", "warehouse", "production"],
  },
  {
    path: "/customer",
    label: "Customers",
    restrict: ["admin", "csr"],
  },
  {
    path: "/warehouse",
    label: "Warehouses & Locations",
    restrict: ["admin", "warehouse"],
  },
  {
    path: "/send-material",
    label: "Send Material",
    restrict: ["admin", "csr"],
  },
  {
    path: "/pending-materials",
    label: "Pending Materials",
    restrict: ["admin", "csr"],
  },
  {
    path: "/incoming-materials",
    label: "Incoming Materials",
    restrict: ["admin", "warehouse"],
  },
  {
    path: "/requested-materials",
    label: "Requested Materials",
    restrict: ["admin", "warehouse"],
  },
  {
    path: "/processed-requests",
    label: "Processed Requests",
    restrict: ["admin", "warehouse"],
  },
  {
    path: "/materials",
    label: "Inventory",
    restrict: ["admin", "warehouse", "csr"],
  },
  {
    path: "/reports",
    label: "Reports",
    restrict: ["admin", "csr", "warehouse"],
  },
  {
    path: "/import_data",
    label: "Import Materials",
    restrict: ["admin"],
  },
];

export const ownerTypes = ["", "Tag", "Customer"];

export const initialState = {
  message: "",
};

export const selectState = {
  id: "",
  name: "Loading...",
  code: "Loading...",
};

export const incomingMaterialState = {
  shippingId: "Loading...",
  customerName: "Loading...",
  customerId: "Loading...",
  stockId: "Loading...",
  cost: "Loading...",
  quantity: "Loading...",
  minQty: "Loading...",
  maxQty: "Loading...",
  description: "Loading...",
  isActive: "Loading...",
  materialType: "Loading...",
  owner: "Loading...",
};

export const materialState = {
  materialID: "Loading...",
  customerName: "Loading...",
  customerID: "Loading...",
  locationName: "Loading...",
  locationID: "Loading...",
  stockId: "stock123",
  cost: "Loading...",
  quantity: "Loading...",
  minQty: "Loading...",
  maxQty: "Loading...",
  description: "Loading...",
  notes: "Loading...",
  isActive: "Loading...",
  materialType: "Loading...",
  owner: "Loading...",
  serialNumberRange: "Loading...",
};

export const searchParamsState = {
  customerId: "",
  customerName: "",
  owner: "",
  materialType: "",
  dateFrom: "",
  dateTo: "",
  dateAsOf: "",
};
