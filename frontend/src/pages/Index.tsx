
import { useState } from "react";
import { StudentForm } from "../components/StudentForm";
import { RecommendationResults } from "../components/RecommendationResults";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { DegreeProgram, StudentData } from "../types/university";
import { ApiService } from "../utils/apiService";
import { useToast } from "../hooks/use-toast";

const Index = () => {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [recommendations, setRecommendations] = useState<DegreeProgram[]>([]);
  const [nearbyRecommendations, setNearbyRecommendations] = useState<DegreeProgram[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStudentSubmit = async (data: StudentData) => {
    setIsLoading(true);
    setStudentData(data);
    
    console.log('🎓 Student Data Submitted:', data);
    
    try {
      console.log('📡 Fetching recommendations from Google Sheets...');
      
      // Fetch recommendations from the backend API (which fetches from Google Sheets)
      const results = await ApiService.getRecommendations(data);
      
      console.log('✅ Recommendations received from Google Sheets:', {
        mainRecommendations: results.recommendations.length,
        nearbyRecommendations: results.nearbyRecommendations.length,
        totalCount: results.totalCount
      });
      
      setRecommendations(results.recommendations);
      setNearbyRecommendations(results.nearbyRecommendations);
      
      toast({
        title: "Recommendations Generated",
        description: `Found ${results.recommendations.length} matching programs in ${data.district} and ${results.nearbyRecommendations.length} nearby programs from Google Sheets.`,
      });
      
    } catch (error) {
      console.error('❌ Error generating recommendations:', error);
      
      toast({
        title: "Connection Error",
        description: "Failed to fetch data from Google Sheets. Please ensure the backend server is running and Google Sheets credentials are configured.",
        variant: "destructive",
      });
      
      // Clear results on error
      setRecommendations([]);
      setNearbyRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            University Degree Finder
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the perfect university degree program based on your A/L results. 
            Get real-time recommendations directly from official university data.
          </p>
          {/* <div className="mt-4 text-sm text-green-600 bg-green-50 rounded-lg p-3 max-w-md mx-auto">
            ✅ Connected to Live Google Sheets Data
          </div> */}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <StudentForm onSubmit={handleStudentSubmit} isLoading={isLoading} />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <RecommendationResults 
              studentData={studentData}
              recommendations={recommendations}
              nearbyRecommendations={nearbyRecommendations}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
