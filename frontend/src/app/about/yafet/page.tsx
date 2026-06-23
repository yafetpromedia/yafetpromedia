import { readSiteContent } from "@backend/site-content";
import AboutYafetView from "@/sections/about/AboutYafetView";

export const metadata = {
  title: "About Yafet | YafetPromedia",
  description: "Founder story, mission, and vision for African software at YafetPromedia.",
};

export default async function AboutYafetPage() {
  const content = await readSiteContent();

  return (
    <AboutYafetView
      about={content.aboutYafet}
      siteLogoSrc={content.siteLogoSrc}
      ecosystemCards={content.ecosystemCards}
    />
  );
}
