
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Pagination from "../components/ui/pagination";
import { Separator } from "../components/ui/separator";
import { Progress } from "../components/ui/progress";
import { DegreeProgram, StudentData } from "../types/university";
import { GraduationCap, MapPin, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { ZScoreChart } from "./ZScoreChart";
import { useState } from "react";

//  const[currentPage, setCurrentPage]= useState(1);
// const pageSize=5;


interface RecommendationResultsProps {
  studentData: StudentData | null;
  recommendations: DegreeProgram[];
  nearbyRecommendations: DegreeProgram[];
  isLoading: boolean;
}

export const RecommendationResults = ({ 
  studentData, 
  recommendations, 
  nearbyRecommendations, 
  isLoading 
}: RecommendationResultsProps) => {
  
  if (isLoading) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <CardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your profile and finding the best matches...</p>
        </CardContent>
      </Card>
    );
  }

  if (!studentData) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <CardContent className="text-center py-12">
          <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Ready to Find Your Perfect Degree?</h3>
          <p className="text-gray-500">
            Fill out the form on the left to get personalized university degree recommendations 
            based on your A/L results and preferences.
          </p>
        </CardContent>
      </Card>
    );
  }

  // const getScorePercentage = (studentScore: number, cutoff: number) => {
  //   const margin = studentScore - cutoff;
  //   return Math.min(100, (margin / 0.5) * 100 + 50);
  // };
 const getzscoreProgress = (value: number) => {
 const max=3;
 const percent =(value/max)*100;
 return Math.min(100, Math.max(0,percent))
  };
 const zscoreProgressBar =({studentScore , cutoff}:{studentScore: number;cutoff: number})=>{
   const studentPercent = getzscoreProgress(studentScore);
   const cutoffPercent =getzscoreProgress(cutoff);

    return (
    <div className="relative w-full h-2 bg-gray-200 rounded overflow-hidden mt-2">
      
      {/* Student's Z-score bar */}
      <div
        className="h-full bg-green-500"
        style={{ width: `${studentPercent}%` }}
      ></div>

      {/* Cutoff line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-red-500"
        style={{ left: `${cutoffPercent}%` }}
        title={`Cutoff: ${cutoff.toFixed(2)}`}
      ></div>

      {/* Z-score Label */}
      <div className="absolute right-0 text-xs text-gray-700 top-[-1.2rem]">
        Z-score: {studentScore.toFixed(2)}
      </div>
    </div>
  );
 }

 const sortedTop20 =recommendations
 .sort((a, b) => b.previousCutoff - a.previousCutoff)
      .slice(0, 20);

 const[currentPage, setCurrentPage] = useState(1);
 const pageSize =5;
 const paginatedRecommendations = sortedTop20
 .sort((a, b) => b.previousCutoff - a.previousCutoff)
 .slice((currentPage-1)*pageSize, currentPage*pageSize);

 const totalPages =Math.ceil(sortedTop20.length/pageSize);

  return (
    <div className="space-y-6">
      {/* Student Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Your Profile Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Subject Stream</p>
              <p className="font-semibold">{studentData.subjectStream}</p>
            </div>
            <div>
              <p className="text-gray-500">Z-Score</p>
              <p className="font-semibold text-blue-600">{studentData.zscore.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-gray-500">Preferred District</p>
              <p className="font-semibold">{studentData.district}</p>
            </div>
            <div>
              <p className="text-gray-500">Matches Found</p>
              <p className="font-semibold text-green-600">{recommendations.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      

      {/* Main Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Recommended Degrees ({recommendations.length})
          </CardTitle>
          <CardDescription>
            Top 20 Degree programs in {studentData.district} that match your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
  <div className="space-y-4">
    {paginatedRecommendations
      .map((program) => (
        <div key={program.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-800">{program.degreeName}</h4>
                      <p className="text-gray-600 text-sm">{program.university}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Eligible
                    </Badge>
                  </div>
                  
                  {/* <p className="text-gray-600 text-sm mb-3">{program.description}</p> */}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{program.district}</span>
                    </div>
                    {/* <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{program.duration} years</span>
                    </div> */}
                  </div>
                  
                 <div className="space-y-2">

  {zscoreProgressBar({
    studentScore: studentData.zscore,
    cutoff: program.previousCutoff,
  })}

  <div className="flex justify-between text-sm">
    <span>Previous Cutoff: {program.previousCutoff.toFixed(4)}</span>
    <span>Your Score: {studentData.zscore.toFixed(4)}</span>
  </div>
  <p className="text-xs text-gray-500">
    {studentData.zscore >= program.previousCutoff
      ? `You exceeded the cutoff by ${(studentData.zscore - program.previousCutoff).toFixed(4)} points`
      : `You missed the cutoff by ${(program.previousCutoff - studentData.zscore).toFixed(4)} points`}
  </p>
</div>

                </div>
              ))}
              <Pagination
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={(page) =>setCurrentPage(page)}
              />
            </div>
            
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-orange-400 mx-auto mb-3" />
              <p className="text-gray-600">No matching degrees found in your preferred district.</p>
              <p className="text-sm text-gray-500 mt-1">Check the nearby opportunities below.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nearby Recommendations */}
      {nearbyRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              Nearby Opportunities
            </CardTitle>
            <CardDescription>
              Consider these programs in nearby districts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nearbyRecommendations.map((program) => (
                <div key={program.id} className="border rounded-lg p-4 bg-orange-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{program.degreeName}</h4>
                      <p className="text-gray-600 text-sm">{program.university}</p>
                    </div>
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      Nearby
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{program.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📍 {program.district}</span>
                    <span>⏱️ {program.duration} years</span>
                    <span>📊 Cutoff: {program.previousCutoff.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Z-Score Comparison Chart */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Z-Score Comparison</CardTitle>
            <CardDescription>
              Your score vs. previous year cutoffs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ZScoreChart 
              recommendations={recommendations}
              studentScore={studentData.zscore}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
