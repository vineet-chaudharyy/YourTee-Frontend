import { Hero } from "@/components/home/Hero";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { CustomizerPreview } from "@/components/home/CustomizerPreview";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Marquee } from "@/components/home/Marquee";
import { CollectionsShowcase } from "@/components/home/CollectionsShowcase";
import { SignaturePieces } from "@/components/home/SignaturePieces";
import { LazySection } from "@/components/ui/LazySection";

export default function HomePage() {
  return (
    <>
      {/* Above the fold — rendered immediately for fast LCP */}
      <Hero />

      {/* Below the fold — mounted on scroll to keep the main thread free */}
      <LazySection minHeight={180}>
        <FeatureStrip />
      </LazySection>
      <LazySection minHeight={640}>
        <CustomizerPreview />
      </LazySection>
      <LazySection minHeight={90}>
        <Marquee />
      </LazySection>
      <LazySection minHeight={720}>
        <FeaturedProducts />
      </LazySection>
      <LazySection minHeight={520}>
        <SignaturePieces />
      </LazySection>
      <LazySection minHeight={640}>
        <CollectionsShowcase />
      </LazySection>
    </>
  );
}
