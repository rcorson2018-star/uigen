import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignInForm } from "../SignInForm";
import { useAuth } from "@/hooks/use-auth";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

const mockSignIn = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useAuth as any).mockReturnValue({ signIn: mockSignIn, isLoading: false });
});

afterEach(() => {
  cleanup();
});

test("renders email and password fields", () => {
  render(<SignInForm />);
  expect(screen.getByLabelText("Email")).toBeDefined();
  expect(screen.getByLabelText("Password")).toBeDefined();
});

test("renders sign in button", () => {
  render(<SignInForm />);
  expect(screen.getByRole("button", { name: "Sign In" })).toBeDefined();
});

test("calls signIn with email and password on submit", async () => {
  const user = userEvent.setup();
  mockSignIn.mockResolvedValue({ success: true });

  render(<SignInForm />);

  await user.type(screen.getByLabelText("Email"), "user@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.click(screen.getByRole("button", { name: "Sign In" }));

  expect(mockSignIn).toHaveBeenCalledWith("user@example.com", "password123");
});

test("calls onSuccess callback after successful sign in", async () => {
  const user = userEvent.setup();
  const onSuccess = vi.fn();
  mockSignIn.mockResolvedValue({ success: true });

  render(<SignInForm onSuccess={onSuccess} />);

  await user.type(screen.getByLabelText("Email"), "user@example.com");
  await user.type(screen.getByLabelText("Password"), "password123");
  await user.click(screen.getByRole("button", { name: "Sign In" }));

  await waitFor(() => expect(onSuccess).toHaveBeenCalled());
});

test("shows error message on failed sign in", async () => {
  const user = userEvent.setup();
  mockSignIn.mockResolvedValue({ success: false, error: "Invalid credentials" });

  render(<SignInForm />);

  await user.type(screen.getByLabelText("Email"), "user@example.com");
  await user.type(screen.getByLabelText("Password"), "wrongpassword");
  await user.click(screen.getByRole("button", { name: "Sign In" }));

  await waitFor(() =>
    expect(screen.getByText("Invalid credentials")).toBeDefined()
  );
});

test("shows default error message when error is not provided", async () => {
  const user = userEvent.setup();
  mockSignIn.mockResolvedValue({ success: false });

  render(<SignInForm />);

  await user.type(screen.getByLabelText("Email"), "user@example.com");
  await user.type(screen.getByLabelText("Password"), "wrongpassword");
  await user.click(screen.getByRole("button", { name: "Sign In" }));

  await waitFor(() =>
    expect(screen.getByText("Failed to sign in")).toBeDefined()
  );
});

test("disables inputs and button when loading", () => {
  (useAuth as any).mockReturnValue({ signIn: mockSignIn, isLoading: true });

  render(<SignInForm />);

  expect(screen.getByLabelText("Email")).toHaveProperty("disabled", true);
  expect(screen.getByLabelText("Password")).toHaveProperty("disabled", true);
  expect(screen.getByRole("button")).toHaveProperty("disabled", true);
});

test("shows 'Signing in...' text when loading", () => {
  (useAuth as any).mockReturnValue({ signIn: mockSignIn, isLoading: true });

  render(<SignInForm />);

  expect(screen.getByRole("button").textContent).toBe("Signing in...");
});

test("does not call onSuccess when sign in fails", async () => {
  const user = userEvent.setup();
  const onSuccess = vi.fn();
  mockSignIn.mockResolvedValue({ success: false, error: "Error" });

  render(<SignInForm onSuccess={onSuccess} />);

  await user.type(screen.getByLabelText("Email"), "user@example.com");
  await user.type(screen.getByLabelText("Password"), "wrong");
  await user.click(screen.getByRole("button", { name: "Sign In" }));

  await waitFor(() => screen.getByText("Error"));
  expect(onSuccess).not.toHaveBeenCalled();
});
