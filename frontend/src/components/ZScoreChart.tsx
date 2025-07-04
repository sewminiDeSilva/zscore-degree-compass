
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DegreeProgram } from '../types/university';

interface ZScoreChartProps {
  recommendations: DegreeProgram[];
  studentScore: number;
}

export const ZScoreChart = ({ recommendations, studentScore }: ZScoreChartProps) => {
  const chartData = recommendations.map((program, index) => ({
    name: `Degree ${index + 1}`,
    fullName: program.degreeName,
    cutoff: program.previousCutoff,
    yourScore: studentScore,
    margin: studentScore - program.previousCutoff,
    university: program.university
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.fullName}</p>
          <p className="text-sm text-gray-600">{data.university}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="text-blue-600">Your Score:</span> {data.yourScore.toFixed(2)}
            </p>
            <p className="text-sm">
              <span className="text-orange-600">Cutoff:</span> {data.cutoff.toFixed(2)}
            </p>
            <p className="text-sm">
              <span className="text-green-600">Margin:</span> +{data.margin.toFixed(2)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
          />
          <YAxis 
            label={{ value: 'Z-Score', angle: -90, position: 'insideLeft' }}
            domain={[0, 3]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine 
            y={studentScore} 
            stroke="#2563eb" 
            strokeDasharray="5 5" 
            label={{ value: "Your Score", position: "top" }}
          />
          <Bar 
            dataKey="cutoff" 
            fill="#f97316" 
            name="Previous Cutoff"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
