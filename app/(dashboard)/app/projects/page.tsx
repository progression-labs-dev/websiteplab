"use client";

import { projects, type ProjectStatus } from "@/lib/data/projects";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusVariants: Record<ProjectStatus, { variant: "success" | "blue" | "warning" | "default"; label: string }> = {
  active: { variant: "blue", label: "Active" },
  completed: { variant: "success", label: "Completed" },
  "on-hold": { variant: "warning", label: "On Hold" },
  planning: { variant: "default", label: "Planning" },
};

export default function ProjectsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium tracking-[-0.03em] mb-1">
            Projects
          </h2>
          <p className="text-sm text-text-tertiary">
            {projects.length} total projects &middot;{" "}
            {projects.filter((p) => p.status === "active").length} active
          </p>
        </div>
      </div>

      <div className="bg-white rounded-md border border-[rgba(0,0,0,0.08)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Consultant</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const status = statusVariants[project.status];
              return (
                <TableRow key={project.id}>
                  <TableCell className="font-mono text-xs text-text-tertiary">
                    {project.id}
                  </TableCell>
                  <TableCell className="font-medium text-black">
                    {project.name}
                  </TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell>{project.type}</TableCell>
                  <TableCell>{project.consultant}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-orchid"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-tertiary">
                        {project.progress}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
