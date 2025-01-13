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

  const req1 = {
    method: "GET",
    url: `https://borgpad.com/launch-pools/${projectId}`,
  }
  const req2 = {
    method: "GET",
    url: `https://borgpad.com/api/investmentintentsummary?projectId=${projectId}`,
  }
  const req3 = {
    method: "GET",
    url: `https://borgpad.com/api/exchange?baseCurrency=swissborg&targetCurrency=usd`,
  }
  const req4 = {
    method: "GET",
    url: `https://borgpad.com/api/saleresults?projectId=${projectId}`,
  }
  const req5 = {
    method: "GET",
    url: `https://borgpad.com/api/deposits?address=4GvgisWbCKJCFfksnU44qyRAVwd8YjxuhhsDCDSRjMnL&projectId=${projectId}`,
  }
  const req6 = {
    method: "GET",
    url: `https://borgpad.com/api/deposits?address=4GvgisWbCKJCFfksnU44qyRAVwd8YjxuhhsDCDSRjMnL&projectId=${projectId}`,
  }
  const req7 = {
    method: "GET",
    url: `https://borgpad.com/api/depositstatus?address=4GvgisWbCKJCFfksnU44qyRAVwd8YjxuhhsDCDSRjMnL&projectId=${projectId}`,
  }
  const req8 = {
    method: "GET",
    url: `https://borgpad.com/api/eligibilitystatus?address=4GvgisWbCKJCFfksnU44qyRAVwd8YjxuhhsDCDSRjMnL&projectId=${projectId}`,
  }

  const body1 = {
    userWalletAddress: "Ee5sD8JhRqLoL8rJxZG6Yf1ehHGUks91wek9nCoWUX43",
    projectId,
    tokenAmount: 50,
  }

  http.post("https://borgpad.com/api/createdeposittransaction", JSON.stringify(body1), {
    headers: { "Content-Type": "application/json" },
  })
  http.batch([req1, req2, req3, req4, req5, req6, req7, req8])

  sleep(1)
}
