import React from "react";
import { render } from "@testing-library/react";
import Inventory from "pages/Inventory/Inventory";
import { withStoreAndRouter } from "testing/utils";
import { mockHardware } from "testing/mockData";

import { get } from "api/api";

jest.mock("api/api");

describe("Inventory Page", () => {
    it("Clears filters and fetches fresh data on load", () => {});
});
