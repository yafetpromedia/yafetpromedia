import AdminClient from "@/app/admin/AdminClient";
import { getAdminPageData } from "@/app/admin/data";

export default async function AdminHeroPage() {
  const data = await getAdminPageData("hero");
  return (
    <AdminClient
      initialContent={data.content}
      initialLeads={data.leads}
      aiStatus={data.aiStatus}
      initialSection={data.initialSection}
    />
  );
}
