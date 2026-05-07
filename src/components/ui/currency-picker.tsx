"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getSupportedCurrencies, SupportedCurrency } from "@/lib/currency";

interface CurrencyPickerProps {
  value: string;
  onChange: (value: SupportedCurrency) => void;
  disabled?: boolean;
  label?: string;
  showLabel?: boolean;
  error?: string;
  className?: string;
}

/**
 * CurrencyPicker Component
 * Reusable currency selector with proper symbols and names
 */
export function CurrencyPicker({
  value,
  onChange,
  disabled = false,
  label = "Currency",
  showLabel = true,
  error,
  className,
}: CurrencyPickerProps) {
  const currencies = getSupportedCurrencies();

  return (
    <div className={className}>
      {showLabel && <Label htmlFor="currency">{label}</Label>}
      <Select
        value={value}
        onValueChange={(val) => onChange(val as SupportedCurrency)}
        disabled={disabled}
      >
        <SelectTrigger id="currency">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <span className="flex items-center gap-2">
                <span className="font-semibold">{currency.symbol}</span>
                <span>{currency.code}</span>
                <span className="text-muted-foreground text-sm">- {currency.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
