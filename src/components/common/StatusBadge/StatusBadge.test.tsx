import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders DRAFT status", () => {
    render(<StatusBadge status="DRAFT" />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("renders PAID status", () => {
    render(<StatusBadge status="PAID" />);
    expect(screen.getByText("Paid")).toBeInTheDocument();
  });

  it("renders CANCELLED status", () => {
    render(<StatusBadge status="CANCELLED" />);
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("renders boolean true as Active", () => {
    render(<StatusBadge status={true} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders boolean false as Inactive", () => {
    render(<StatusBadge status={false} />);
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("falls back to string value for unknown statuses", () => {
    render(<StatusBadge status={"CUSTOM_STATUS" as any} />);
    expect(screen.getByText("CUSTOM_STATUS")).toBeInTheDocument();
  });
});
