"use client";

import { CategoryData } from "@/lib/utils/insights";
import { getCurrencySymbol } from "@/lib/validations/account";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CategoryBreakdownProps {
  data: CategoryData[];
  currency: string;
  className?: string;
}

export function CategoryBreakdown({ data, currency, className }: CategoryBreakdownProps) {
  const currencySymbol = getCurrencySymbol(currency);
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  if (data.length === 0) {
    return (
      <div className={`text-center text-muted-foreground py-8 ${className || ""}`}>
        No category data available
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className || ""}`}>
      {data.map((category, index) => (
        <Card key={`${category.category}-${index}`}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {/* Category name and amount */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{category.category}</h4>
                  <p className="text-xs text-muted-foreground">
                    {category.count} {category.count === 1 ? "transaction" : "transactions"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">
                    {currencySymbol}
                    {category.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {category.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <Progress value={category.percentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Total */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm">Total Expenses</h4>
            <p className="font-bold text-lg">
              {currencySymbol}
              {total.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
