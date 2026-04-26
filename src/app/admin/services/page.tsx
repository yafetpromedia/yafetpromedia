import AdminClient from "@/app/admin/AdminClient";
import { getAdminPageData } from "@/app/admin/data";

export default async function AdminServicesPage() {
  const data = await getAdminPageData("services");
  return (
    <AdminClient
      initialContent={data.content}
      initialLeads={data.leads}
      aiStatus={data.aiStatus}
      initialSection={data.initialSection}
    />
  );
}
