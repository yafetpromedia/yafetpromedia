"use client";

import { Dispatch, SetStateAction } from "react";
import {
  AIStatus,
  AdminSection,
  DashboardAnalytics,
  Lead,
  TestimonialSubmission,
} from "@/app/admin/types";
import { SiteContent } from "@/lib/site-content.shared";
import AdminAboutSection from "@/app/admin/components/AdminAboutSection";
import AdminAIProviderSection from "@/app/admin/components/AdminAIProviderSection";
import AdminEcosystemSection from "@/app/admin/components/AdminEcosystemSection";
import AdminCaseStudiesSection from "@/app/admin/components/AdminCaseStudiesSection";
import AdminConsultationsSection from "@/app/admin/components/AdminConsultationsSection";
import AdminContactSection from "@/app/admin/components/AdminContactSection";
import AdminExploreArchitectureEditor from "@/app/admin/components/AdminExploreArchitectureEditor";
import AdminHeroSection from "@/app/admin/components/AdminHeroSection";
import AdminMessagesSection from "@/app/admin/components/AdminMessagesSection";
import AdminOverviewDashboard from "@/app/admin/components/AdminOverviewDashboard";
import AdminProcessFaqSection from "@/app/admin/components/AdminProcessFaqSection";
import AdminProductsSection from "@/app/admin/components/AdminProductsSection";
import AdminPublicationsSection from "@/app/admin/components/AdminPublicationsSection";
import AdminSecuritySection from "@/app/admin/components/AdminSecuritySection";
import AdminServicesSection from "@/app/admin/components/AdminServicesSection";
import AdminSystemsSection from "@/app/admin/components/AdminSystemsSection";
import AdminTeamSection from "@/app/admin/components/AdminTeamSection";
import AdminTestimonialsSection from "@/app/admin/components/AdminTestimonialsSection";
import AdminTrustSection from "@/app/admin/components/AdminTrustSection";

export default function AdminSectionContent({
  activeSection,
  draft,
  setDraft,
  initialLeads,
  initialTestimonialSubmissions,
  analytics,
  aiStatus,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  passwordStatus,
  isChangingPassword,
  onUpdatePassword,
}: {
  activeSection: AdminSection;
  draft: SiteContent;
  setDraft: Dispatch<SetStateAction<SiteContent>>;
  initialLeads: Lead[];
  initialTestimonialSubmissions: TestimonialSubmission[];
  analytics: DashboardAnalytics;
  aiStatus: AIStatus;
  currentPassword: string;
  setCurrentPassword: Dispatch<SetStateAction<string>>;
  newPassword: string;
  setNewPassword: Dispatch<SetStateAction<string>>;
  passwordStatus: string;
  isChangingPassword: boolean;
  onUpdatePassword: () => void;
}) {
  if (activeSection === "overview") {
    return (
      <AdminOverviewDashboard
        analytics={analytics}
        aiStatus={aiStatus}
        assistantName={draft.aiName}
      />
    );
  }

  if (activeSection === "hero") {
    return <AdminHeroSection draft={draft} setDraft={setDraft} />;
  }

  if (activeSection === "ecosystem") {
    return <AdminEcosystemSection draft={draft} setDraft={setDraft} />;
  }

  if (activeSection === "systems") {
    return <AdminSystemsSection draft={draft} setDraft={setDraft} />;
  }

  if (activeSection === "explore") {
    return <AdminExploreArchitectureEditor draft={draft} setDraft={setDraft} />;
  }

  if (activeSection === "services") {
    return <AdminServicesSection draft={draft} setDraft={setDraft} />;
  }

  if (activeSection === "products") {
    return <AdminProductsSection draft={draft} setDraft={setDraft} />;
  }

  if (activeSection === "caseStudies") {
    return <AdminCaseStudiesSection draft={draft} setDraft={setDraft} />;
  }

  if (activeSection === "publications") {
    return <AdminPublicationsSection draft={draft} setDraft={setDraft} />;
  }

  if (activeSection === "about") {
    return <AdminAboutSection draft={draft} setDraft={setDraft} />;
  }

  if (activeSection === "testimonials") {
    return <AdminTestimonialsSection initialTestimonialSubmissions={initialTestimonialSubmissions} />;
  }

  if (activeSection === "trust") {
    return <AdminTrustSection draft={draft} setDraft={setDraft} />;
  }

  if (activeSection === "processFaq") {
    return <AdminProcessFaqSection draft={draft} setDraft={setDraft} />;
  }

  if (activeSection === "contact") {
    return <AdminContactSection draft={draft} setDraft={setDraft} />;
  }

  if (activeSection === "team") {
    return <AdminTeamSection />;
  }

  if (activeSection === "leads") {
    return <AdminMessagesSection initialLeads={initialLeads} />;
  }

  if (activeSection === "consultations") {
    return <AdminConsultationsSection />;
  }

  if (activeSection === "security") {
    return (
      <AdminSecuritySection
        draft={draft}
        setDraft={setDraft}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        passwordStatus={passwordStatus}
        isChangingPassword={isChangingPassword}
        onUpdatePassword={onUpdatePassword}
      />
    );
  }

  if (activeSection === "ai") {
    return <AdminAIProviderSection aiStatus={aiStatus} assistantName={draft.aiName} />;
  }

  return null;
}
