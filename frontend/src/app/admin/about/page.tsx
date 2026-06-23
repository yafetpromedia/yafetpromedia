import AdminClient from "@/app/admin/AdminClient";
import { getAdminPageData } from "@/app/admin/data";

export default async function AdminAboutPage() {
  const data = await getAdminPageData("about");
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
