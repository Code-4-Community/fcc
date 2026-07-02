import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownUp,
  CalendarDays,
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import apiClient, { type DonationListRow } from '@api/apiClient';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover';

const ROWS_PER_PAGE = 14;

type SortKey = 'newest' | 'oldest' | 'highest' | 'lowest';

type RecurrenceFilterKey =
  | 'one_time'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'bimonthly'
  | 'quarterly'
  | 'annually';

type FilterState = {
  recurrences: Set<RecurrenceFilterKey>;
  statuses: Set<DonationListRow['status']>;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
};

type CreateDonationState = {
  firstName: string;
  lastName: string;
  email: string;
  amount: string;
  reason: string;
  donationType: 'one_time' | 'recurring';
  recurringInterval: 'weekly' | 'monthly' | 'annually';
  isAnonymous: boolean;
  showDedicationPublicly: boolean;
};

const SORT_LABELS: Record<SortKey, string> = {
  newest: 'Most Recent',
  oldest: 'Oldest',
  highest: 'Greatest',
  lowest: 'Least',
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function getRecurrenceLabel(donation: DonationListRow): string {
  if (donation.donationType !== 'recurring') {
    return 'One-Time';
  }

  if (!donation.recurringInterval) {
    return 'Recurring';
  }

  return (
    donation.recurringInterval.charAt(0).toUpperCase() +
    donation.recurringInterval.slice(1)
  );
}

function getReasonLabel(donation: DonationListRow): string {
  if (donation.isAnonymous) {
    return 'Anonymous';
  }

  if (donation.showDedicationPublicly && donation.dedicationMessage) {
    return donation.dedicationMessage;
  }

  return 'Standard';
}

function buildPageWindow(
  page: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | 'ellipsis'> = [1];
  const leftBound = Math.max(2, page - 1);
  const rightBound = Math.min(totalPages - 1, page + 1);

  if (leftBound > 2) {
    pages.push('ellipsis');
  }

  for (let current = leftBound; current <= rightBound; current += 1) {
    pages.push(current);
  }

  if (rightBound < totalPages - 1) {
    pages.push('ellipsis');
  }

  pages.push(totalPages);
  return pages;
}

function createInitialFilters(): FilterState {
  return {
    recurrences: new Set<RecurrenceFilterKey>([
      'one_time',
      'weekly',
      'monthly',
      'yearly',
      'bimonthly',
      'quarterly',
      'annually',
    ]),
    statuses: new Set(['pending', 'succeeded', 'failed', 'cancelled']),
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
  };
}

function cloneFilterState(filters: FilterState): FilterState {
  return {
    recurrences: new Set(filters.recurrences),
    statuses: new Set(filters.statuses),
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    amountMin: filters.amountMin,
    amountMax: filters.amountMax,
  };
}

function createInitialDonationForm(): CreateDonationState {
  return {
    firstName: '',
    lastName: '',
    email: '',
    amount: '',
    reason: '',
    donationType: 'one_time',
    recurringInterval: 'monthly',
    isAnonymous: false,
    showDedicationPublicly: false,
  };
}

function normalizeDonationSearch(donation: DonationListRow): string {
  return [
    donation.firstName,
    donation.lastName,
    donation.email,
    donation.amount,
    donation.donationType,
    donation.recurringInterval ?? '',
    donation.status,
    donation.dedicationMessage ?? '',
    donation.transactionId ?? '',
    donation.isAnonymous ? 'anonymous' : '',
  ]
    .join(' ')
    .toLowerCase();
}

function isRecurringMatch(
  donation: DonationListRow,
  recurrences: FilterState['recurrences'],
): boolean {
  if (donation.donationType !== 'recurring') {
    return recurrences.has('one_time');
  }

  // Fallback for legacy recurring rows with missing interval.
  if (!donation.recurringInterval) {
    return true;
  }

  return Boolean(
    donation.recurringInterval && recurrences.has(donation.recurringInterval),
  );
}

function toStartOfDayIso(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function toEndOfDayIso(value: string): Date {
  return new Date(`${value}T23:59:59.999`);
}

type ToolbarProps = {
  totalCount: number;
  visibleCount: number;
  onExport: () => void;
  onAddDonation: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortKey: SortKey;
  onSortChange: (value: SortKey) => void;
  filters: FilterState;
  onApplyFilters: (value: FilterState) => void;
  onResetFilters: () => void;
};

function DonationTrackerToolbar({
  totalCount,
  visibleCount,
  onExport,
  onAddDonation,
  searchValue,
  onSearchChange,
  sortKey,
  onSortChange,
  filters,
  onApplyFilters,
  onResetFilters,
}: ToolbarProps) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const activeFilterCount =
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0) +
    (filters.amountMin ? 1 : 0) +
    (filters.amountMax ? 1 : 0) +
    (filters.recurrences.size !== createInitialFilters().recurrences.size
      ? 1
      : 0);

  const updateFilters = (next: FilterState) => {
    onApplyFilters(cloneFilterState(next));
  };

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex w-full max-w-[340px] items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 shadow-sm">
        <Search className="h-5 w-5 shrink-0 text-neutral-400" />
        <Input
          type="search"
          placeholder="Search donations"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-9 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="success"
          size="lg"
          className="h-12 px-6 text-base"
          onClick={onAddDonation}
        >
          <Plus className="h-5 w-5" />
          Add Donation
        </Button>

        <Popover open={isSortOpen} onOpenChange={setIsSortOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="lg" className="h-12 px-6 text-base">
              <ArrowDownUp className="h-5 w-5" />
              Sort: {SORT_LABELS[sortKey]}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 space-y-2 border-neutral-200 bg-white p-4"
            align="start"
          >
            <p className="text-base font-medium text-neutral-900">
              Sort donations
            </p>
            {[
              { key: 'newest', label: 'Most Recent - Oldest' },
              { key: 'oldest', label: 'Oldest - Most Recent' },
              { key: 'highest', label: 'Greatest - Least' },
              { key: 'lowest', label: 'Least - Greatest' },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  onSortChange(option.key as SortKey);
                  setIsSortOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-base transition-colors',
                  sortKey === option.key
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50',
                )}
              >
                {option.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="lg" className="h-12 px-6 text-base">
              <SlidersHorizontal className="h-5 w-5" />
              Filter
              {activeFilterCount > 0 ? (
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-xs font-semibold text-white ml-1">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-96 space-y-5 border-neutral-200 bg-white p-5"
            align="start"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-medium text-neutral-900">Filters</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm"
                onClick={onResetFilters}
              >
                Reset
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-base font-medium text-neutral-800">
                <CalendarDays className="h-5 w-5" />
                Date range
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  className="h-11 text-base"
                  value={filters.dateFrom}
                  onChange={(event) =>
                    updateFilters({
                      ...filters,
                      dateFrom: event.target.value,
                    })
                  }
                />
                <Input
                  type="date"
                  className="h-11 text-base"
                  value={filters.dateTo}
                  onChange={(event) =>
                    updateFilters({
                      ...filters,
                      dateTo: event.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-base font-medium text-neutral-800">
                Recurrence
              </p>
              <div className="grid grid-cols-2 gap-3 text-base">
                {[
                  { key: 'one_time', label: 'One-Time' },
                  { key: 'weekly', label: 'Weekly' },
                  { key: 'monthly', label: 'Monthly' },
                  { key: 'yearly', label: 'Yearly' },
                  { key: 'bimonthly', label: 'Bi-monthly' },
                  { key: 'quarterly', label: 'Quarterly' },
                  { key: 'annually', label: 'Annually' },
                ].map((option) => {
                  const recurrenceKey = option.key as RecurrenceFilterKey;
                  const active = filters.recurrences.has(recurrenceKey);

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => {
                        const recurrences = new Set(filters.recurrences);

                        if (recurrences.has(recurrenceKey)) {
                          recurrences.delete(recurrenceKey);
                        } else {
                          recurrences.add(recurrenceKey);
                        }

                        updateFilters({
                          ...filters,
                          recurrences,
                        });
                      }}
                      className={cn(
                        'rounded-lg border px-4 py-2.5 text-left transition-colors',
                        active
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50',
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-base font-medium text-neutral-800">Amount</p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  min="0"
                  placeholder="Min"
                  className="h-11 text-base"
                  value={filters.amountMin}
                  onChange={(event) =>
                    updateFilters({
                      ...filters,
                      amountMin: event.target.value,
                    })
                  }
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Max"
                  className="h-11 text-base"
                  value={filters.amountMax}
                  onChange={(event) =>
                    updateFilters({
                      ...filters,
                      amountMax: event.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="default"
                className="text-base"
                onClick={() => setIsFilterOpen(false)}
              >
                Close
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={isExportOpen} onOpenChange={setIsExportOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="lg" className="h-12 px-6 text-base">
              <Download className="h-5 w-5" />
              Export
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-56 border-neutral-200 bg-white p-2"
            align="end"
          >
            <button
              type="button"
              onClick={() => {
                onExport();
                setIsExportOpen(false);
              }}
              className="block w-full rounded-md px-4 py-3 text-left text-base text-neutral-700 hover:bg-neutral-50"
            >
              Export as CSV
            </button>
            <button
              type="button"
              disabled
              className="block w-full rounded-md px-3 py-2 text-left text-sm text-neutral-400"
            >
              Export as PDF
            </button>
          </PopoverContent>
        </Popover>
      </div>

      <div className="text-sm text-neutral-500 xl:hidden">
        Showing {visibleCount} of {totalCount} donations
      </div>
    </div>
  );
}

function DonationTable({ rows }: { rows: DonationListRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-base">
          <thead className="bg-[#E7E7E7] text-neutral-600">
            <tr>
              <th className="px-4 py-4 text-[15px] font-medium">First Name</th>
              <th className="px-4 py-4 text-[15px] font-medium">Last Name</th>
              <th className="px-4 py-4 text-[15px] font-medium">Email</th>
              <th className="px-4 py-4 text-[15px] font-medium">Amount</th>
              <th className="px-4 py-4 text-[15px] font-medium">Recurrence</th>
              <th className="px-4 py-4 text-[15px] font-medium">Date</th>
              <th className="px-4 py-4 text-[15px] font-medium">Fee</th>
              <th className="px-4 py-4 text-[15px] font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((donation) => {
              return (
                <tr key={donation.id} className="hover:bg-neutral-50/70">
                  <td className="border-t border-neutral-100 px-4 py-4 text-neutral-700">
                    {donation.firstName}
                  </td>
                  <td className="border-t border-neutral-100 px-4 py-4 text-neutral-700">
                    {donation.lastName}
                  </td>
                  <td className="border-t border-neutral-100 px-4 py-4 text-neutral-700">
                    {donation.email}
                  </td>
                  <td className="border-t border-neutral-100 px-4 py-4 font-medium text-neutral-800">
                    {formatCurrency(donation.amount)}
                  </td>
                  <td className="border-t border-neutral-100 px-4 py-4">
                    <span className="inline-flex rounded-full bg-[#DDC8BF] px-4 py-2 text-sm font-medium text-neutral-700">
                      {getRecurrenceLabel(donation)}
                    </span>
                  </td>
                  <td className="border-t border-neutral-100 px-4 py-4 text-neutral-700">
                    {formatDate(donation.createdAt)}
                  </td>
                  <td className="border-t border-neutral-100 px-4 py-4 text-neutral-700">
                    {donation.feeAmount !== undefined &&
                    donation.feeAmount !== null ? (
                      formatCurrency(donation.feeAmount / 100)
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="border-t border-neutral-100 px-4 py-4">
                    <span className="text-base text-neutral-700">
                      {getReasonLabel(donation)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DonationTrackerPage() {
  const [allRows, setAllRows] = useState<DonationListRow[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [filters, setFilters] = useState<FilterState>(() =>
    createInitialFilters(),
  );
  const [showCreateDonation, setShowCreateDonation] = useState(false);
  const [createDonationForm, setCreateDonationForm] =
    useState<CreateDonationState>(() => createInitialDonationForm());
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadDonations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getDonations({
        page: 1,
        perPage: 1000,
      });

      setAllRows(response.rows);
    } catch (fetchError) {
      setAllRows([]);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Failed to load donations',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  const filteredRows = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    const nextRows = allRows.filter((donation) => {
      const matchesSearch =
        query.length === 0 || normalizeDonationSearch(donation).includes(query);

      const matchesRecurrence = isRecurringMatch(donation, filters.recurrences);
      const matchesStatus = filters.statuses.has(donation.status);

      const donationDate = new Date(donation.createdAt);
      const matchesDateFrom =
        !filters.dateFrom || donationDate >= toStartOfDayIso(filters.dateFrom);
      const matchesDateTo =
        !filters.dateTo || donationDate <= toEndOfDayIso(filters.dateTo);

      const matchesAmountMin =
        !filters.amountMin || donation.amount >= Number(filters.amountMin);
      const matchesAmountMax =
        !filters.amountMax || donation.amount <= Number(filters.amountMax);

      return (
        matchesSearch &&
        matchesRecurrence &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesAmountMin &&
        matchesAmountMax
      );
    });

    return [...nextRows].sort((left, right) => {
      switch (sortKey) {
        case 'oldest':
          return (
            new Date(left.createdAt).getTime() -
            new Date(right.createdAt).getTime()
          );
        case 'highest':
          return right.amount - left.amount;
        case 'lowest':
          return left.amount - right.amount;
        case 'newest':
        default:
          return (
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime()
          );
      }
    });
  }, [
    allRows,
    filters.amountMax,
    filters.amountMin,
    filters.dateFrom,
    filters.dateTo,
    filters.recurrences,
    filters.statuses,
    searchValue,
    sortKey,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / ROWS_PER_PAGE),
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const visibleRows = useMemo(() => {
    const startIndex = (page - 1) * ROWS_PER_PAGE;
    return filteredRows.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredRows, page]);

  const paginationItems = useMemo(
    () => buildPageWindow(page, totalPages),
    [page, totalPages],
  );

  const resetFilters = () => {
    setFilters(createInitialFilters());
    setPage(1);
  };

  const applyFilters = (nextFilters: FilterState) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const refreshDonations = async () => {
    await loadDonations();
    setPage(1);
  };

  const handleCreateDonation = async () => {
    if (isCreating) {
      return;
    }

    const amount = Number(createDonationForm.amount);
    if (
      !createDonationForm.firstName.trim() ||
      !createDonationForm.lastName.trim() ||
      !createDonationForm.email.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setCreateError('Fill out the required fields with a valid amount.');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      await apiClient.createDonation({
        firstName: createDonationForm.firstName.trim(),
        lastName: createDonationForm.lastName.trim(),
        email: createDonationForm.email.trim(),
        amount,
        isAnonymous: createDonationForm.isAnonymous,
        donationType: createDonationForm.donationType,
        dedicationMessage: createDonationForm.reason.trim(),
        showDedicationPublicly: createDonationForm.showDedicationPublicly,
        ...(createDonationForm.donationType === 'recurring'
          ? { recurringInterval: createDonationForm.recurringInterval }
          : {}),
      });

      setCreateDonationForm(createInitialDonationForm());
      setShowCreateDonation(false);
      await refreshDonations();
    } catch (creationError) {
      setCreateError(
        creationError instanceof Error
          ? creationError.message
          : 'Failed to create donation',
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleExport = async () => {
    const csv = await apiClient.exportDonationsCsv();
    const blobUrl = window.URL.createObjectURL(csv);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'donations.csv';
    link.click();
    window.URL.revokeObjectURL(blobUrl);
  };

  const startItem = visibleRows.length > 0 ? (page - 1) * ROWS_PER_PAGE + 1 : 0;
  const endItem =
    visibleRows.length > 0
      ? Math.min(page * ROWS_PER_PAGE, filteredRows.length)
      : 0;

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5] p-8 text-neutral-900">
      <section className="flex flex-col flex-1 rounded-[24px] border border-neutral-200 bg-white/90 p-8 shadow-[0_4px_12px_rgba(15,23,42,0.08)] backdrop-blur-sm overflow-hidden">
        <DonationTrackerToolbar
          totalCount={filteredRows.length}
          visibleCount={visibleRows.length}
          onExport={handleExport}
          onAddDonation={() => setShowCreateDonation(true)}
          searchValue={searchValue}
          onSearchChange={(value) => {
            setSearchValue(value);
            setPage(1);
          }}
          sortKey={sortKey}
          onSortChange={(value) => {
            setSortKey(value);
            setPage(1);
          }}
          filters={filters}
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
        />

        <div className="flex-1 flex flex-col min-h-0 gap-6">
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-base text-rose-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="flex-1 flex items-center justify-center p-20 text-center text-lg text-neutral-500">
              Loading donations...
            </div>
          ) : visibleRows.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-20 text-center text-lg text-neutral-500">
              No donations found for this page.
            </div>
          ) : (
            <div className="flex-1 overflow-auto min-h-0">
              <DonationTable rows={visibleRows} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base text-neutral-500">
            Showing {startItem} - {endItem} of {filteredRows.length} donations
          </p>

          <nav
            className="flex flex-wrap items-center justify-end gap-2"
            aria-label="Donation pagination"
          >
            <Button
              variant="ghost"
              size="default"
              className="h-10 px-4 text-base"
              onClick={() =>
                setPage((currentPage) => Math.max(1, currentPage - 1))
              }
              disabled={page === 1 || loading}
            >
              Previous
            </Button>

            {paginationItems.map((item, index) =>
              item === 'ellipsis' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-base text-neutral-400"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={item}
                  variant={item === page ? 'outline' : 'ghost'}
                  size="default"
                  className={cn(
                    'h-10 w-10 p-0 text-base',
                    item === page &&
                      'border-neutral-300 bg-white font-semibold text-neutral-900',
                  )}
                  onClick={() => setPage(item)}
                  disabled={loading}
                >
                  {item}
                </Button>
              ),
            )}

            <Button
              variant="ghost"
              size="default"
              className="h-10 px-4 text-base"
              onClick={() =>
                setPage((currentPage) => Math.min(totalPages, currentPage + 1))
              }
              disabled={page >= totalPages || loading}
            >
              Next
            </Button>
          </nav>
        </div>
      </section>

      {showCreateDonation ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-semibold text-neutral-900">
                New Donation
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowCreateDonation(false);
                  setCreateError(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {createError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {createError}
              </div>
            ) : null}

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-700">
                  First Name
                </span>
                <Input
                  value={createDonationForm.firstName}
                  onChange={(event) =>
                    setCreateDonationForm((current) => ({
                      ...current,
                      firstName: event.target.value,
                    }))
                  }
                  placeholder="Enter First Name"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-700">
                  Last Name
                </span>
                <Input
                  value={createDonationForm.lastName}
                  onChange={(event) =>
                    setCreateDonationForm((current) => ({
                      ...current,
                      lastName: event.target.value,
                    }))
                  }
                  placeholder="Enter Last Name"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">
                  Email
                </span>
                <Input
                  type="email"
                  value={createDonationForm.email}
                  onChange={(event) =>
                    setCreateDonationForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="Enter Email Address"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">
                  Amount
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={createDonationForm.amount}
                  onChange={(event) =>
                    setCreateDonationForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  placeholder="Enter Amount"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">
                  Reason
                </span>
                <Input
                  value={createDonationForm.reason}
                  onChange={(event) =>
                    setCreateDonationForm((current) => ({
                      ...current,
                      reason: event.target.value,
                    }))
                  }
                  placeholder="Enter Donation Reason"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-700">
                  Donation Type
                </span>
                <select
                  value={createDonationForm.donationType}
                  onChange={(event) =>
                    setCreateDonationForm((current) => ({
                      ...current,
                      donationType: event.target
                        .value as CreateDonationState['donationType'],
                    }))
                  }
                  className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm"
                >
                  <option value="one_time">One-Time</option>
                  <option value="recurring">Recurring</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-700">
                  Recurring Interval
                </span>
                <select
                  value={createDonationForm.recurringInterval}
                  onChange={(event) =>
                    setCreateDonationForm((current) => ({
                      ...current,
                      recurringInterval: event.target
                        .value as CreateDonationState['recurringInterval'],
                    }))
                  }
                  disabled={createDonationForm.donationType !== 'recurring'}
                  className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm disabled:bg-neutral-100"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="annually">Annually</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={createDonationForm.isAnonymous}
                  onChange={(event) =>
                    setCreateDonationForm((current) => ({
                      ...current,
                      isAnonymous: event.target.checked,
                    }))
                  }
                />
                Anonymous donation
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={createDonationForm.showDedicationPublicly}
                  onChange={(event) =>
                    setCreateDonationForm((current) => ({
                      ...current,
                      showDedicationPublicly: event.target.checked,
                    }))
                  }
                />
                Show reason publicly
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDonation(false);
                  setCreateError(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateDonation} disabled={isCreating}>
                {isCreating ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
