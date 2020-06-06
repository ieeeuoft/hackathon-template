import React from "react";
import SideSheetR from "./SideSheetR";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

/**
 * Test the Add Cart function
 * Test the quantity log thing
 * Test the back button
 * Test with snapshot
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

    // I will write more tests after I get feedback for the component
});
