import Header from '@/components/technicrease/Header'
import Navigation from '@/components/technicrease/Navigation'
import ProductShowcase from '@/components/technicrease/ProductShowcase'
import TransformSection from '@/components/technicrease/TransformSection'
import FinishingSettings from '@/components/technicrease/FinishingSettings'
import ProvenResults from '@/components/technicrease/ProvenResults'
import TechnologyAnalysis from '@/components/technicrease/TechnologyAnalysis'
import TechnicalCapabilities from '@/components/technicrease/TechnicalCapabilities'
import StrategicDecision from '@/components/technicrease/StrategicDecision'

export default function TechnicreasePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Navigation />
      <TransformSection />
      <ProductShowcase />
      <FinishingSettings />
      <ProvenResults />
      <TechnologyAnalysis />
      <TechnicalCapabilities />
      <StrategicDecision />
    </div>
  )
}