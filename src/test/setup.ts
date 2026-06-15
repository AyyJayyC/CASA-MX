import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, beforeAll, afterAll } from "vitest"
import { setupServer } from "msw/node"

export const mswServer = setupServer()

beforeAll(() => mswServer.listen({ onUnhandledRequest: "error" }))
afterEach(() => { cleanup(); mswServer.resetHandlers() })
afterAll(() => mswServer.close())
