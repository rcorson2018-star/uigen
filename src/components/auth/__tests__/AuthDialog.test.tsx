import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthDialog } from "../AuthDialog";

vi.mock("../SignInForm", () => ({
  SignInForm: ({ onSuccess }: any) => (
    <div data-testid="sign-in-form">
      <button onClick={onSuccess}>Sign In</button>
    </div>
  ),
}));

vi.mock("../SignUpForm", () => ({
  SignUpForm: ({ onSuccess }: any) => (
    <div data-testid="sign-up-form">
      <button onClick={onSuccess}>Sign Up</button>
    </div>
  ),
}));

afterEach(() => {
  cleanup();
});

test("renders sign in form by default", () => {
  render(<AuthDialog open={true} onOpenChange={vi.fn()} />);
  expect(screen.getByTestId("sign-in-form")).toBeDefined();
});

test("renders sign up form when defaultMode is signup", () => {
  render(
    <AuthDialog open={true} onOpenChange={vi.fn()} defaultMode="signup" />
  );
  expect(screen.getByTestId("sign-up-form")).toBeDefined();
});

test("shows 'Welcome back' title in signin mode", () => {
  render(<AuthDialog open={true} onOpenChange={vi.fn()} />);
  expect(screen.getByText("Welcome back")).toBeDefined();
});

test("shows 'Create an account' title in signup mode", () => {
  render(
    <AuthDialog open={true} onOpenChange={vi.fn()} defaultMode="signup" />
  );
  expect(screen.getByText("Create an account")).toBeDefined();
});

test("switches to signup form when 'Sign up' link is clicked", async () => {
  const user = userEvent.setup();
  render(<AuthDialog open={true} onOpenChange={vi.fn()} />);

  await user.click(screen.getByRole("button", { name: "Sign up" }));

  expect(screen.getByTestId("sign-up-form")).toBeDefined();
  expect(screen.getByText("Create an account")).toBeDefined();
});

test("switches to signin form when 'Sign in' link is clicked", async () => {
  const user = userEvent.setup();
  render(
    <AuthDialog open={true} onOpenChange={vi.fn()} defaultMode="signup" />
  );

  await user.click(screen.getByRole("button", { name: "Sign in" }));

  expect(screen.getByTestId("sign-in-form")).toBeDefined();
  expect(screen.getByText("Welcome back")).toBeDefined();
});

test("calls onOpenChange(false) after successful sign in", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  render(<AuthDialog open={true} onOpenChange={onOpenChange} />);

  await user.click(screen.getByRole("button", { name: "Sign In" }));

  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test("calls onOpenChange(false) after successful sign up", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  render(
    <AuthDialog open={true} onOpenChange={onOpenChange} defaultMode="signup" />
  );

  await user.click(screen.getByRole("button", { name: "Sign Up" }));

  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test("does not render content when closed", () => {
  render(<AuthDialog open={false} onOpenChange={vi.fn()} />);
  expect(screen.queryByTestId("sign-in-form")).toBeNull();
});

test("updates mode when defaultMode prop changes", () => {
  const { rerender } = render(
    <AuthDialog open={true} onOpenChange={vi.fn()} defaultMode="signin" />
  );
  expect(screen.getByTestId("sign-in-form")).toBeDefined();

  rerender(
    <AuthDialog open={true} onOpenChange={vi.fn()} defaultMode="signup" />
  );
  expect(screen.getByTestId("sign-up-form")).toBeDefined();
});
