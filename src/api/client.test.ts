import { handleApiError } from "./client";
import axios from "axios";

describe("handleApiError", () => {
  it("returns API error message when present", () => {
    const error = new axios.AxiosError(
      "Request failed",
      "400",
      undefined,
      null,
      {
        status: 400,
        data: { error: { message: "Validation failed" } },
      } as any,
    );
    expect(handleApiError(error)).toBe("Validation failed");
  });

  it("returns 401 message for unauthorized", () => {
    const error = new axios.AxiosError("Unauthorized", "401", undefined, null, {
      status: 401,
    } as any);
    expect(handleApiError(error)).toBe("Unauthorized. Please login again.");
  });

  it("returns 403 message for forbidden", () => {
    const error = new axios.AxiosError("Forbidden", "403", undefined, null, {
      status: 403,
    } as any);
    expect(handleApiError(error)).toBe(
      "You do not have permission to perform this action.",
    );
  });

  it("returns 404 message for not found", () => {
    const error = new axios.AxiosError("Not Found", "404", undefined, null, {
      status: 404,
    } as any);
    expect(handleApiError(error)).toBe("Resource not found.");
  });

  it("returns 500 message for server error", () => {
    const error = new axios.AxiosError("Server Error", "500", undefined, null, {
      status: 500,
    } as any);
    expect(handleApiError(error)).toBe("Server error. Please try again later.");
  });

  it("returns generic message for non-Axios errors", () => {
    expect(handleApiError(new Error("Something broke"))).toBe(
      "An unexpected error occurred",
    );
  });

  it("returns error.message as fallback for axios errors without status", () => {
    const error = new axios.AxiosError("Network Error", "0");
    expect(handleApiError(error)).toBe("Network Error");
  });
});
