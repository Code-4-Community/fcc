import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@components/ui/chart';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';
import { YearMonthPickerPanel, type YearMonthValue } from './YearMonthPicker';
import apiClient from '@api/apiClient';

const chartConfig = {
  donations: {
    label: 'Total Donations',
    color: 'rgba(42, 157, 144, 0.7)',
  },
  recurring_donations: {
    label: 'Recurring Donations',
    color: 'rgb(215, 209, 117)',
  },
} satisfies ChartConfig;

type DataType = 'donations' | 'recurring_donations';
type TimeframeType = 'year-to-date' | 'custom';

// Helper function to calculate date range
function getStartDate(
  timeframeType: TimeframeType,
  customPeriod?: YearMonthValue,
): Date {
  const now = new Date();

  if (timeframeType === 'year-to-date') {
    // Start from Jan 1 of current year
    return new Date(now.getFullYear(), 0, 1);
  }

  // Custom period
  if (!customPeriod) {
    // If no custom period yet, use today
    return now;
  }

  if (customPeriod.month === null) {
    // Year only - start from Jan 1 of that year
    return new Date(customPeriod.year, 0, 1);
  }

  // Year and month - start from 1st of that month (1-indexed)
  return new Date(customPeriod.year, customPeriod.month - 1, 1);
}

// Helper function to calculate end date
function getEndDate(
  timeframeType: TimeframeType,
  customPeriod?: YearMonthValue,
): Date {
  const now = new Date();

  if (timeframeType === 'year-to-date') {
    // End is today
    return now;
  }

  // Custom period
  if (!customPeriod) {
    // If no custom period yet, use today
    return now;
  }

  if (customPeriod.month === null) {
    // Year only - end at Jan 1 of next year
    return new Date(customPeriod.year + 1, 0, 1);
  }

  // Year and month - end at 1st of next month
  return new Date(customPeriod.year, customPeriod.month, 1);
}

