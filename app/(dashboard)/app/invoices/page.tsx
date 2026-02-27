"use client";

import { useState } from "react";
import { invoices, type InvoiceStatus } from "@/lib/data/invoices";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "All", filter: null },
  { label: "Outstanding", filter: "outstanding" as InvoiceStatus },
  { label: "Paid", filter: "paid" as InvoiceStatus },
  { label: "Overdue", filter: "overdue" as InvoiceStatus },
  { label: "Draft", filter: "draft" as InvoiceStatus },
];

const statusVariants: Record<InvoiceStatus, { variant: "success" | "warning" | "salmon" | "default"; label: string }> = {
  paid: { variant: "success", label: "Paid" },
  outstanding: { variant: "warning", label: "Outstanding" },
  overdue: { variant: "salmon", label: "Overdue" },
  draft: { variant: "default", label: "Draft" },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState<InvoiceStatus | null>(null);

  const filtered = activeTab
    ? invoices.filter((inv) => inv.status === activeTab)
    : invoices;

  const totalOutstanding = invoices
    .filter((inv) => inv.status === "outstanding" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium tracking-[-0.03em] mb-1">
            Invoices
          </h2>
          <p className="text-sm text-text-tertiary">
            {invoices.length} total &middot; {formatCurrency(totalOutstanding)}{" "}
            outstanding
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-md border border-[rgba(0,0,0,0.08)] p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.filter)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-sm transition-colors",
              activeTab === tab.filter
                ? "bg-smoke text-black"
                : "text-text-secondary hover:text-black"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-md border border-[rgba(0,0,0,0.08)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((invoice) => {
              const status = statusVariants[invoice.status];
              return (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-xs text-text-tertiary">
                    {invoice.id}
                  </TableCell>
                  <TableCell className="font-medium text-black">
                    {invoice.client}
                  </TableCell>
                  <TableCell>{invoice.project}</TableCell>
                  <TableCell className="font-medium text-black">
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>{invoice.issueDate}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
