import React from "react";
import ProductOverview, {
    DetailInfoSection,
    EnhancedAddToCartForm,
} from "./ProductOverview";
import {
    mockAdminUser,
    mockCartItems,
    mockCategories,
    mockHardware,
    mockUser,
} from "testing/mockData";
import {
    render,
    fireEvent,
    waitFor,
    makeStoreWithEntities,
    promiseResolveWithDelay,
    when,
    makeMockApiResponse,
} from "testing/utils";
import { cartSelectors } from "slices/hardware/cartSlice";
import { SnackbarProvider } from "notistack";
import SnackbarNotifier from "components/general/SnackbarNotifier/SnackbarNotifier";
import { get } from "api/api";
import { getUpdatedHardwareDetails } from "slices/hardware/hardwareSlice";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;

const mockHardwareSignOutStartDate = jest.fn();
const mockHardwareSignOutEndDate = jest.fn();
jest.mock("constants.js", () => ({
    get hardwareSignOutStartDate() {
        return mockHardwareSignOutStartDate();
    },
    get hardwareSignOutEndDate() {
        return mockHardwareSignOutEndDate();
    },
}));

export const mockHardwareSignOutDates = (
    numDaysRelativeToStart?: number,
    numDaysRelativeToEnd?: number
): {
    start: Date;
    end: Date;
} => {
    const currentDate = new Date();
    const start = new Date();
    const end = new Date();
    start.setDate(currentDate.getDate() + (numDaysRelativeToStart ?? -1));
    end.setDate(currentDate.getDate() + (numDaysRelativeToEnd ?? 1));
    mockHardwareSignOutStartDate.mockReturnValue(start);
    mockHardwareSignOutEndDate.mockReturnValue(end);
    return { start, end };
};

