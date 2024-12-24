import { CustomerForm, Customers } from "../../components/customers";

export default async function CustomerPage() {
  return (
    <>
      <CustomerForm />
      <Customers />
    </>
  );
}
