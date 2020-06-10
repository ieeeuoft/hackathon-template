import React from "react";
import SideSheetRight from "./SideSheetRight";
import {
    render,
    fireEvent,
    waitForElementToBeRemoved,
    waitFor,
    waitForElement,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

describe("SideSheetRight", () => {
    const testDetail = {
        name: "Arduino",
        type: "red",
        total: 30,
        available: 29,
        img: "https://www.filterforge.com/more/help/images/size200.jpg",
        tags: "MCU, FPGA",
        manufacturer: "Canakit",
        model_num: "Model 3B+",
        datasheet: "link",
        notes: ["- For micropython ask for image", "- randomnerdtutorials.com"],
        constraints: ["- Max 1 of this item", "- Max 3 microcontroller labelled red"],
        quantity: 3,
    };

    const addCartMock = jest.fn();

    test("render", () => {
        const { asFragment } = render(
            <SideSheetRight detail={testDetail} addCartFunction={addCartMock} />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    test("click me opens the drawer", async () => {
        const { getByText, getByRole, queryByText } = render(
            <SideSheetRight detail={testDetail} addCartFunction={addCartMock} />
        );

        //Open Drawer
        const openDrawer = getByText("click me");
        fireEvent.click(openDrawer);

        await waitFor(() => {
            expect(getByRole("close")).toBeInTheDocument();
        });

        // Confirm open drawer
        expect(queryByText("Product Overview")).not.toBeNull();
    });

    test("close the drawer works", async () => {
        const { getByText, getByRole } = render(
            <SideSheetRight detail={testDetail} addCartFunction={addCartMock} />
        );
        //Open Drawer
        const openDrawer = getByText("click me");
        fireEvent.click(openDrawer);

        await waitFor(() => {
            expect(getByRole("close")).toBeInTheDocument();
        });

        const returnArrow = getByRole("close");
        fireEvent.click(returnArrow);

        await waitForElementToBeRemoved(() => getByText("Product Overview"));
    });

    test("add to cart button calls the correct function", async () => {
        const { getByText, getByRole } = render(
            <SideSheetRight detail={testDetail} addCartFunction={addCartMock} />
        );

        // open the drawer
        const openDrawer = getByText("click me");
        fireEvent.click(openDrawer);

        await waitFor(() => {
            expect(getByRole("close")).toBeInTheDocument();
        });

        const button = getByText("ADD TO CART");

        fireEvent.click(button);
        expect(addCartMock).toHaveBeenCalledTimes(1);
    });

    test("confirm that the correct value has been logged", async () => {
        const cartTest = jest.fn();

        const { getByText, getByRole, getByTestId } = render(
            <SideSheetRight detail={testDetail} addCartFunction={cartTest} />
        );

        // open the drawer
        const openDrawer = getByText("click me");
        fireEvent.click(openDrawer);
        await waitFor(() => {
            expect(getByText("Product Overview")).toBeInTheDocument();
        });

        // open the selector

        const contentInput = getByTestId("content-input");
        fireEvent.change(contentInput, {
            target: { value: "1" },
        });

        const button = getByText("ADD TO CART");
        fireEvent.click(button);

        await waitFor(() => {
            expect(cartTest).toHaveBeenCalledWith("1");
        });
    });
});
