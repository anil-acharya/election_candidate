
import React from 'react';
import { Home, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
  onLogout?: () => void;
  onGoHome?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, isAdmin, onLogout, onGoHome }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onGoHome}>
            <div>
                <h1 className="text-xl md:text-2xl font-bold leading-tight">नेपाल निर्वाचन जानकारी</h1>
                <p className="text-xs text-blue-100 hidden md:block">स्वच्छ, निष्पक्ष र तटस्थ जानकारी</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-4">
            <button 
                onClick={onGoHome}
                className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded-md transition"
            >
              <Home size={20} />
              <span className="hidden sm:inline">गृहपृष्ठ</span>
            </button>
            
            {isAdmin && (
                <button 
                    onClick={onLogout}
                    className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md font-medium transition"
                >
                    <LogOut size={20} />
                    <span>लगआउट</span>
                </button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-blue-900">कानुनी अस्वीकरण</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                यस वेबसाइटमा प्रस्तुत गरिएको जानकारी सार्वजनिक स्रोतहरू र प्रयोगकर्ताद्वारा प्रविष्ट गरिएको विवरणमा आधारित छ। यसले कुनै पनि राजनीतिक दल वा उम्मेदवारको समर्थन गर्दैन। यो पूर्णतया शैक्षिक र सूचनामूलक उद्देश्यको लागि तयार गरिएको हो।
              </p>
            </div>
            <div className="md:text-right">
              <h3 className="text-lg font-bold mb-4 text-blue-900">सम्पर्क</h3>
              <p className="text-gray-600 text-sm">
                निर्वाचन उम्मेदवार जानकारी प्रणाली २०२४<br />
                काठमाडौं, नेपाल
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 text-center text-gray-500 text-xs">
            &copy; २०२४ नेपाल निर्वाचन उम्मेदवार जानकारी प्रणाली। सबै अधिकार सुरक्षित।
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
