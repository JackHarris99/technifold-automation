export default function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center py-5">
          <ul className="flex space-x-10">
            <li>
              <a href="#transform" className="text-gray-800 hover:text-blue-900 font-medium text-sm uppercase tracking-wide transition-colors">
                Overview
              </a>
            </li>
            <li>
              <a href="#product-showcase" className="text-gray-800 hover:text-blue-900 font-medium text-sm uppercase tracking-wide transition-colors">
                Technology
              </a>
            </li>
            <li>
              <a href="#finishing-settings" className="text-gray-800 hover:text-blue-900 font-medium text-sm uppercase tracking-wide transition-colors">
                Settings
              </a>
            </li>
            <li>
              <a href="#proven-results" className="text-gray-800 hover:text-blue-900 font-medium text-sm uppercase tracking-wide transition-colors">
                Case Studies
              </a>
            </li>
            <li>
              <a href="#technology-analysis" className="text-gray-800 hover:text-blue-900 font-medium text-sm uppercase tracking-wide transition-colors">
                Analysis
              </a>
            </li>
            <li>
              <a href="#capabilities" className="text-gray-800 hover:text-blue-900 font-medium text-sm uppercase tracking-wide transition-colors">
                Integration
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}