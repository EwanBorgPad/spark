import { sleep } from "k6"
import http from "k6/http"

export const options = {
  cloud: {
    distribution: {
      "amazon:it:milan": { loadZone: "amazon:it:milan", percent: 100 },
    },
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: "ramping-vus",
      gracefulStop: "20s",
      stages: [
        { target: 20, duration: "15s" },
        { target: 20, duration: "15s" },
        { target: 0, duration: "15s" },
      ],
      gracefulRampDown: "20s",
      exec: "scenario_1",
    },
  },
}

export function scenario_1() {
  const projectId = "borgy"
  const baseUrl = "https://borgpad.com/api"
  const address = "4GvgisWbCKJCFfksnU44qyRAVwd8YjxuhhsDCDSRjMnL" // test address

  // GET Requests
  http.batch([
    `${baseUrl}/investmentintentsummary?projectId=${projectId}`,
    `${baseUrl}/exchange?baseCurrency=swissborg&targetCurrency=usd`,
    `${baseUrl}/saleresults?projectId=${projectId}`,
    `${baseUrl}/deposits?address=${address}&projectId=${projectId}`,
    `${baseUrl}/depositstatus?address=${address}&projectId=${projectId}`,
    `${baseUrl}/eligibilitystatus?address=${address}&projectId=${projectId}`,
  ])
}

// POST requests
// const body1 = {
//   userWalletAddress: "Ee5sD8JhRqLoL8rJxZG6Yf1ehHGUks91wek9nCoWUX43",
//   projectId,
//   tokenAmount: 50,
// }
// http.post("https://borgpad.com/api/createdeposittransaction", JSON.stringify(body1), {
//   headers: { "Content-Type": "application/json" },
// })