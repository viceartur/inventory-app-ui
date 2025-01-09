export const API = `http://${process.env.NEXT_PUBLIC_SERVER_HOSTNAME}:${process.env.NEXT_PUBLIC_SERVER_PORT}`;

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
