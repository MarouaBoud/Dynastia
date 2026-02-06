/**
 * Contribution Grid
 *
 * GitHub-style contribution visualization for habit tracking.
 * Shows 90 days of check-in history with purple intensity gradient.
 * Uses neutral colors (no red/shame for missed days).
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { format, subDays, startOfDay, isSameDay, getDay } from 'date-fns';
import { useColors } from '../../theme';

interface GridDataPoint {
  date: string; // YYYY-MM-DD
  count: number; // 0 or 1
}

interface ContributionGridProps {
  data: GridDataPoint[];
  days?: number;
}

// Calculate grid dimensions
const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_SIZE = 12;
const CELL_GAP = 3;
const WEEKS_TO_SHOW = 13; // ~90 days = 13 weeks

interface GridCell {
  date: Date | null;
  dateStr?: string;
  count: number;
  isToday: boolean;
}

export function ContributionGrid({ data, days = 90 }: ContributionGridProps) {
  const colors = useColors();

  // Build grid data structure
  const gridWeeks = useMemo(() => {
    const today = startOfDay(new Date());
    const dataMap = new Map(data.map(d => [d.date, d.count]));

    // Create array of dates for the last N days
    const dates: Date[] = [];
    for (let i = days - 1; i >= 0; i--) {
      dates.push(subDays(today, i));
    }

    // Group dates into weeks (Sunday = start of week)
    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    // Pad first week with nulls if it doesn't start on Sunday
    const firstDayOfWeek = getDay(dates[0]);
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    for (const date of dates) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(date);
    }

    // Pad last week with nulls if needed
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);

    return weeks.map(week =>
      week.map((date): GridCell => {
        if (!date) return { date: null, count: 0, isToday: false };
        const dateStr = format(date, 'yyyy-MM-dd');
        return {
          date,
          dateStr,
          count: dataMap.get(dateStr) || 0,
          isToday: isSameDay(date, today),
        };
      })
    );
  }, [data, days]);

  // Get cell color based on count
  const getCellColor = (count: number, isToday: boolean) => {
    if (count === 0) {
      return isToday ? colors.border : colors.backgroundSecondary;
    }
    // Purple gradient for completed days
    return colors.primary;
  };

  // Day labels (S M T W T F S)
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={styles.container}>
      {/* Day labels column */}
      <View style={styles.dayLabels}>
        {dayLabels.map((label, i) => (
          <Text
            key={i}
            style={[
              styles.dayLabel,
              { color: colors.textSecondary, height: CELL_SIZE, marginBottom: CELL_GAP },
            ]}
          >
            {i % 2 === 0 ? label : ''}
          </Text>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {gridWeeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {week.map((day, dayIndex) => (
              <View
                key={dayIndex}
                style={[
                  styles.cell,
                  {
                    backgroundColor: day.date
                      ? getCellColor(day.count, day.isToday)
                      : 'transparent',
                    borderWidth: day.isToday ? 1 : 0,
                    borderColor: colors.primary,
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

// Legend component
export function ContributionLegend() {
  const colors = useColors();

  return (
    <View style={styles.legend}>
      <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Less</Text>
      <View style={[styles.legendCell, { backgroundColor: colors.backgroundSecondary }]} />
      <View style={[styles.legendCell, { backgroundColor: colors.primaryLight }]} />
      <View style={[styles.legendCell, { backgroundColor: colors.primary }]} />
      <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>More</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  dayLabels: {
    marginRight: 4,
  },
  dayLabel: {
    fontSize: 10,
    textAlign: 'center',
    width: 14,
    lineHeight: CELL_SIZE,
  },
  grid: {
    flexDirection: 'row',
  },
  week: {
    flexDirection: 'column',
    marginRight: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
    marginBottom: CELL_GAP,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
  },
  legendLabel: {
    fontSize: 11,
  },
  legendCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
  },
});

export default ContributionGrid;
