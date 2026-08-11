import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OperatingCommandBar } from "./OperatingCommandBar";
describe("OperatingCommandBar", () => it("runs deterministic local commands without a network dispatch", () => { render(<OperatingCommandBar />); fireEvent.change(screen.getByLabelText("Command"), { target: { value: "find research" } }); fireEvent.click(screen.getByRole("button", { name: "Run" })); expect(screen.getByText(/find applied locally/)).toBeVisible(); }));
