import { useMemo } from "react"
import { useMyProperties, useUpdatePropertyStatus } from "@/lib/queries"
import { CRMColumn } from "./CRMColumn"
import { CRM_STATUSES, type CRMStatus, type CRMBoardProperty } from "@/types/crm"

export function CRMBoard() {
  const { data, isLoading, isError, error } = useMyProperties()
  const properties = data?.data ?? []
  const updateStatus = useUpdatePropertyStatus()

  const grouped = useMemo(() => {
    const map: Record<CRMStatus, CRMBoardProperty[]> = {} as Record<CRMStatus, CRMBoardProperty[]>
    CRM_STATUSES.forEach((s) => (map[s] = []))
    properties.forEach((p) => map[p.status]?.push(p))
    return map
  }, [properties])

  if (isError) {
    return <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">Error: {String(error)}</div>
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" data-testid="crm-board">
      {CRM_STATUSES.map((status) => (
        <CRMColumn key={status} status={status} properties={grouped[status]} onStatusChange={(id, ns) => updateStatus.mutate({ id, status: ns })} loading={isLoading} />
      ))}
    </div>
  )
}
