import AdminClient from "@/app/admin/AdminClient";
import { getAdminPageData } from "@/app/admin/data";

export default async function AdminProductsPage() {
  const data = await getAdminPageData("products");
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
