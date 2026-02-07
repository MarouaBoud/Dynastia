/**
 * Insight Detector
 *
 * Analyzes spending patterns to generate coaching insights.
 * COACH-03: Month-over-month spending comparisons.
 */

export interface SpendingData {
  currentMonth: number;          // Total spending this month
  previousMonth: number;         // Total spending last month
  currentByCategory: Record<string, number>;
  previousByCategory: Record<string, number>;
}

export interface SpendingInsight {
  type: 'spending_spike' | 'spending_decrease' | 'category_spike' | 'on_track';
  severity: 'info' | 'attention' | 'concern';
  data: {
    changePercent: number;
    currentAmount: number;
    previousAmount: number;
    category?: string;
  };
  shouldCoach: boolean;
}

export class InsightDetector {
  // Thresholds for triggering insights
  private readonly SPIKE_THRESHOLD = 0.20;      // 20% increase triggers concern
  private readonly DECREASE_THRESHOLD = 0.15;   // 15% decrease is noteworthy
  private readonly CATEGORY_SPIKE = 0.50;       // 50% category increase

  detectSpendingInsights(spending: SpendingData): SpendingInsight[] {
    const insights: SpendingInsight[] = [];

    // Overall spending change
    const overallChange = this.calculateChange(
      spending.currentMonth,
      spending.previousMonth
    );

    if (overallChange > this.SPIKE_THRESHOLD) {
      insights.push({
        type: 'spending_spike',
        severity: overallChange > 0.4 ? 'concern' : 'attention',
        data: {
          changePercent: Math.round(overallChange * 100),
          currentAmount: spending.currentMonth,
          previousAmount: spending.previousMonth
        },
        shouldCoach: true
      });
    } else if (overallChange < -this.DECREASE_THRESHOLD) {
      insights.push({
        type: 'spending_decrease',
        severity: 'info',
        data: {
          changePercent: Math.round(Math.abs(overallChange) * 100),
          currentAmount: spending.currentMonth,
          previousAmount: spending.previousMonth
        },
        shouldCoach: true  // Celebrate this!
      });
    }

    // Category-level spikes
    for (const category of Object.keys(spending.currentByCategory)) {
      const current = spending.currentByCategory[category] || 0;
      const previous = spending.previousByCategory[category] || 0;
      const categoryChange = this.calculateChange(current, previous);

      if (categoryChange > this.CATEGORY_SPIKE && current > 100) {
        // Only flag if meaningful amount
        insights.push({
          type: 'category_spike',
          severity: 'attention',
          data: {
            changePercent: Math.round(categoryChange * 100),
            currentAmount: current,
            previousAmount: previous,
            category
          },
          shouldCoach: true
        });
      }
    }

    // If no issues, return "on track" insight
    if (insights.length === 0) {
      insights.push({
        type: 'on_track',
        severity: 'info',
        data: {
          changePercent: Math.round(overallChange * 100),
          currentAmount: spending.currentMonth,
          previousAmount: spending.previousMonth
        },
        shouldCoach: false
      });
    }

    return insights;
  }

  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 1 : 0;
    return (current - previous) / previous;
  }
}

export const insightDetector = new InsightDetector();
