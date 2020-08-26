import React from "react";
import CartCard from "./CartCard";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent } from "@testing-library/react";

describe("CartCard Item test", () => {
    const image = "https://i.imgur.com/IO6e5a6.jpg";
    const title = "Some very long title and stuff";
    const currentStock = 9;
    const handleRemove = () => {};
    const checkedOutQuantity = 3;
    const outOfStock = "Currently unavailable";
    const error = null;

    test("CartCard default display test", () => {
        const { getByText, getByAltText } = render(
            <CartCard
                image={image}
                title={title}
                currentStock={currentStock}
                handleRemove={handleRemove}
                checkedOutQuantity={checkedOutQuantity}
                error={error}
            />
        );

        expect(getByText(checkedOutQuantity.toString())).toBeInTheDocument();
        expect(getByAltText(title)).toBeInTheDocument();
        expect(getByText(title)).toBeInTheDocument();
    });

    test("Button that removes the CartCard item", () => {
        const handleRemove = jest.fn();

        const { getByRole } = render(
            <CartCard
                image={image}
                title={title}
                currentStock={currentStock}
                handleRemove={handleRemove}
                checkedOutQuantity={checkedOutQuantity}
                error={error}
            />
        );

        const removeButton = getByRole("remove");
        fireEvent.click(removeButton);
        expect(handleRemove).toHaveBeenCalledTimes(1);
    });

    test("Out of Stock", () => {
        const currentStock = 0;

        const { getByText } = render(
            <CartCard
                image={image}
                title={title}
                currentStock={currentStock}
                handleRemove={handleRemove}
                checkedOutQuantity={checkedOutQuantity}
                error={error}
            />
        );

        expect(getByText(outOfStock)).toBeInTheDocument();
    });

    test("Error message", () => {
        const error = "some error message";

        const { getByText } = render(
            <CartCard
                image={image}
                title={title}
                currentStock={currentStock}
                handleRemove={handleRemove}
                checkedOutQuantity={checkedOutQuantity}
                error={error}
            />
        );

        expect(getByText(error)).toBeInTheDocument();
    });
});
