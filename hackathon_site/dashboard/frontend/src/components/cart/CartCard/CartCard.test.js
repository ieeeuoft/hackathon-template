import React from "react";
import CartCard from "./CartCard";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent } from "@testing-library/react";
import { TEST_IDS } from "components/user/LoginForm/LoginForm";

describe("CartCard", () => {
    const image = "https://i.imgur.com/IO6e5a6.jpg";
    const title = "Some very long title and stuff";
    const currentStock = 9;
    const closeChange = jest.fn();
    const handleChange = jest.fn();
    const item = 3;

    test("CartCard Test", () => {
        const { getByText, getByAltText, getByRole } = render(
            <CartCard
                image={image}
                title={title}
                currentStock={currentStock}
                closeChange={closeChange}
                handleChange={handleChange}
                item={item}
            />
        );

        const exitButton = getByRole("close");
        fireEvent.click(exitButton);
        expect(closeChange.mock.calls.length).toBe(1);
        expect(getByAltText(title)).toBeInTheDocument();
        expect(getByText(title)).toBeInTheDocument();
    });
});
