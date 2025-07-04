
export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">EduFinder</h3>
            <p className="text-gray-300">
              Helping Sri Lankan A/L students find their perfect university degree program 
              based on their academic performance and preferences.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Find Degrees</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Universities</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Z-Score Calculator</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Career Guidance</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 EduFinder. All rights reserved. Built for A/L students in Sri Lanka.</p>
        </div>
      </div>
    </footer>
  );
};