describe("<ProductOverview />", () => {
    test("all 3 parts of the product overview is there", async () => {
        const store = makeStoreWithEntities({
            hardwareState: {
                isUpdateDetailsLoading: false,
                hardwareIdInProductOverview: 1,
            },
            ui: {
                inventory: {
                    isProductOverviewVisible: true,
                },
            },
            hardware: mockHardware,
            categories: mockCategories,
        });

        const { getByText } = render(<ProductOverview showAddToCartButton />, {
            store,
        });

        // Check if the main section, detailInfoSection, and add to cart section works
        expect(getByText("Category")).toBeInTheDocument();
        expect(getByText("Datasheet")).toBeInTheDocument();
        expect(getByText("Add to cart")).toBeInTheDocument();
    });

    test("Category label doesn't appear when there are no categories", async () => {
        mockHardware[0].categories = [];
        const store = makeStoreWithEntities({
            hardwareState: {
                isUpdateDetailsLoading: false,
                hardwareIdInProductOverview: 1,
            },
            ui: {
                inventory: {
                    isProductOverviewVisible: true,
                },
            },
            hardware: mockHardware,
            categories: mockCategories,
        });

        const { queryByText } = render(<ProductOverview showAddToCartButton />, {
            store,
        });

        expect(queryByText("Category")).not.toBeInTheDocument();
    });

    test("Displays a loader when loading", async () => {
        const apiResponse = makeMockApiResponse({ ...mockHardware[1], id: 1 }, 200);

        when(mockedGet)
            .calledWith("/api/hardware/hardware/1/")
            .mockReturnValue(promiseResolveWithDelay(apiResponse, 500));

        const store = makeStoreWithEntities({
            hardwareState: {
                isUpdateDetailsLoading: false,
            },
            ui: {
                inventory: {
                    isProductOverviewVisible: true,
                },
            },
            hardware: mockHardware,
        });

        const { getByText, queryByTestId } = render(
            <ProductOverview showAddToCartButton />,
            { store }
        );

        store.dispatch(getUpdatedHardwareDetails(1));

        await waitFor(() => {
            expect(queryByTestId("circular-progress")).toBeInTheDocument();
        });

        // After results have loaded, loader  should disappear
        await waitFor(() => {
            expect(queryByTestId("circular-progress")).not.toBeInTheDocument();
            expect(getByText(mockHardware[1].name)).toBeInTheDocument();
        });
    });

    test("all 3 parts of the product overview is there when hardware has no optional fields", () => {
        const store = makeStoreWithEntities({
            hardwareState: {
                isUpdateDetailsLoading: false,
                hardwareIdInProductOverview: mockHardware[9].id,
            },
            ui: {
                inventory: {
                    isProductOverviewVisible: true,
                },
            },
            hardware: mockHardware,
            categories: mockCategories,
        });

        const { getByText, queryByText } = render(
            <ProductOverview showAddToCartButton />,
            {
                store,
            }
        );

        // Check if the main section, detailInfoSection, and add to cart section works
        expect(getByText("Category")).toBeInTheDocument();
        expect(getByText("Datasheet")).toBeInTheDocument();
        expect(getByText("Add to cart")).toBeInTheDocument();
        expect(queryByText("Notes")).not.toBeInTheDocument();
    });

    test("minimum constraint between hardware and categories is used", () => {
        const store = makeStoreWithEntities({
            hardware: [mockHardware[0]],
            categories: mockCategories,
            hardwareState: {
                isUpdateDetailsLoading: false,
                hardwareIdInProductOverview: mockHardware[0].id,
            },
            ui: {
                inventory: {
                    isProductOverviewVisible: true,
                },
            },
        });

        const minConstraint: number = mockCategories
            .map(
                (category) =>
                    category.max_per_team ?? mockHardware[0].quantity_remaining
            )
            .concat(mockHardware[0].max_per_team ? [mockHardware[0].max_per_team] : [])
            .reduce((prev, curr) => Math.min(prev, curr));

        const { getByText, queryByText, getByRole } = render(
            <ProductOverview showAddToCartButton={true} />,
            {
                store,
            }
        );

        fireEvent.mouseDown(getByRole("button", { name: "Qty 1" }));

        expect(queryByText(minConstraint + 1)).not.toBeInTheDocument();
        expect(getByText(minConstraint)).toBeInTheDocument();
    });

    it("displays error message when unable to get hardware", async () => {
        const failureResponse = {
            response: {
                status: 500,
                message: "Something went wrong",
            },
        };

        mockedGet.mockRejectedValue(failureResponse);

        const store = makeStoreWithEntities({
            hardware: mockHardware,
            hardwareState: {
                isUpdateDetailsLoading: false,
            },
            ui: {
                inventory: {
                    isProductOverviewVisible: true,
                },
            },
        });

        const { getByText } = render(<ProductOverview showAddToCartButton />, {
            store,
        });

        store.dispatch(getUpdatedHardwareDetails(1));

        await waitFor(() => {
            expect(
                getByText(
                    "Unable to display hardware. Please refresh the page and try again."
                )
            ).toBeInTheDocument();
        });
    });

    test("Add to Cart button adds hardware to cart store", async () => {
        const store = makeStoreWithEntities({
            hardware: [mockHardware[0]],
            categories: mockCategories,
            hardwareState: {
                isUpdateDetailsLoading: false,
                hardwareIdInProductOverview: mockHardware[0].id,
            },
            ui: {
                inventory: {
                    isProductOverviewVisible: true,
                },
            },
        });

        const { getByText } = render(
            <SnackbarProvider>
                <SnackbarNotifier />
                <ProductOverview showAddToCartButton />
            </SnackbarProvider>,
            {
                store,
            }
        );

        // by default, quantity is 1
        const button = getByText("Add to cart");

        await waitFor(() => {
            fireEvent.click(button);
        });

        expect(cartSelectors.selectAll(store.getState())).toEqual([
            { hardware_id: mockHardware[0].id, quantity: 1 },
        ]);
        expect(
            getByText(`Added 1 ${mockHardware[0].name} item(s) to your cart.`)
        ).toBeInTheDocument();
    });

    test("Add to Cart button doesn't add hardware if user exceeds max per team limit", async () => {
        const store = makeStoreWithEntities({
            hardware: [mockHardware[0]],
            categories: mockCategories,
            hardwareState: {
                isUpdateDetailsLoading: false,
                hardwareIdInProductOverview: mockHardware[0].id,
            },
            ui: {
                inventory: {
                    isProductOverviewVisible: true,
                },
            },
            cartItems: mockCartItems,
        });

        const { getByText } = render(
            <SnackbarProvider>
                <SnackbarNotifier />
                <ProductOverview showAddToCartButton />
            </SnackbarProvider>,
            {
                store,
            }
        );

        expect(
            getByText(
                `You currently have ${mockCartItems.length} of this item in your cart.`
            )
        );

        // by default, quantity is 1
        const button = getByText("Add to cart");

        await waitFor(() => {
            fireEvent.click(button);
        });

        expect(cartSelectors.selectAll(store.getState())).toEqual(mockCartItems);
        expect(
            getByText(
                "Adding this amount to your cart will exceed the quantity limit for this item."
            )
        ).toBeInTheDocument();
    });

    it("Displays quantityAvailable if admin user", () => {
        const store = makeStoreWithEntities({
            hardwareState: {
                isUpdateDetailsLoading: false,
                hardwareIdInProductOverview: 1,
            },
            ui: {
                inventory: {
                    isProductOverviewVisible: true,
                },
            },
            hardware: mockHardware,
            user: {
                userData: {
                    user: mockAdminUser,
                    isLoading: false,
                    error: null,
                },
            },
        });

        const { getByText } = render(<ProductOverview showAddToCartButton />, {
            store,
        });

        expect(
            getByText(
                `${mockHardware[0].quantity_remaining} OF ${mockHardware[0].quantity_available} IN STOCK`
            )
        ).toBeInTheDocument();
    });

    it("Displays only quantity remaining if participant user", () => {
        const store = makeStoreWithEntities({
            hardwareState: {
                isUpdateDetailsLoading: false,
                hardwareIdInProductOverview: 1,
            },
            ui: {
                inventory: {
                    isProductOverviewVisible: true,
                },
            },
            hardware: mockHardware,
            user: {
                userData: {
                    user: mockUser,
                    isLoading: false,
                    error: null,
                },
            },
        });

        const { getByText } = render(<ProductOverview showAddToCartButton />, {
            store,
        });

        expect(
            getByText(`${mockHardware[0].quantity_remaining} IN STOCK`)
        ).toBeInTheDocument();
    });
});