// Helper function to format date as YYYY-MM-DD in local time
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse backend timestamps as UTC when no timezone is provided.
function parseBackendDate(value: string): Date {
  const hasTimezone = /Z|[+-]\d{2}:?\d{2}$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

// Parse YYYY-MM-DD date keys into local Date objects.
function parseDateKey(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

// Process donations data into time-series
function processDonationsData(
  donations: Array<{ amount: number; createdAt: string; status: string }>,
): Array<{ date: string; value: number }> {
  const dataMap = new Map<string, number>();

  donations.forEach((donation) => {
    const donationDate = parseBackendDate(donation.createdAt);
    const dateKey = formatDate(donationDate);
    dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + donation.amount);
  });

  return Array.from(dataMap.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Process recurring donations data (recurring donations only)
function processRecurringDonationsData(
  donations: Array<{
    amount: number;
    createdAt: string;
    donationType: string;
    status: string;
  }>,
): Array<{ date: string; value: number }> {
  const dataMap = new Map<string, number>();

  donations.forEach((donation) => {
    if (donation.donationType === 'recurring') {
      const donationDate = parseBackendDate(donation.createdAt);
      const dateKey = formatDate(donationDate);
      dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + donation.amount);
    }
  });

  return Array.from(dataMap.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function DonorStatsChart({ className }: { className?: string }) {
  const [activeChart, setActiveChart] = React.useState<DataType>('donations');
  const [timeframeType, setTimeframeType] =
    React.useState<TimeframeType>('year-to-date');
  const [customPeriod, setCustomPeriod] = React.useState<YearMonthValue>();
  const [chartData, setChartData] = React.useState<
    Array<{ date: string; value: number }>
  >([]);
  const [donationsData, setDonationsData] = React.useState<
    Array<{ date: string; value: number }>
  >([]);
  const [recurringDonationsData, setRecurringDonationsData] = React.useState<
    Array<{ date: string; value: number }>
  >([]);
  const [error, setError] = React.useState<string | null>(null);
  const [customPickerOpen, setCustomPickerOpen] = React.useState(false);

  // Fetch data whenever timeframeType or customPeriod changes
  React.useEffect(() => {
    const fetchData = async () => {
      setError(null);
      try {
        const startDate = getStartDate(timeframeType, customPeriod);
        const endDate = getEndDate(timeframeType, customPeriod);

        // Format dates as YYYY-MM-DD for API
        const startDateStr = formatDate(startDate);
        const endDateStr = formatDate(endDate);

        // Fetch donations with date range filter
        const response = await apiClient.getDonations({
          perPage: 10000,
          status: 'succeeded',
          startDate: startDateStr,
          endDate: endDateStr,
        });

        const donationsProcessed = processDonationsData(response.rows);
        const recurringDonationsProcessed = processRecurringDonationsData(
          response.rows,
        );

        setDonationsData(donationsProcessed);
        setRecurringDonationsData(recurringDonationsProcessed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setChartData([]);
      }
    };

    fetchData();
  }, [timeframeType, customPeriod]);

  // Update chart data when activeChart changes
  React.useEffect(() => {
    if (activeChart === 'donations') {
      setChartData(donationsData);
    } else {
      setChartData(recurringDonationsData);
    }
  }, [activeChart, donationsData, recurringDonationsData]);

  return (
    <Card
      className={`flex h-full flex-col rounded-[10px] border border-[#E5E5E5] bg-white shadow-none ${className}`}
    >
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col justify-center gap-1 px-8 pb-4 sm:pb-0 my-2">
          <CardTitle className="text-3xl font-semibold">
            Donation Overview
          </CardTitle>
          <CardDescription className="text-lg text-neutral-500">
            Showing total and recurring donations.
          </CardDescription>
        </div>
        <Popover open={customPickerOpen} onOpenChange={setCustomPickerOpen}>
          <div className="px-8">
            <div className="inline-flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                data-active={timeframeType === 'year-to-date'}
                className="data-[active=true]:bg-gray-200 data-[active=false]:hover:bg-muted/50 px-5 py-2.5 text-lg font-medium transition-colors border-r border-gray-300"
                onClick={() => setTimeframeType('year-to-date')}
              >
                Year-to-date
              </button>
              <PopoverTrigger asChild>
                <button
                  data-active={customPickerOpen || timeframeType === 'custom'}
                  className="data-[active=true]:bg-gray-200 data-[active=false]:hover:bg-muted/50 px-5 py-2.5 text-lg font-medium transition-colors flex items-center gap-1"
                >
                  Custom
                  <ChevronDownIcon className="h-5 w-5" />
                </button>
              </PopoverTrigger>
            </div>
          </div>
          <PopoverContent className="w-auto p-0" align="end">
            <YearMonthPickerPanel
              value={customPeriod}
              onChange={(v) => {
                setCustomPeriod(v);
                setTimeframeType('custom');
                setCustomPickerOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col px-2 sm:p-6 min-h-0">
        <ChartContainer
          config={chartConfig}
          className="w-full flex-1 min-h-0 aspect-auto"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 20,
              right: 25,
              top: 20,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={32}
              tick={{ fontSize: 16, fill: '#666' }}
              tickFormatter={(value) => {
                const date = parseDateKey(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fontSize: 16, fill: '#666' }}
              tickFormatter={(value) => {
                // Format as currency for both donations and recurring donations
                return `$${(value / 100).toLocaleString()}`;
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px] bg-white"
                  nameKey="value"
                  labelFormatter={(value: string) => {
                    return parseDateKey(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                  formatter={(value: any) => {
                    // Format as currency for both donations and recurring donations
                    return `$${(value / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                  }}
                />
              }
            />
            <Area
              dataKey="value"
              type="monotone"
              fill={chartConfig[activeChart].color}
              stroke={chartConfig[activeChart].color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>

        <div className="mt-6 flex justify-center">
          <div className="inline-flex border border-gray-300 rounded-lg overflow-hidden">
            {(['donations', 'recurring_donations'] as const).map(
              (key, index) => {
                const chart = key as DataType;
                return (
                  <button
                    key={String(chart)}
                    data-active={activeChart === chart}
                    className="data-[active=true]:bg-gray-200 data-[active=false]:hover:bg-muted/50 px-6 py-3 text-lg font-medium transition-colors"
                    style={{
                      borderRight: index === 0 ? '1px solid #d1d5db' : 'none',
                    }}
                    onClick={() => setActiveChart(chart)}
                  >
                    {chartConfig[chart].label}
                  </button>
                );
              },
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-destructive text-center">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
