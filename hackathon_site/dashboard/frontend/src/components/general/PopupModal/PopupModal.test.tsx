import { render } from "testing/utils";
import PopupModal from "./PopupModal";
import React from "react";
import { fireEvent, waitFor } from "@testing-library/react";

test("renders general popup modal without crashing", () => {
    const { getByText } = render(
        <PopupModal
            description={"Example Description"}
            isVisible={true}
            submitHandler={() => {}}
            cancelHandler={() => {}}
            cancelText={"cancel"}
            //NEW attribute inserted below called AnimationPresence
            AnimationPresence={true}
            submitText={"submit"}
            title={"Test Modal"}
        />
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
            AnimationPresence={true}
            submitText={"submit"}
            title={"Test Modal"}
        />
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
            AnimationPresence={true}
            submitText={"submit"}
            title={"Test Modal"}
        />
    );
    fireEvent.click(getByText("cancel"));
    expect(cancelFunction).toHaveBeenCalled();
});

//Note: This test is now async because it is waiting for a promise, which is when "Cancel" and "Submit" appear on the Modal
test("cancel and submit text are NOT being passed into popup modal without crashing", async () => {
    const cancelFunction = jest.fn();
    const submitFunction = jest.fn();
    const { getByText } = render(
        <PopupModal
            description={"Example Description"}
            isVisible={true}
            submitHandler={submitFunction}
            cancelHandler={cancelFunction}
            AnimationPresence={true}
            title={"Test Modal"}
        />
    );
    //New changes to test: passed in the expect() calls inside a waitFor() method, as the modal has a delay between when it is being animated
    //...and when the words "Cancel" and "Submit" are present on the Modal
    //So, we must await for this
    await waitFor(() => {
        expect(getByText("Cancel")).toBeInTheDocument();
        expect(getByText("Submit")).toBeInTheDocument();
    });
    //Commented out the last 4 lines of this test that were present prior to changes in PopupModal.tsx
    //expect(getByText("cancel")).toBeInTheDocument();
    //expect(getByText("Submit")).toBeInTheDocument();
    //fireEvent.click(getByText("Cancel"));
    //fireEvent.click(getByText("Submit"));
});
