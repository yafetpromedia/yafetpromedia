import AdminClient from "@/app/admin/AdminClient";
import { getAdminPageData } from "@/app/admin/data";

export default async function AdminPage() {
  const data = await getAdminPageData("overview");
  return (
    <AdminClient
      initialContent={data.content}
      initialLeads={data.leads}
      aiStatus={data.aiStatus}
      initialSection={data.initialSection}
    />
  );
}
