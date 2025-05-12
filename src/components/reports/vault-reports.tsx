import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

import { fetchVaultReport } from "actions/reports";
import { toUSFormat } from "utils/client_utils";

export function VaultCurrent() {
  const [vaultReport, setVaultReport] = useState([]);

  useEffect(() => {
    const getVaultRep = async () => {
      const vaultReport = await fetchVaultReport();
      setVaultReport(vaultReport);
    };
    getVaultRep();
  }, []);

  const onClickDownload = () => {
    const columns = [
      { title: "Customer", dataKey: "customerName" },
      { title: "Material Type", dataKey: "materialType" },
      { title: "Stock ID", dataKey: "stockId" },
      { title: "Total in Outer Vault", dataKey: "outerVaultQty" },
      { title: "Total in Inner Vault", dataKey: "innerVaultQty" },
      { title: "Total", dataKey: "totalQty" },
    ];

    const data = vaultReport.map((vault: any) => ({
      customerName: vault.customerName,
      stockId: vault.stockId,
      materialType: vault.materialType,
      outerVaultQty: vault.outerVaultQty,
      innerVaultQty: vault.innerVaultQty,
      totalQty: vault.totalQty,
    }));

    const excelData = [
      columns.map((column) => column.title),
      ...data.map((item: any) => columns.map((column) => item[column.dataKey])),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vault Current");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `vault_current_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <section>
      <div>
        <button onClick={onClickDownload}>Download this Report</button>
      </div>
      <h2>Vault Materials Current</h2>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Material Type</th>
            <th>Stock ID</th>
            <th>Total in Outer Vault</th>
            <th>Total in Inner Vault</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {vaultReport.map((material: any, i) => (
            <tr key={i}>
              <td>{material.customerName}</td>
              <td>{material.materialType}</td>
              <td>{material.stockId}</td>
              <td className={material.outerVaultQty ? "" : "negative"}>
                {toUSFormat(material.outerVaultQty)}
              </td>
              <td className={material.innerVaultQty ? "" : "negative"}>
                {toUSFormat(material.innerVaultQty)}
              </td>
              <td>{toUSFormat(material.totalQty)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
