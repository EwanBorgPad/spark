const ELIGIBILITY_STATUS_CACHE_BUST_KEY = "eligibility-status-cache-bust"

export const eligibilityStatusCacheBust = {
  getCacheStatus: () => localStorage.getItem(ELIGIBILITY_STATUS_CACHE_BUST_KEY),
  invokeCacheBusting: () => localStorage.setItem(ELIGIBILITY_STATUS_CACHE_BUST_KEY, "1"),
  removeCacheBustStatus: () => localStorage.removeItem(ELIGIBILITY_STATUS_CACHE_BUST_KEY),
}
