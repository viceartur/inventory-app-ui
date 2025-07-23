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
    path: "/customer-management",
    label: "Customer Management",
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
    path: "/request-materials",
    label: "Request Materials",
    icon: "📦",
    restrict: ["admin", "production"],
  },
  {
    path: "/requested-materials",
    label: "Requested Materials",
    icon: "📋",
    restrict: ["admin", "warehouse"],
  },
  {
    path: "/request-status",
    label: "Requests Look Up",
    icon: "🔍",
    restrict: ["admin", "warehouse", "production"],
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
    restrict: ["admin", "csr", "warehouse"],
  },
  {
    path: "/usage-reports",
    label: "Usage Reports",
    icon: "📈",
    restrict: ["admin", "csr", "warehouse", "vault", "production"],
  },
];

// States constants
export const OWNER_TYPES = ["Tag", "Customer"];

export const selectState = {
  id: "",
  name: "Loading...",
  code: "Loading...",
  warehouseName: "Loading...",
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

export const REQUEST_STATUSES: any = ["declined", "sent", "pending"];

export const VAULT_MATERIAL_TYPES = ["CARDS (METAL)", "CARDS (PVC)", "CHIPS"];
