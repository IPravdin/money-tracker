"use client";

import { formatCurrency, formatMultipleCurrencies, groupByCurrency, CurrencyGroup } from "@/lib/currency";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CurrencyAmountProps {
  amount: number;
  currency: string;
  showSign?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Display a single currency amount with proper formatting
 */
export function CurrencyAmount({
  amount,
  currency,
  showSign = false,
  compact = false,
  className,
}: CurrencyAmountProps) {
  const formatted = formatCurrency(amount, currency, { showSign });

  return (
    <span className={cn("font-medium", className)}>
      {formatted}
    </span>
  );
}

interface MultiCurrencySummaryProps {
  items: Array<{ amount: number; currency: string; [key: string]: any }>;
  title?: string;
  description?: string;
  showCounts?: boolean;
  className?: string;
}

/**
 * Display a summary of amounts grouped by currency
 * Useful for mixed-currency views
 */
export function MultiCurrencySummary({
  items,
  title = "Total",
  description,
  showCounts = false,
  className,
}: MultiCurrencySummaryProps) {
  const groups = groupByCurrency(items);

  if (groups.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // Single currency - display prominently
  if (groups.length === 1) {
    const group = groups[0];
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatCurrency(group.total, group.currency)}
          </div>
          {showCounts && (
            <p className="text-sm text-muted-foreground mt-2">
              {group.count} {group.count === 1 ? "transaction" : "transactions"}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Multiple currencies - display as list
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group.currency}
              className="flex items-center justify-between border-b pb-2 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {group.currency}
                </span>
                {showCounts && (
                  <span className="text-xs text-muted-foreground">
                    ({group.count})
                  </span>
                )}
              </div>
              <span className="text-lg font-bold">
                {formatCurrency(group.total, group.currency)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface CurrencyGroupListProps {
  groups: CurrencyGroup[];
  className?: string;
}

/**
 * Display a list of currency groups in a compact format
 */
export function CurrencyGroupList({ groups, className }: CurrencyGroupListProps) {
  if (groups.length === 0) {
    return <span className={cn("text-muted-foreground", className)}>No data</span>;
  }

  if (groups.length === 1) {
    return (
      <span className={className}>
        {formatCurrency(groups[0].total, groups[0].currency)}
      </span>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {groups.map((group) => (
        <div key={group.currency} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{group.currency}:</span>
          <span className="font-medium">
            {formatCurrency(group.total, group.currency)}
          </span>
        </div>
      ))}
    </div>
  );
}

interface InlineCurrencyGroupsProps {
  groups: CurrencyGroup[];
  separator?: string;
  showCurrencyCode?: boolean;
  className?: string;
}

/**
 * Display currency groups inline (e.g., "$1,234.56 USD, €987.65 EUR")
 */
export function InlineCurrencyGroups({
  groups,
  separator = ", ",
  showCurrencyCode = true,
  className,
}: InlineCurrencyGroupsProps) {
  const formatted = formatMultipleCurrencies(groups, { separator, showCurrencyCode });

  return <span className={className}>{formatted}</span>;
}
