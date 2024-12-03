"use client"
import { SubmitButton } from "_components/submit-button"
import { createCustomer } from "../actions"
import { useActionState } from "react"

const initialState = {
    message: ''
}

export function CustomerFormComponent() {
    const [state, formAction] = useActionState(createCustomer, initialState)
    return (
        <>
        <h2>Add Customer</h2>
        <form action={formAction}>
                <input type="text" name="customerName" placeholder="Customer Name" required />
                <input type="text" name="customerCode" placeholder="Customer Code" required />
                <p>{state?.message}</p>
                <SubmitButton />
        </form>
        </>
        )
  }