import { render } from "../../../testing/utils";
import PopupModal from "./PopupModal";
import React from "react";

test("renders general popup modal without crashing", () => {
    const { getByText } = render(
        <PopupModal
            description={"Example Description"}
            isVisible={true}
            submitHandler={() => {}}
            cancelHandler={() => {}}
            cancelText={"cancel"}
            submitText={"submit"}
            title={"Test Modal"}
        ></PopupModal>
    );
    expect(getByText("Example Description")).toBeInTheDocument();
    expect(getByText("cancel")).toBeInTheDocument();
    expect(getByText("submit")).toBeInTheDocument();
    expect(getByText("Test Modal")).toBeInTheDocument();
});
