import { render, screen } from "testing/utils"; // Import your testing utilities here
import IncidentForm from "./IncidentForm";
import configureStore, { MockStore } from "redux-mock-store";

describe("IncidentForm", () => {
    const mockStore = configureStore<any>([]);
    let store: MockStore<any>;

    beforeEach(() => {
        store = mockStore({
            yourReducerKey: {
                id: 10,
                quantityRequested: 3,
                quantityGranted: 2,
            },
        });
    });

    it("renders correctly when searchParams is empty", () => {
        render(<IncidentForm />);

        // Assert that the component renders nothing when searchParams is empty
        expect(screen.queryByText("Item Incident Form")).toBeNull(); // Update the text according to your component's content
    });

    it("renders IncidentFormRender when searchParams is not empty", () => {
        const mockSearchParams: any = {
            get: jest.fn(() =>
                JSON.stringify({ id: 10, quantityRequested: 3, quantityGranted: 2 })
            ),
            toString: jest.fn(() => "mockQueryString"),
        };

        jest.spyOn(global, "URLSearchParams").mockImplementation(
            () => mockSearchParams
        );

        render(<IncidentForm />);

        // Assert that mockSearchParams methods are called
        expect(mockSearchParams.toString).toHaveBeenCalled();
        expect(mockSearchParams.get).toHaveBeenCalledWith("data");

        // Assert that the component renders IncidentFormRender
        expect(screen.queryByText("Item Incident Form")).toBeInTheDocument(); // Update the text according to your component's content

        // Renders all form components
        const radios = screen.getAllByRole("radio");
        const dropdown = screen.getByTestId("qty-dropdown");
        const textareas = screen.getAllByRole("textbox");

        expect(radios).toHaveLength(3); // three radio buttons
        expect(dropdown).toBeInTheDocument(); // one dropdown
        expect(textareas).toHaveLength(3); // three text inputs

        // Renders submit button
        const submitButton = screen.getByRole("button", { name: "Submit" });
        expect(submitButton).toBeInTheDocument();
    });
});
