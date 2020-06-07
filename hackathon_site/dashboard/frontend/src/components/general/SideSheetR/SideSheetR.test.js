import React from "react";
import SideSheetR from "./SideSheetR";
import { render, fireEvent, waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

/**
 * Test the quantity log thing
 */

describe("SideSheetR", () => {
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
            <SideSheetR detail={testDetail} cart={addCartMock} />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    test("click me opens the drawer", () => {
        const { getByText, queryByText } = render(
            <SideSheetR detail={testDetail} cart={addCartMock} />
        );

        //Open Drawer
        const openDrawer = getByText("click me");
        fireEvent.click(openDrawer);

        // Confirm open drawer
        expect(queryByText("Product Overview")).not.toBeNull();
    });

    test("close the drawer works", async () => {
        const { getByText, getByRole, queryByText } = render(
            <SideSheetR detail={testDetail} cart={addCartMock} />
        );
        //Open Drawer
        const openDrawer = getByText("click me");
        fireEvent.click(openDrawer);

        const returnArrow = getByRole("close");
        fireEvent.click(returnArrow);

        await waitForElementToBeRemoved(() => getByText("Product Overview"));
    });

    test("add to cart button calls the correct function", () => {
        const { getByText } = render(
            <SideSheetR detail={testDetail} cart={addCartMock} />
        );

        // open the drawer
        const openDrawer = getByText("click me");
        fireEvent.click(openDrawer);

        const button = getByText("ADD TO CART");

        fireEvent.click(button);
        expect(addCartMock).toHaveBeenCalledTimes(1);
    });
});
