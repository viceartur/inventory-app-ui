'use server'
 
export async function createCustomer(prevState: any, formData: FormData) {
    const customer = {
        customerName: formData.get("customerName"),
        customerCode: formData.get("customerCode"),
    }
    
    const res = await fetch("http://localhost:5000/customers", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(customer),
          })
    
   if (res.status != 200) {
    return { message: res.statusText }
   }

   return { message: "Customer Added" }
}

export async function sendMaterial(prevState: any, formData: FormData) {
    const material = {
        customer: formData.get("customerName"),
        stockId: formData.get("stockId"),
        type: formData.get("materialType"),
        quantity: formData.get("qty"),
        cost: formData.get("cost"),
        minQuantity: formData.get("minQty"),
        maxQuantity: formData.get("maxQty"),
        description: formData.get("description"),
        owner: formData.get("owner"),
        isActive: formData.get("isActive"),
    }

    console.log(material)

    const res = await fetch("http://localhost:5000/csr_materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(material),
      })

    if (res.status != 200) {
    return { message: res.statusText }
    }

    return { message: "Material Sent" }
}