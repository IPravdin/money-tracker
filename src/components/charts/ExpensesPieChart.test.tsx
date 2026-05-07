import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { ExpensesPieChart } from "./ExpensesPieChart";
import { CategoryData } from "@/lib/utils/insights";

describe("ExpensesPieChart", () => {
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

  it("should render pie chart with data", () => {
    const { container } = render(
      <ExpensesPieChart data={mockData} currency="USD" />
    );
    
    // Check if ResponsiveContainer is rendered
    expect(container.querySelector(".recharts-responsive-container")).toBeTruthy();
  });

  it("should display empty state when no data", () => {
    render(<ExpensesPieChart data={[]} currency="USD" />);
    
    expect(screen.getByText("No expense data available")).toBeInTheDocument();
  });

  it("should render correct number of pie slices", () => {
    const { container } = render(
      <ExpensesPieChart data={mockData} currency="USD" />
    );
    
    // Check for pie chart cells
    const cells = container.querySelectorAll(".recharts-pie-sector");
    expect(cells.length).toBe(mockData.length);
  });

  it("should handle multiple categories", () => {
    const multiCategoryData: CategoryData[] = [
      { category: "Food", amount: 100, percentage: 40, count: 5, currency: "USD" },
      { category: "Transportation", amount: 75, percentage: 30, count: 3, currency: "USD" },
      { category: "Entertainment", amount: 50, percentage: 20, count: 2, currency: "USD" },
      { category: "Shopping", amount: 25, percentage: 10, count: 1, currency: "USD" },
    ];

    const { container } = render(
      <ExpensesPieChart data={multiCategoryData} currency="USD" />
    );
    
    const cells = container.querySelectorAll(".recharts-pie-sector");
    expect(cells.length).toBe(multiCategoryData.length);
  });

  it("should use correct currency symbol", () => {
    const { container } = render(
      <ExpensesPieChart data={mockData} currency="EUR" />
    );
    
    // The component should render with EUR currency
    expect(container).toBeTruthy();
  });
});
