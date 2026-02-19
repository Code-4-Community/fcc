'use client';

import * as React from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { ChevronDownIcon } from 'lucide-react';
import apiClient from '@api/apiClient';

const chartConfig = {
  donations: {
    label: 'Total Donations',
    color: 'hsl(160, 60%, 45%)',
  },
  recurring_donors: {
    label: 'Recurring Donors',
    color: 'hsl(220, 70%, 50%)',
  },
} satisfies ChartConfig;

type DataType = 'donations' | 'recurring_donors';
type TimeUnit = 'weeks' | 'months' | 'years';

// Helper function to calculate date range
function getStartDate(quantity: number, unit: TimeUnit): Date {
  const now = new Date();
  const start = new Date(now);

  switch (unit) {
    case 'weeks':
      start.setDate(now.getDate() - quantity * 7);
      break;
    case 'months':
      start.setMonth(now.getMonth() - quantity);
      break;
    case 'years':
      start.setFullYear(now.getFullYear() - quantity);
      break;
  }

  return start;
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
  startDate: Date,
): Array<{ date: string; value: number }> {
  const dataMap = new Map<string, number>();

  donations.forEach((donation) => {
    const donationDate = parseBackendDate(donation.createdAt);
    if (donationDate >= startDate && donation.status === 'succeeded') {
      const dateKey = formatDate(donationDate);
      dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + donation.amount);
    }
  });

  return Array.from(dataMap.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Process recurring donors data (first recurring donation per email)
function processRecurringDonorsData(
  donations: Array<{
    email: string;
    createdAt: string;
    donationType: string;
    status: string;
  }>,
  startDate: Date,
): Array<{ date: string; value: number }> {
  // Find first recurring donation per email
  const firstRecurringByEmail = new Map<string, Date>();

  donations.forEach((donation) => {
    if (
      donation.donationType === 'recurring' &&
      donation.status === 'succeeded'
    ) {
      const donationDate = parseBackendDate(donation.createdAt);
      const existing = firstRecurringByEmail.get(donation.email);

      if (!existing || donationDate < existing) {
        firstRecurringByEmail.set(donation.email, donationDate);
      }
    }
  });

  // Group by date
  const dataMap = new Map<string, number>();

  firstRecurringByEmail.forEach((firstDate) => {
    if (firstDate >= startDate) {
      const dateKey = formatDate(firstDate);
      dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + 1);
    }
  });

  return Array.from(dataMap.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function DonorStatsChart() {
  const [activeChart, setActiveChart] = React.useState<DataType>('donations');
  const [quantity, setQuantity] = React.useState<number>(6);
  const [unit, setUnit] = React.useState<TimeUnit>('months');
  const [chartData, setChartData] = React.useState<
    Array<{ date: string; value: number }>
  >([]);
  const [donationsData, setDonationsData] = React.useState<
    Array<{ date: string; value: number }>
  >([]);
  const [recurringDonorsData, setRecurringDonorsData] = React.useState<
    Array<{ date: string; value: number }>
  >([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch data whenever activeChart, quantity, or unit changes
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch donations with a large perPage to get all we need
        const response = await apiClient.getDonations({
          perPage: 10000,
          status: 'succeeded',
        });

        const startDate = getStartDate(quantity, unit);
        const donationsProcessed = processDonationsData(
          response.rows,
          startDate,
        );
        const recurringDonorsProcessed = processRecurringDonorsData(
          response.rows,
          startDate,
        );

        setDonationsData(donationsProcessed);
        setRecurringDonorsData(recurringDonorsProcessed);

        if (activeChart === 'donations') {
          setChartData(donationsProcessed);
        } else {
          setChartData(recurringDonorsProcessed);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeChart, quantity, unit]);

  // Update chart data when activeChart changes
  React.useEffect(() => {
    if (activeChart === 'donations') {
      setChartData(donationsData);
    } else {
      setChartData(recurringDonorsData);
    }
  }, [activeChart, donationsData, recurringDonorsData]);

  // Calculate totals for display
  const donationsTotal = React.useMemo(() => {
    return donationsData.reduce((acc, curr) => acc + curr.value, 0);
  }, [donationsData]);

  const recurringDonorsTotal = React.useMemo(() => {
    return recurringDonorsData.reduce((acc, curr) => acc + curr.value, 0);
  }, [recurringDonorsData]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 12) {
      setQuantity(value);
    }
  };

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Donor Statistics</CardTitle>
          <CardDescription>
            {activeChart === 'donations'
              ? 'Total donation amounts over time'
              : 'New recurring donors over time'}
          </CardDescription>
        </div>
        <div className="flex">
          {(['donations', 'recurring_donors'] as const).map((key) => {
            const chart = key as DataType;
            return (
              <button
                key={String(chart)}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {isLoading
                    ? '...'
                    : chart === 'donations'
                      ? `$${(donationsTotal / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : recurringDonorsTotal.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 20,
              right: 12,
              top: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
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
              tickMargin={8}
              tickFormatter={(value) => {
                if (activeChart === 'donations') {
                  // Format as currency (e.g., $50)
                  return `$${(value / 100).toLocaleString()}`;
                } else {
                  // Format as count (e.g., 4)
                  return value.toString();
                }
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="value"
                  labelFormatter={(value: string) => {
                    return parseDateKey(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                  formatter={(value: any) => {
                    if (activeChart === 'donations') {
                      // Format as currency with cents
                      return `$${(value / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    } else {
                      // Format as count
                      return value.toLocaleString();
                    }
                  }}
                />
              }
            />
            <Line
              dataKey="value"
              type="monotone"
              stroke={chartConfig[activeChart].color}
              strokeWidth={2}
              dot={{
                fill: chartConfig[activeChart].color,
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>

        {error && (
          <div className="mt-4 text-sm text-destructive text-center">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-end gap-4 border-t pt-4">
          <div className="flex-1">
            <Label htmlFor="quantity">Time Frame</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="quantity"
                type="number"
                min="1"
                max="12"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-20"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-10 w-[140px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onSelect={() => setUnit('weeks')}>
                    Weeks
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setUnit('months')}>
                    Months
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setUnit('years')}>
                    Years
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing last {quantity} {unit}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
