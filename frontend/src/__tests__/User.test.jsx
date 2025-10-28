import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import axios from "axios";
import User from "../pages/User";

jest.mock("axios");
jest.mock("../components/Navbar", () => () => <div>Navbar</div>);

describe("User page", () => {
  beforeEach(() => {
    localStorage.setItem("token", "testtoken");
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders user details after fetching", async () => {
    const userData = {
      name: "Test User",
      email: "testuser@example.com",
      totalAmount: 1000,
    };
    axios.get.mockResolvedValueOnce({ data: userData });

    render(<User />);

    expect(screen.getByText(/Loading user details/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Personal Information/i)).toBeInTheDocument();
    });

    expect(screen.getByText(userData.name)).toBeInTheDocument();
    expect(screen.getByText(userData.email)).toBeInTheDocument();
    expect(screen.getByText(`₹${userData.totalAmount.toLocaleString('en-IN')}`)).toBeInTheDocument();
  });

  test("renders error message on fetch failure", async () => {
    axios.get.mockRejectedValueOnce(new Error("Failed to fetch"));

    render(<User />);

    expect(screen.getByText(/Loading user details/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });
  });
});
