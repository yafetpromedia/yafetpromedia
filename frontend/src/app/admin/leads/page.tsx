import AdminClient from "@/app/admin/AdminClient";
import { getAdminPageData } from "@/app/admin/data";

export default async function AdminLeadsPage() {
  const data = await getAdminPageData("leads");
  return (
    <AdminClient
      initialContent={data.content}
      initialLeads={data.leads}
      initialTestimonialSubmissions={data.testimonialSubmissions}
      aiStatus={data.aiStatus}
      initialSection={data.initialSection}
    />
  );
}
