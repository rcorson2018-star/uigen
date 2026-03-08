import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUpForm } from "../SignUpForm";
import { useAuth } from "@/hooks/use-auth";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

const mockSignUp = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useAuth as any).mockReturnValue({ signUp: mockSignUp, isLoading: false });
});

afterEach(() => {
  cleanup();
});

test("renders email, password, and confirm password fields", () => {
  render(<SignUpForm />);
  expect(screen.getByLabelText("Email")).toBeDefined();
  expect(screen.getByLabelText("Password")).toBeDefined();
  expect(screen.getByLabelText("Confirm Password")).toBeDefined();
});

test("renders sign up button", () => {
  render(<SignUpForm />);
  expect(screen.getByRole("button", { name: "Sign Up" })).toBeDefined();
});

test("calls signUp with email and password on submit", async () => {
  const user = userEvent.setup();
  mockSignUp.mockResolvedValue({ success: true });

  render(<SignUpForm />);

  await user.type(screen.getByLabelText("Email"), "new@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.type(screen.getByLabelText("Confirm Password"), "password123");
  await user.click(screen.getByRole("button", { name: "Sign Up" }));

  expect(mockSignUp).toHaveBeenCalledWith("new@example.com", "password123");
});

test("shows error when passwords do not match", async () => {
  const user = userEvent.setup();

  render(<SignUpForm />);

  await user.type(screen.getByLabelText("Email"), "new@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.type(screen.getByLabelText("Confirm Password"), "different123");
  await user.click(screen.getByRole("button", { name: "Sign Up" }));

  expect(screen.getByText("Passwords do not match")).toBeDefined();
  expect(mockSignUp).not.toHaveBeenCalled();
});

test("calls onSuccess after successful sign up", async () => {
  const user = userEvent.setup();
  const onSuccess = vi.fn();
  mockSignUp.mockResolvedValue({ success: true });

  render(<SignUpForm onSuccess={onSuccess} />);

  await user.type(screen.getByLabelText("Email"), "new@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.type(screen.getByLabelText("Confirm Password"), "password123");
  await user.click(screen.getByRole("button", { name: "Sign Up" }));

  await waitFor(() => expect(onSuccess).toHaveBeenCalled());
});

test("shows error message on failed sign up", async () => {
  const user = userEvent.setup();
  mockSignUp.mockResolvedValue({ success: false, error: "Email already in use" });

  render(<SignUpForm />);

  await user.type(screen.getByLabelText("Email"), "existing@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.type(screen.getByLabelText("Confirm Password"), "password123");
  await user.click(screen.getByRole("button", { name: "Sign Up" }));

  await waitFor(() =>
    expect(screen.getByText("Email already in use")).toBeDefined()
  );
});

test("shows default error message when error is not provided", async () => {
  const user = userEvent.setup();
  mockSignUp.mockResolvedValue({ success: false });

  render(<SignUpForm />);

  await user.type(screen.getByLabelText("Email"), "new@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.type(screen.getByLabelText("Confirm Password"), "password123");
  await user.click(screen.getByRole("button", { name: "Sign Up" }));

  await waitFor(() =>
    expect(screen.getByText("Failed to sign up")).toBeDefined()
  );
});

test("disables inputs and button when loading", () => {
  (useAuth as any).mockReturnValue({ signUp: mockSignUp, isLoading: true });

  render(<SignUpForm />);

  expect(screen.getByLabelText("Email")).toHaveProperty("disabled", true);
  expect(screen.getByLabelText("Password")).toHaveProperty("disabled", true);
  expect(screen.getByLabelText("Confirm Password")).toHaveProperty("disabled", true);
  expect(screen.getByRole("button")).toHaveProperty("disabled", true);
});

test("shows 'Creating account...' text when loading", () => {
  (useAuth as any).mockReturnValue({ signUp: mockSignUp, isLoading: true });

  render(<SignUpForm />);

  expect(screen.getByRole("button").textContent).toBe("Creating account...");
});

test("shows minimum password length hint", () => {
  render(<SignUpForm />);
  expect(screen.getByText("Must be at least 8 characters long")).toBeDefined();
});
