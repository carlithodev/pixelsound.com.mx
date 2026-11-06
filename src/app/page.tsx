import { HomeAbout } from "@/components/sections/home-about";
import { HomeClients } from "@/components/sections/home-clients";
import { HomeEvents } from "@/components/sections/home-events";
import { HomeFaq } from "@/components/sections/home-faq";
import { HomeHero } from "@/components/sections/home-hero";
import { HomeIntro } from "@/components/sections/home-intro";
import { HomeServices } from "@/components/sections/home-services";
import { PixelField } from "@/components/sections/pixel-field";
import { SiteHeader } from "@/components/site-header";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="contenido">
        <HomeHero />
        <HomeIntro />
        <div className={styles.darkCanvas}>
          <PixelField />
          <HomeServices />
        </div>
        <HomeEvents />
        <HomeAbout />
        <HomeClients />
        <HomeFaq />
      </main>
    </>
  );
}
