import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Text } from "react-native";
import { ErrorBoundary } from "../../components/ErrorBoundary";

function ThrowingComponent(): React.ReactElement {
  throw new Error("Test error");
}

function GoodComponent(): React.ReactElement {
  return <Text>All good</Text>;
}

describe("ErrorBoundary", () => {
  let consoleSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("All good")).toBeTruthy();
  });

  it("renders error UI when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("SOMETHING WENT WRONG")).toBeTruthy();
    expect(screen.getByText("Test error")).toBeTruthy();
  });

  it("renders TRY AGAIN button on error", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("TRY AGAIN")).toBeTruthy();
  });

  it("TRY AGAIN button is pressable", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    fireEvent.press(screen.getByText("TRY AGAIN"));
  });
});
