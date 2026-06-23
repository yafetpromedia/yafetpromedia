import AdminClient from "@/app/admin/AdminClient";
import { getAdminPageData } from "@/app/admin/data";

export default async function AdminEcosystemPage() {
  const data = await getAdminPageData("ecosystem");
  return (
    <AdminClient
      initialContent={data.content}
      initialLeads={data.leads}
      initialTestimonialSubmissions={data.testimonialSubmissions}
      aiStatus={data.aiStatus}
      analytics={data.analytics}
      initialSection={data.initialSection}
      viewerRole={data.viewerRole}
      viewerPermissions={data.viewerPermissions}
    />
  );
}
