import { Detector } from './detector';
import { FeaturesSection } from '@/components/features-section';
import { FAQSection } from '@/components/faq-section';
import { HomeFaqJsonLd } from '@/components/home-faq-jsonld';

export default function Home() {
    return (
        <div className="space-y-24">
            <HomeFaqJsonLd />
            <Detector />
            <FeaturesSection />
            <FAQSection />
        </div>
    );
}
