"use client";

import { clients } from "@/lib/data/clients";
import { Badge } from "@/components/ui/badge";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ClientsPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-medium tracking-[-0.03em] mb-1">
          Clients
        </h2>
        <p className="text-sm text-text-tertiary">
          {clients.length} total clients &middot;{" "}
          {clients.filter((c) => c.activeProjects > 0).length} with active
          projects
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-md border border-[rgba(0,0,0,0.08)] p-6 hover:border-[rgba(0,0,0,0.15)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-medium tracking-[-0.02em] mb-1">
                  {client.name}
                </h3>
                <p className="text-xs text-text-tertiary">{client.industry}</p>
              </div>
              {client.activeProjects > 0 && (
                <Badge variant="blue">
                  {client.activeProjects} active
                </Badge>
              )}
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-tertiary">Engagement</span>
                <span className="text-text-secondary font-medium">
                  {client.engagement}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-tertiary">Total Spend</span>
                <span className="text-text-secondary font-medium">
                  {formatCurrency(client.totalSpend)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-tertiary">Client Since</span>
                <span className="text-text-secondary font-medium">
                  {client.since}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[rgba(0,0,0,0.06)]">
              <p className="text-sm font-medium text-black">
                {client.contactName}
              </p>
              <p className="text-xs text-text-tertiary">
                {client.contactRole}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
