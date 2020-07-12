import React from "react";
import { render } from "@testing-library/react";

import { UnconnectedSnackbarNotifier } from "./SnackbarNotifier";

describe("<UnconnectedSnackbarNotifier />", () => {
    let snackbar1, snackbar2;

    beforeEach(() => {
        snackbar1 = { message: "I am first", options: { key: 1 }, dismissed: false };
        snackbar2 = { message: "I am second", options: { key: 2 }, dismissed: false };
    });

    it("Calls enqueueSnackbar for each snackbar passed in", () => {
        const enqueueSnackbarSpy = jest.fn();
        render(
            <UnconnectedSnackbarNotifier
                snackbars={[snackbar1, snackbar2]}
                enqueueSnackbar={enqueueSnackbarSpy}
            />
        );

        expect(enqueueSnackbarSpy.mock.calls).toEqual([
            [snackbar1.message, expect.objectContaining(snackbar1.options)],
            [snackbar2.message, expect.objectContaining(snackbar2.options)],
        ]);
    });

    it("Calls closeSnackbar and not enqueueSnackbar for dismissed snackbars", () => {
        const enqueueSnackbarSpy = jest.fn();
        const closeSnackbarSpy = jest.fn();
        snackbar1.dismissed = true;
        render(
            <UnconnectedSnackbarNotifier
                snackbars={[snackbar1, snackbar2]}
                enqueueSnackbar={enqueueSnackbarSpy}
                closeSnackbar={closeSnackbarSpy}
            />
        );

        expect(enqueueSnackbarSpy).toHaveBeenCalledTimes(1);
        expect(enqueueSnackbarSpy).toHaveBeenCalledWith(
            snackbar2.message,
            expect.objectContaining(snackbar2.options)
        );
        expect(closeSnackbarSpy).toHaveBeenCalledTimes(1);
        expect(closeSnackbarSpy).toHaveBeenCalledWith(snackbar1.options.key);
    });

    it("Does not enqueue snackbars that have already been enqueued", () => {
        const enqueueSnackbarSpy = jest.fn();
        const { rerender } = render(
            <UnconnectedSnackbarNotifier
                snackbars={[snackbar1]}
                enqueueSnackbar={enqueueSnackbarSpy}
            />
        );

        enqueueSnackbarSpy.mockClear(); // Reset the spy after its first call
        rerender(
            <UnconnectedSnackbarNotifier
                snackbars={[snackbar1, snackbar2]}
                enqueueSnackbar={enqueueSnackbarSpy}
            />
        );

        expect(enqueueSnackbarSpy).toHaveBeenCalledTimes(1);
        expect(enqueueSnackbarSpy).toHaveBeenCalledWith(
            snackbar2.message,
            expect.objectContaining(snackbar2.options)
        );
    });
});
