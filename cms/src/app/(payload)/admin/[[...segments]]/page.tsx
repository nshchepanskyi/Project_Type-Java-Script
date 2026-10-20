import { handleServerFunctions } from '@payloadcms/next/layouts'
import { RootPage } from '@payloadcms/next/views'
import { importMap } from '../../importMap'
import config from '@payload-config'

const serverFunctions = handleServerFunctions({
  config,
})

type Args = {
  params: Promise<{ segments: string[] }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { segments } = await paramsPromise
  return (
    <RootPage
      config={config}
      importMap={importMap}
      params={{ segments }}
      searchParams={{}}
      serverFunction={serverFunctions}
    />
  )
}
