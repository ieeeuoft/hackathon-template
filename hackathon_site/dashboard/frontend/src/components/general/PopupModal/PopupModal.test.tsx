import { render } from "../../../testing/utils";
import PopupModal from "./PopupModal";
import React from "react";
import { fireEvent } from "@testing-library/react";

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

test("submit function is being passed into popup modal without crashing", () => {
    const submitFunction = jest.fn();
    const { getByText } = render(
        <PopupModal
            description={"Example Description"}
            isVisible={true}
            submitHandler={submitFunction}
            cancelHandler={() => {}}
            cancelText={"cancel"}
            submitText={"submit"}
            title={"Test Modal"}
        ></PopupModal>
    );
    fireEvent.click(getByText("submit"));
    expect(submitFunction).toHaveBeenCalled();
});

test("cancel function is being passed into popup modal without crashing", () => {
    const cancelFunction = jest.fn();
    const { getByText } = render(
        <PopupModal
            description={"Example Description"}
            isVisible={true}
            submitHandler={() => {}}
            cancelHandler={cancelFunction}
            cancelText={"cancel"}
            submitText={"submit"}
            title={"Test Modal"}
        ></PopupModal>
    );
    fireEvent.click(getByText("cancel"));
    expect(cancelFunction).toHaveBeenCalled();
});

test("cancel and submit functions are NOT being passed into popup modal without crashing", () => {
    const { getByText } = render(
        <PopupModal
            description={"Example Description"}
            isVisible={true}
            cancelText={"cancel"}
            submitText={"submit"}
            title={"Test Modal"}
        ></PopupModal>
    );
    fireEvent.click(getByText("Example Description"));
});

test("cancel and submit text are NOT being passed into popup modal without crashing", () => {
    const cancelFunction = jest.fn();
    const submitFunction = jest.fn();
    const { getByText } = render(
        <PopupModal
            description={"Example Description"}
            isVisible={true}
            submitHandler={submitFunction}
            cancelHandler={cancelFunction}
            title={"Test Modal"}
        ></PopupModal>
    );
    fireEvent.click(getByText("Cancel"));
    fireEvent.click(getByText("Submit"));
});
