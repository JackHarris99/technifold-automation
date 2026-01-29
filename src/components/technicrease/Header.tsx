import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-gray-900 text-white py-6 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/technicrease/technicrease-logo.png"
              alt="Technicrease Logo"
              width={220}
              height={65}
              className="h-14 w-auto"
            />
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <span className="text-sm text-gray-300 font-medium">World Leading Print Finishing Equipment</span>
            <div className="text-right text-sm border-l border-gray-700 pl-8">
              <div className="text-gray-300">jack.harris@technifold.com</div>
              <div className="font-semibold text-white">+44 (0)1455 554491</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}