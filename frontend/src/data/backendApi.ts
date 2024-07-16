
const CONFIRM_RESIDENCY_URL = '/api/confirmresidency'

const confirmResidency = async ({ address }: { address: string }) => {
  const url = new URL(CONFIRM_RESIDENCY_URL, window.location.href)
  url.searchParams.set('address', address)

  await fetch(url, { method: 'post' })
}

export const backendApi = {
  confirmResidency
}
