
import { DegreeProgram, StudentData, RecommendationResponse } from '../types/university';

const API_BASE_URL = 'http://localhost:3001/api';

export class ApiService {
  private static async fetchWithErrorHandling<T>(url: string): Promise<T> {
    try {
      console.log(`🌐 Making API request to: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }
      
      console.log(`✅ API response successful`);
      return data.data;
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  static async getAllDegreePrograms(): Promise<DegreeProgram[]> {
    console.log('📊 Fetching all degree programs from Google Sheets...');
    return this.fetchWithErrorHandling<DegreeProgram[]>(`${API_BASE_URL}/degree-programs`);
  }

  static async getRecommendations(studentData: StudentData): Promise<RecommendationResponse> {
    const params = new URLSearchParams({
      subjectStream: studentData.subjectStream,
      zscore: studentData.zscore.toString(),
      district: studentData.district
    });

    console.log('🎯 Fetching recommendations with params:', {
      subjectStream: studentData.subjectStream,
      zscore: studentData.zscore,
      district: studentData.district
    });

    return this.fetchWithErrorHandling<RecommendationResponse>(
      `${API_BASE_URL}/recommendations?${params}`
    );
  }

  static async checkHealth(): Promise<{ status: string; message: string }> {
    try {
      console.log('🏥 Checking backend health...');
      const response = await fetch(`${API_BASE_URL}/health`);
      const result = await response.json();
      console.log('✅ Backend health check:', result);
      return result;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw error;
    }
  }
}
