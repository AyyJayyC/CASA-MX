import { Component, type ReactNode } from "react"
import Link from "next/link"

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] px-4">
        <div className="text-center max-w-md">
          <p className="text-6xl mb-4">\u26A0\uFE0F</p>
          <h1 className="text-2xl font-bold text-ink mb-2">Algo salió mal</h1>
          <p className="text-ink-muted text-sm mb-6">
            Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-3 bg-clay text-white font-medium rounded-lg hover:bg-clay-dark transition-colors"
            >
              Reintentar
            </button>
            <Link href="/" className="px-6 py-3 border border-sand-dark text-ink font-medium rounded-lg hover:bg-sand-light transition-colors">
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
