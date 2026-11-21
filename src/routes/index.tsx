import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/tailadmin/DashboardLayout";
import { EcommerceDashboard } from "@/components/tailadmin/EcommerceDashboard";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <DashboardLayout>
      <EcommerceDashboard />
    </DashboardLayout>
  );
}
