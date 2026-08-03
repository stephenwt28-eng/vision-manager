import SiteFooter from "@/components/site/layout/SiteFooter";
import SiteHeader from "@/components/site/layout/SiteHeader";

export default function SiteLayout({ children }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
