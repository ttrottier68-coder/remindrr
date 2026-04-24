import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClients, deleteInvoice, markInvoicePaid, syncInvoicesToServer, sendReminderNow, getInvoices } from "../lib/store";
import type { Invoice } from "../types";

interface Props {
  invoice: Invoice;
  onRefresh: () => void;
}

function getStatus(inv: Invoice) {
  const days = Math.ceil((new Date(inv.dueDate).getTime() - Date.now()) / 86400000);
  if (inv.status === "paid") return { label: "PAID", bg: "bg-green-100", text: "text-green-700" };
  if
