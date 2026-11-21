import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/tailadmin/DashboardLayout";
import { MenuTable } from "@/components/tailadmin/MenuTable";

export const Route = createFileRoute("/menu")({
  component: MenuPage,
  head: () => ({
    meta: [
      { title: "Menu — TailAdmin" },
      { name: "description", content: "Menu hierarchy management" },
    ],
  }),
});

function MenuPage() {
  return (
    <DashboardLayout>
      <MenuTable />
    </DashboardLayout>
  );
}