describe("<EnhancedAddToCartForm />", () => {
    test("button and select are disabled if quantityAvailable is 0", () => {
        const { getByText, getByLabelText } = render(
            <EnhancedAddToCartForm
                quantityRemaining={0}
                maxPerTeam={null}
                hardwareId={1}
                name="Arduino"
            />
        );

        const button = getByText("Add to cart").closest("button");
        const select = getByLabelText("Qty");

        expect(button).toBeDisabled();
        expect(select).toHaveClass("Mui-disabled");
    });

    test("button and select are disabled if minimum constraint is 0", () => {
        const { getByText, getByLabelText } = render(
            <EnhancedAddToCartForm
                quantityRemaining={3}
                maxPerTeam={0}
                hardwareId={1}
                name="Arduino"
            />
        );

        const button = getByText("Add to cart").closest("button");
        const select = getByLabelText("Qty");

        expect(button).toBeDisabled();
        expect(select).toHaveClass("Mui-disabled");
    });

    test("dropdown values are minimum between quantityAvailable and max per team", () => {
        const { queryByText, getByText, getByRole } = render(
            <EnhancedAddToCartForm
                quantityRemaining={3}
                maxPerTeam={2}
                hardwareId={1}
                name="Arduino"
            />
        );

        fireEvent.mouseDown(getByRole("button", { name: "Qty 1" }));

        expect(queryByText("3")).not.toBeInTheDocument();
        expect(getByText("2")).toBeInTheDocument();
    });

    test("dropdown value defaults to quantityAvailable when maxPerTeam is null", () => {
        const { getByText, getByRole } = render(
            <EnhancedAddToCartForm
                quantityRemaining={3}
                maxPerTeam={null}
                hardwareId={1}
                name="Arduino"
            />
        );

        fireEvent.mouseDown(getByRole("button", { name: "Qty 1" }));

        expect(getByText("3")).toBeInTheDocument();
    });

    test("button is disabled if date is not within hardware sign out period", () => {
        mockHardwareSignOutDates(5, 10);
        const { getByText } = render(
            <EnhancedAddToCartForm
                quantityRemaining={3}
                maxPerTeam={5}
                hardwareId={1}
                name="Arduino"
            />
        );

        const button = getByText("Add to cart").closest("button");
        expect(button).toBeDisabled();
    });
});

describe("<DetailInfoSection />", () => {
    test("constraints title doesn't appear when there are no constraints", () => {
        const { queryByText } = render(
            <DetailInfoSection
                manufacturer="ABC Corp"
                modelNumber="12345"
                datasheet="datasheet"
                constraints={[]}
            />
        );
        expect(queryByText("Constraints")).not.toBeInTheDocument();
    });
});
