import SiteFooter from "@/components/site/layout/SiteFooter";
import SiteHeader from "@/components/site/layout/SiteHeader";

export default function SiteLayout({ children }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main className="pt-[112px] sm:pt-[124px]">{children}</main>
      <SiteFooter />
    </div>
  );
}
