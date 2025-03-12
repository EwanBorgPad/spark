import http from "k6/http"

export const options = {
  cloud: {
    projectId: 3747037, // borgpad project in organization
    distribution: {
      "amazon:fr:paris": { loadZone: "amazon:fr:paris", percent: 34 },
      "amazon:it:milan": { loadZone: "amazon:it:milan", percent: 33 },
      "amazon:de:frankfurt": { loadZone: "amazon:de:frankfurt", percent: 33 },
    },
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: "ramping-vus",
      gracefulStop: "20s",
      stages: [
        { target: 500, duration: "7s" },
        { target: 500, duration: "2s" },
        { target: 0, duration: "7s" },
      ],
      gracefulRampDown: "20s",
      exec: "scenario_1",
    },
  },
}

// LOAD CONFIG
const cluster = "mainnet"
const projectId = "hidden-agentlauncher-test-9891843819"
const baseUrl = "https://borgpad.com/api"
const address = "4GvgisWbCKJCFfksnU44qyRAVwd8YjxuhhsDCDSRjMnL" // test address
const raisedTokenDataName = "usd"

export function scenario_1() {
  // GET Requests
  http.batch([
    `${baseUrl}/rpcproxy?cluster=${cluster}`,
    `${baseUrl}/investmentintentsummary?projectId=${projectId}`,
    `${baseUrl}/exchange?baseCurrency=${raisedTokenDataName}&targetCurrency=usd`,
    `${baseUrl}/saleresults?projectId=${projectId}`,
    `${baseUrl}/deposits?address=${address}&projectId=${projectId}`,
    `${baseUrl}/depositstatus?address=${address}&projectId=${projectId}`,
    `${baseUrl}/eligibilitystatus?address=${address}&projectId=${projectId}&cache-bust=${new Date().getTime()}`,
  ])
  // POST requests example
  // const body1 = {
  //   userWalletAddress: address,
  //   projectId,
  //   tokenAmount: 50,
  // }
  // http.post("https://borgpad.com/api/createdeposittransaction", JSON.stringify(body1), {
  //   headers: { "Content-Type": "application/json" },
  // })
}

