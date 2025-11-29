import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/client';

// Initialize AI clients
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface PredictionInput {
  tenantId: string;
  diseaseId: string;
  adminUnitId?: string;
  historicalData: {
    date: string;
    cases: number;
    deaths: number;
  }[];
  contextData?: {
    population?: number;
    seasonality?: string;
    previousOutbreaks?: number;
  };
}

export interface PredictionOutput {
  predictedCases: number;
  confidenceLower: number;
  confidenceUpper: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  factors: {
    factor: string;
    impact: 'positive' | 'negative';
    weight: number;
  }[];
  explanation: string;
  recommendations: string[];
}

export interface AnalysisInput {
  query: string;
  data: Record<string, unknown>[];
  context?: string;
}

class AIService {
  private supabase = createClient();

  // Determine which AI provider to use
  private getProvider(): 'anthropic' | 'openai' | null {
    if (anthropic) return 'anthropic';
    if (openai) return 'openai';
    return null;
  }

  // Generate disease outbreak prediction
  async generatePrediction(input: PredictionInput): Promise<PredictionOutput> {
    const provider = this.getProvider();

    if (!provider) {
      // Return a fallback prediction based on simple trend analysis
      return this.generateFallbackPrediction(input);
    }

    const prompt = this.buildPredictionPrompt(input);

    try {
      let response: string;

      if (provider === 'anthropic' && anthropic) {
        const result = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          system: `You are an expert epidemiologist AI assistant specialized in disease outbreak prediction and surveillance.
Analyze the provided historical disease data and generate accurate predictions.
Always respond with valid JSON following the exact schema provided.
Base your analysis on epidemiological principles, seasonal patterns, and trend analysis.`,
        });

        response = result.content[0].type === 'text' ? result.content[0].text : '';
      } else if (provider === 'openai' && openai) {
        const result = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an expert epidemiologist AI assistant specialized in disease outbreak prediction and surveillance.
Analyze the provided historical disease data and generate accurate predictions.
Always respond with valid JSON following the exact schema provided.
Base your analysis on epidemiological principles, seasonal patterns, and trend analysis.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 2000,
          response_format: { type: 'json_object' },
        });

        response = result.choices[0]?.message?.content || '';
      } else {
        return this.generateFallbackPrediction(input);
      }

      // Parse the response
      const parsed = JSON.parse(response);
      return this.validatePredictionOutput(parsed);
    } catch (error) {
      console.error('AI prediction error:', error);
      return this.generateFallbackPrediction(input);
    }
  }

  // Build prediction prompt
  private buildPredictionPrompt(input: PredictionInput): string {
    const recentData = input.historicalData.slice(-14); // Last 14 days
    const totalCases = recentData.reduce((sum, d) => sum + d.cases, 0);
    const avgCases = totalCases / recentData.length;
    const trend = this.calculateTrend(recentData.map((d) => d.cases));

    return `
Analyze the following disease surveillance data and predict the expected number of cases for the next 7 days.

HISTORICAL DATA (last ${recentData.length} data points):
${JSON.stringify(recentData, null, 2)}

CONTEXT:
- Total recent cases: ${totalCases}
- Average daily cases: ${avgCases.toFixed(1)}
- Trend direction: ${trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable'}
- Trend magnitude: ${Math.abs(trend).toFixed(2)}
${input.contextData?.population ? `- Population: ${input.contextData.population}` : ''}
${input.contextData?.seasonality ? `- Seasonality: ${input.contextData.seasonality}` : ''}

Please provide your prediction in the following JSON format:
{
  "predictedCases": <number - predicted total cases for next 7 days>,
  "confidenceLower": <number - lower bound of 95% confidence interval>,
  "confidenceUpper": <number - upper bound of 95% confidence interval>,
  "riskLevel": "<low|medium|high|critical>",
  "riskScore": <number between 0 and 100>,
  "factors": [
    {
      "factor": "<string - name of factor>",
      "impact": "<positive|negative>",
      "weight": <number between 0 and 1>
    }
  ],
  "explanation": "<string - brief explanation of the prediction>",
  "recommendations": ["<string - actionable recommendation 1>", "<string - recommendation 2>"]
}
`;
  }

  // Calculate simple linear trend
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  // Fallback prediction when AI is not available
  private generateFallbackPrediction(input: PredictionInput): PredictionOutput {
    const recentData = input.historicalData.slice(-7);
    const avgCases = recentData.length > 0
      ? recentData.reduce((sum, d) => sum + d.cases, 0) / recentData.length
      : 0;
    const trend = this.calculateTrend(recentData.map((d) => d.cases));

    // Simple projection
    const projectedCases = Math.round(avgCases * 7 * (1 + trend * 0.1));
    const variance = avgCases * 0.3;

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let riskScore = 20;

    if (trend > 0.5) {
      riskLevel = 'critical';
      riskScore = 85;
    } else if (trend > 0.2) {
      riskLevel = 'high';
      riskScore = 65;
    } else if (trend > 0) {
      riskLevel = 'medium';
      riskScore = 45;
    }

    return {
      predictedCases: Math.max(0, projectedCases),
      confidenceLower: Math.max(0, Math.round(projectedCases - variance * 7)),
      confidenceUpper: Math.round(projectedCases + variance * 7),
      riskLevel,
      riskScore,
      factors: [
        { factor: 'Historical trend', impact: trend > 0 ? 'negative' : 'positive', weight: 0.4 },
        { factor: 'Recent case count', impact: avgCases > 10 ? 'negative' : 'positive', weight: 0.3 },
        { factor: 'Data availability', impact: recentData.length >= 7 ? 'positive' : 'negative', weight: 0.3 },
      ],
      explanation: `Based on ${recentData.length} days of historical data with an average of ${avgCases.toFixed(1)} cases per day and a ${trend > 0 ? 'rising' : trend < 0 ? 'declining' : 'stable'} trend.`,
      recommendations: [
        trend > 0 ? 'Increase surveillance in affected areas' : 'Maintain current monitoring levels',
        'Ensure adequate laboratory capacity for testing',
        'Review contact tracing protocols',
      ],
    };
  }

  // Validate prediction output
  private validatePredictionOutput(data: any): PredictionOutput {
    return {
      predictedCases: Number(data.predictedCases) || 0,
      confidenceLower: Number(data.confidenceLower) || 0,
      confidenceUpper: Number(data.confidenceUpper) || 0,
      riskLevel: ['low', 'medium', 'high', 'critical'].includes(data.riskLevel) ? data.riskLevel : 'medium',
      riskScore: Number(data.riskScore) || 50,
      factors: Array.isArray(data.factors) ? data.factors : [],
      explanation: String(data.explanation || ''),
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
    };
  }

  // Analyze data with natural language query
  async analyzeData(input: AnalysisInput): Promise<string> {
    const provider = this.getProvider();

    if (!provider) {
      return 'AI analysis is not available. Please configure ANTHROPIC_API_KEY or OPENAI_API_KEY.';
    }

    const prompt = `
${input.context || 'You are analyzing disease surveillance data.'}

DATA:
${JSON.stringify(input.data.slice(0, 100), null, 2)}

USER QUERY: ${input.query}

Please provide a detailed analysis answering the user's query based on the provided data.
Include specific numbers and insights where possible.
`;

    try {
      if (provider === 'anthropic' && anthropic) {
        const result = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        });

        return result.content[0].type === 'text' ? result.content[0].text : 'Unable to analyze data.';
      } else if (provider === 'openai' && openai) {
        const result = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1500,
        });

        return result.choices[0]?.message?.content || 'Unable to analyze data.';
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      return 'An error occurred during analysis. Please try again.';
    }

    return 'AI provider not available.';
  }

  // Generate and store predictions for all diseases
  async generateBatchPredictions(tenantId: string): Promise<void> {
    // Get diseases with cases in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: diseases } = await this.supabase
      .from('cases')
      .select('disease_id, disease:diseases(id, name)')
      .eq('tenant_id', tenantId)
      .gte('report_date', thirtyDaysAgo);

    // Get unique diseases
    const uniqueDiseases = [...new Set((diseases || []).map((d: any) => d.disease_id))];

    for (const diseaseId of uniqueDiseases) {
      // Get historical data
      const { data: historicalData } = await this.supabase
        .from('cases')
        .select('report_date')
        .eq('tenant_id', tenantId)
        .eq('disease_id', diseaseId)
        .gte('report_date', thirtyDaysAgo)
        .order('report_date', { ascending: true });

      // Aggregate by date
      const dateAggregated: Record<string, { cases: number; deaths: number }> = {};
      (historicalData || []).forEach((c: any) => {
        const date = c.report_date;
        if (!dateAggregated[date]) {
          dateAggregated[date] = { cases: 0, deaths: 0 };
        }
        dateAggregated[date].cases++;
      });

      const formattedData = Object.entries(dateAggregated).map(([date, data]) => ({
        date,
        cases: data.cases,
        deaths: data.deaths,
      }));

      if (formattedData.length < 3) continue;

      // Generate prediction
      const prediction = await this.generatePrediction({
        tenantId,
        diseaseId,
        historicalData: formattedData,
      });

      // Store prediction
      await this.supabase.from('predictions').insert({
        tenant_id: tenantId,
        disease_id: diseaseId,
        model_name: this.getProvider() || 'fallback',
        model_version: '1.0',
        prediction_date: new Date().toISOString().split('T')[0],
        prediction_horizon_days: 7,
        predicted_cases: prediction.predictedCases,
        confidence_lower: prediction.confidenceLower,
        confidence_upper: prediction.confidenceUpper,
        confidence_level: 0.95,
        risk_level: prediction.riskLevel,
        risk_score: prediction.riskScore,
        factors: prediction.factors,
      });
    }
  }

  // Check if AI is configured
  isConfigured(): boolean {
    return this.getProvider() !== null;
  }

  getProviderName(): string {
    return this.getProvider() || 'none';
  }
}

export const aiService = new AIService();
export default aiService;
