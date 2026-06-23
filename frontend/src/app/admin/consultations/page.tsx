import AdminClient from "@/app/admin/AdminClient";
import { getAdminPageData } from "@/app/admin/data";

export default async function AdminConsultationsPage() {
  const data = await getAdminPageData("consultations");
  return (
    <AdminClient
      initialContent={data.content}
      initialLeads={data.leads}
      initialTestimonialSubmissions={data.testimonialSubmissions}
      aiStatus={data.aiStatus}
      analytics={data.analytics}
      initialSection="consultations"
      viewerRole={data.viewerRole}
      viewerPermissions={data.viewerPermissions}
    />
  );
}
