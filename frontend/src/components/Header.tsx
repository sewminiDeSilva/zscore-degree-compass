
import { GraduationCap } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">EduFinder</h1>
              <p className="text-sm text-gray-600">University Degree Recommendations</p>
            </div>
          </div>
          
          {/* <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Universities
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              About
            </a>
          </nav> */}
        </div>
      </div>
    </header>
  );
};
