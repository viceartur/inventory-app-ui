"use client";

import { fetchMaterials } from "actions/materials";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toUSFormat } from "utils/client_utils";

export function OrderNeeded() {
  const { data: session } = useSession();
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    if (session?.user.role) {
      const getMaterials = async () => {
        const materials = (
          await fetchMaterials({
            userRole: session?.user.role,
          })
        ).filter((material: any) => material.isActiveCustomer);

        const mappedMaterials: any = {};

        // Combine materials with the same stockId
        materials.forEach((m: any) => {
          if (!mappedMaterials[m.stockId]) {
            mappedMaterials[m.stockId] = m;
          } else {
            mappedMaterials[m.stockId].quantity += m.quantity;
          }
        });

        // Display materials with the quantity needed
        // Sort by the customer name and the stock ID
        const materialsToOrder: any = Object.values(mappedMaterials)
          .filter((m: any) => m.quantity <= m.minQty)
          .sort((a: any, b: any) => {
            if (a.customerName !== b.customerName) {
              return a.customerName.localeCompare(b.customerName);
            }
            if (a.stockId !== b.stockId) {
              return a.stockId.localeCompare(b.stockId);
            }
          });

        setMaterials(materialsToOrder);
      };
      getMaterials();
    }
  }, [session]);

  return (
    <section>
      <h2>Order Needed Materials</h2>
      <div className="section-description">
        <p>
          The Dashboard displays the materials📦that need to be ordered🛒because
          they have reached their minimum quantity threshold⚖️
        </p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Stock ID</th>
            <th>Description</th>
            <th>Min Qty</th>
            <th>Current Qty</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material: any, i) => (
            <tr key={i}>
              <td>{material.customerName}</td>
              <td>{material.stockId}</td>
              <td>{material.description}</td>
              <td>{toUSFormat(material.minQty)}</td>
              <td className="negative">{toUSFormat(material.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
