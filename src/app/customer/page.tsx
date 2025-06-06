import { AddCustomerForm, Customers } from "../../components/customers";

export default async function CustomerPage() {
  return (
    <>
      <AddCustomerForm />
      <Customers />
    </>
  );
}
