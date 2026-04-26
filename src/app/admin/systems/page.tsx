import AdminClient from "@/app/admin/AdminClient";
import { getAdminPageData } from "@/app/admin/data";

export default async function AdminSystemsPage() {
  const data = await getAdminPageData("systems");
  return (
    <AdminClient
      initialContent={data.content}
      initialLeads={data.leads}
      aiStatus={data.aiStatus}
      initialSection={data.initialSection}
    />
  );
}
