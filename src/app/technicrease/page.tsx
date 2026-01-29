import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import Header from '@/components/technicrease/Header'
import ProductShowcase from '@/components/technicrease/ProductShowcase'
import TransformSection from '@/components/technicrease/TransformSection'
import FinishingSettings from '@/components/technicrease/FinishingSettings'
import VideoShowcase from '@/components/technicrease/VideoShowcase'
import ProvenResults from '@/components/technicrease/ProvenResults'
import TechnologyAnalysis from '@/components/technicrease/TechnologyAnalysis'
import TechnicalCapabilities from '@/components/technicrease/TechnicalCapabilities'
import StrategicDecision from '@/components/technicrease/StrategicDecision'

export default function TechnicreasePage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <Header />
      <TransformSection />
      <ProductShowcase />
      <FinishingSettings />
      <VideoShowcase />
      <ProvenResults />
      <TechnologyAnalysis />
      <TechnicalCapabilities />
      <StrategicDecision />
      <MarketingFooter />
    </div>
  )
}