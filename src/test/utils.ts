import { act } from "@testing-library/react"

export async function waitForQuery() {
  await act(() => Promise.resolve())
}
