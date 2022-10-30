import type { NextRequest } from 'next/server'
import logger from './utils/logger'

export function middleware(req: NextRequest) {
    logger.info({ type: 'access_log', url: req.url })
}
