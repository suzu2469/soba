import { Browser as Logtail } from '@logtail/js'
import { Component, ErrorInfo } from 'react'

class ErrorBoundary extends Component<any, { hasError: boolean }> {
    logger: Logtail

    constructor(props: any) {
        super(props)
        this.logger = new Logtail('Hi3rKYCi6NpVNn2jAZWe3jQ2')
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.logger.error(error)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div>
                    <h2>an error has occured</h2>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
