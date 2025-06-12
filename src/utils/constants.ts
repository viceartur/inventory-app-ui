// URLs
export const API = `http://${process.env.NEXT_PUBLIC_SERVER_HOSTNAME}:${process.env.NEXT_PUBLIC_SERVER_PORT}`;
export const WS = `ws://${process.env.NEXT_PUBLIC_SERVER_HOSTNAME}:${process.env.NEXT_PUBLIC_SERVER_PORT}/ws`;

// Routes
export interface Route {
  path: string;
  label: string;
  restrict: string[];
  icon: string;
}

export const APP_ROUTES: Route[] = [
  {
    path: "/",
    label: "Main Page",
    icon: "🏠",
    restrict: ["admin", "csr", "warehouse", "production", "vault"],
  },
  {
    path: "/customer",
    label: "Customers",
    icon: "👥",
    restrict: ["admin", "csr"],
  },
  {
    path: "/warehouse",
    label: "Warehouses & Locations",
    icon: "🏢",
    restrict: ["admin", "warehouse", "vault"],
  },
  {
    path: "/order-needed",
    label: "Order Needed",
    icon: "📦",
    restrict: ["admin", "csr"],
  },
  {
    path: "/send-material",
    label: "Send Material",
    icon: "🚚",
    restrict: ["admin", "csr"],
  },
  {
    path: "/pending-materials",
    label: "Pending Materials",
    icon: "⏳",
    restrict: ["admin", "csr"],
  },
  {
    path: "/incoming-vault",
    label: "Incoming Vault",
    icon: "🗃️",
    restrict: ["admin", "vault"],
  },
  {
    path: "/incoming-materials",
    label: "Incoming Materials",
    icon: "📥",
    restrict: ["admin", "warehouse"],
  },
  {
    path: "/requested-materials",
    label: "Requested Materials",
    icon: "📝",
    restrict: ["admin", "warehouse"],
  },
  {
    path: "/processed-requests",
    label: "Processed Requests",
    icon: "✅",
    restrict: ["admin", "warehouse"],
  },
  {
    path: "/materials",
    label: "Inventory",
    icon: "📊",
    restrict: ["admin", "warehouse", "csr", "vault"],
  },
  {
    path: "/vault-current",
    label: "Vault Current",
    icon: "🗄️",
    restrict: ["admin", "vault"],
  },
  {
    path: "/material-replenishment",
    label: "Replenish Material",
    icon: "🔄",
    restrict: ["admin", "warehouse", "vault"],
  },
  {
    path: "/cash-reports",
    label: "Cash Reports",
    icon: "💰",
    restrict: ["admin", "csr"],
  },
  {
    path: "/usage-reports",
    label: "Usage Reports",
    icon: "📈",
    restrict: ["admin", "csr", "warehouse", "vault"],
  },
  {
    path: "/import_data",
    label: "Import Materials",
    icon: "📤",
    restrict: ["admin"],
  },
];

// States constants
export const OWNER_TYPES = ["Tag", "Customer"];

export const initialState = {
  message: "",
};

export const selectState = {
  id: "",
  name: "Loading...",
  code: "Loading...",
  warehouseName: "Loading...",
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
  isActiveCustomer: "Loading...",
  locationName: "Loading...",
  locationID: "Loading...",
  warehouseName: "Loading...",
  stockId: "stock123",
  cost: "Loading...",
  quantity: "Loading...",
  minQty: "Loading...",
  maxQty: "Loading...",
  description: "Loading...",
  notes: "Loading...",
  isActiveMaterial: "Loading...",
  materialType: "Loading...",
  owner: "Loading...",
  serialNumberRange: "Loading...",
};

export const reportsSearchParams = {
  customerId: "",
  customerName: "",
  owner: "",
  materialType: "",
  dateFrom: "",
  dateTo: "",
  dateAsOf: "",
};

export const requestStatusClassName: any = {
  declined: "negative",
  sent: "positive",
  pending: "neutral",
};

export const REQUEST_STATUSES: any = ["", "declined", "sent", "pending"];

export const VAULT_MATERIAL_TYPES = ["CARDS (METAL)", "CARDS (PVC)", "CHIPS"];
