"use client"
import { SubmitButton } from "_components/submit-button"
import { sendMaterial } from "../actions"
import { useActionState, useEffect, useState } from "react"

const initialFormState = {
    message: ''
}

const selectState = {
    id: "", name: "Loading..."
}

export function SendMaterialFormComponent() {
    const [state, formAction] = useActionState(sendMaterial, initialFormState)
    const [selectCustomers, setSelectCustomers] = useState([selectState])
    const [selectMaterialTypes, setSelectMaterialTypes] = useState([selectState])

    useEffect(() => {
        async function fetchCustomers() {
            const res = await fetch("http://localhost:5000/customers")
            const data = await res.json()            
            if (!data?.length) setSelectCustomers([]);
    
            const customers = data.map((customer: any) =>({
                id: customer.ID,
                name: customer.Name,
            }))    
            setSelectCustomers(customers)
        }
        fetchCustomers()
    }, [selectCustomers])

    useEffect(() => {
        async function fetchMaterialTypes() {
            const res = await fetch("http://localhost:5000/material_types")
            const data = await res.json()            
            if (!data?.length) setSelectMaterialTypes([]);
    
            const types = data.map((type: any, i: number) =>({
                id: i,
                name: type,
            }))    
            setSelectMaterialTypes(types)
        }
        fetchMaterialTypes()
    }, [selectMaterialTypes])


    return (
        <>
        <h2>Send Material</h2>
        <form action={formAction}>
          <input type="text" name="stockId" placeholder="Stock ID" required />
          <input type="number" name="qty" placeholder="Quantity" required />
          <input type="number" name="cost" placeholder="Unit Cost (USD)" required />
          <select name="customerName" required>
            {selectCustomers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
          <select name="materialType" required>
            {selectMaterialTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          <input type="number" name="minQty" placeholder="Min Quantity" />
          <input type="number" name="maxQty" placeholder="Max Quantity" />
          <input type="text" name="description" placeholder="Description" />

          <label>
            <input type="checkbox" name="owner" />Tag Owned
          </label>
          <label>
            <input type="checkbox" name="isActive" />Allow for Use
          </label>

          <SubmitButton />
      </form>
        </>
        )
  }