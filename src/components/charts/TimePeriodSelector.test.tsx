import { describe, it, expect, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimePeriodSelector } from "./TimePeriodSelector";
import { TimePeriod } from "@/lib/utils/insights";

describe("TimePeriodSelector", () => {
  const mockOnPeriodChange = jest.fn();

  beforeEach(() => {
    mockOnPeriodChange.mockClear();
  });

  it("should render all period options", () => {
    render(
      <TimePeriodSelector
        selectedPeriod="month"
        onPeriodChange={mockOnPeriodChange}
      />
    );
    
    expect(screen.getByText("Week")).toBeInTheDocument();
    expect(screen.getByText("Month")).toBeInTheDocument();
    expect(screen.getByText("Year")).toBeInTheDocument();
  });

  it("should highlight selected period", () => {
    const { container } = render(
      <TimePeriodSelector
        selectedPeriod="month"
        onPeriodChange={mockOnPeriodChange}
      />
    );
    
    const monthButton = screen.getByText("Month").closest("button");
    expect(monthButton).toHaveClass("bg-primary"); // Default variant styling
  });

  it("should call onPeriodChange when clicking a period", () => {
    render(
      <TimePeriodSelector
        selectedPeriod="month"
        onPeriodChange={mockOnPeriodChange}
      />
    );
    
    const weekButton = screen.getByText("Week");
    fireEvent.click(weekButton);
    
    expect(mockOnPeriodChange).toHaveBeenCalledWith("week");
  });

  it("should call onPeriodChange with correct period for each button", () => {
    render(
      <TimePeriodSelector
        selectedPeriod="month"
        onPeriodChange={mockOnPeriodChange}
      />
    );
    
    fireEvent.click(screen.getByText("Week"));
    expect(mockOnPeriodChange).toHaveBeenCalledWith("week");
    
    fireEvent.click(screen.getByText("Month"));
    expect(mockOnPeriodChange).toHaveBeenCalledWith("month");
    
    fireEvent.click(screen.getByText("Year"));
    expect(mockOnPeriodChange).toHaveBeenCalledWith("year");
  });

  it("should render icons for each period", () => {
    const { container } = render(
      <TimePeriodSelector
        selectedPeriod="month"
        onPeriodChange={mockOnPeriodChange}
      />
    );
    
    // Check for lucide-react icons
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBe(3); // One icon per period
  });

  it("should apply custom className", () => {
    const { container } = render(
      <TimePeriodSelector
        selectedPeriod="month"
        onPeriodChange={mockOnPeriodChange}
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should handle rapid period changes", () => {
    render(
      <TimePeriodSelector
        selectedPeriod="month"
        onPeriodChange={mockOnPeriodChange}
      />
    );
    
    fireEvent.click(screen.getByText("Week"));
    fireEvent.click(screen.getByText("Year"));
    fireEvent.click(screen.getByText("Month"));
    
    expect(mockOnPeriodChange).toHaveBeenCalledTimes(3);
  });

  it("should work with all valid TimePeriod values", () => {
    const periods: TimePeriod[] = ["week", "month", "year"];
    
    periods.forEach((period) => {
      const { unmount } = render(
        <TimePeriodSelector
          selectedPeriod={period}
          onPeriodChange={mockOnPeriodChange}
        />
      );
      
      expect(screen.getByText("Week")).toBeInTheDocument();
      expect(screen.getByText("Month")).toBeInTheDocument();
      expect(screen.getByText("Year")).toBeInTheDocument();
      
      unmount();
    });
  });
});
