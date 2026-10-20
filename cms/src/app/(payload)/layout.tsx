/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. MODIFY AT YOUR OWN RISK. */
import type { ReactNode } from 'react'

import config from '@payload-config'
import { RootLayout } from '@payloadcms/next/layouts'
import { importMap } from './importMap'
import { serverFunction } from './actions'

type Args = {
  children: ReactNode
}

const Layout = ({ children }: Args) =>
  RootLayout({
    config,
    importMap,
    children,
    serverFunction,
  })

export default Layout
