import { Detector } from './detector';
import { FeaturesSection } from '@/components/features-section';
import { FAQSection } from '@/components/faq-section';

export default function Home() {
    return (
        <div className="space-y-24">
            <Detector />
            <FeaturesSection />
            <FAQSection />
        </div>
    );
}
