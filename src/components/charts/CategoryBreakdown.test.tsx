import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { CategoryData } from "@/lib/utils/insights";

describe("CategoryBreakdown", () => {
  const mockData: CategoryData[] = [
    {
      category: "Food",
      amount: 100,
      percentage: 66.67,
      count: 5,
      currency: "USD",
    },
    {
      category: "Transportation",
      amount: 50,
      percentage: 33.33,
      count: 2,
      currency: "USD",
    },
  ];

  it("should render category breakdown with data", () => {
    render(<CategoryBreakdown data={mockData} currency="USD" />);
    
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Transportation")).toBeInTheDocument();
  });

  it("should display empty state when no data", () => {
    render(<CategoryBreakdown data={[]} currency="USD" />);
    
    expect(screen.getByText("No category data available")).toBeInTheDocument();
  });

  it("should display transaction counts", () => {
    render(<CategoryBreakdown data={mockData} currency="USD" />);
    
    expect(screen.getByText("5 transactions")).toBeInTheDocument();
    expect(screen.getByText("2 transactions")).toBeInTheDocument();
  });

  it("should display amounts with currency symbol", () => {
    render(<CategoryBreakdown data={mockData} currency="USD" />);
    
    // Check for amounts (using regex to match currency symbol + amount)
    expect(screen.getByText(/\$100\.00/)).toBeInTheDocument();
    expect(screen.getByText(/\$50\.00/)).toBeInTheDocument();
  });

  it("should display percentages", () => {
    render(<CategoryBreakdown data={mockData} currency="USD" />);
    
    expect(screen.getByText("66.7%")).toBeInTheDocument();
    expect(screen.getByText("33.3%")).toBeInTheDocument();
  });

  it("should display total expenses", () => {
    render(<CategoryBreakdown data={mockData} currency="USD" />);
    
    expect(screen.getByText("Total Expenses")).toBeInTheDocument();
    expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
  });

  it("should handle single transaction correctly", () => {
    const singleTransactionData: CategoryData[] = [
      {
        category: "Food",
        amount: 100,
        percentage: 100,
        count: 1,
        currency: "USD",
      },
    ];

    render(<CategoryBreakdown data={singleTransactionData} currency="USD" />);
    
    expect(screen.getByText("1 transaction")).toBeInTheDocument();
  });

  it("should render progress bars for each category", () => {
    const { container } = render(
      <CategoryBreakdown data={mockData} currency="USD" />
    );
    
    // Check for progress bar elements
    const progressBars = container.querySelectorAll('[role="progressbar"]');
    expect(progressBars.length).toBe(mockData.length);
  });

  it("should apply custom className", () => {
    const { container } = render(
      <CategoryBreakdown data={mockData} currency="USD" className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
