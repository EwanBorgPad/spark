//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// READ THIS BEFORE USING SCRIPT /////////////////////////////////////////
// only latest "main" and "stage" deployment will not be removed, so /////
// if there are any new exceptions, please add them in the script below; /
// cleans max 10 deployments per script execution ////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

/* eslint-disable no-undef */
/* eslint-disable no-console */

// Cloudflare API information
const API_TOKEN = process.env.VITE_DEPLOYMENTS_API_TOKEN
const ACCOUNT_ID = process.env.VITE_ACCOUNT_ID
const PROJECT_NAME = process.env.VITE_PROJECT_NAME

// Cloudflare API URLs
const CLOUDFLARE_API_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments`

const headers = {
  Authorization: `Bearer ${API_TOKEN}`,
  "Content-Type": "application/json",
}

// Function to get all deployments
async function getDeployments() {
  const response = await fetch(CLOUDFLARE_API_URL, {
    method: "GET",
    headers,
  })
  const data = await response.json()
  return data.result
}

// Function to delete a deployment
async function deleteDeployment(deploymentId) {
  const deleteUrl = `${CLOUDFLARE_API_URL}/${deploymentId}`
  await fetch(deleteUrl, {
    method: "DELETE",
    headers,
  })
  console.log(`Deleted deployment: ${deploymentId}`)
}

// Main function to clean up old deployments
async function cleanDeployments() {
  const deployments = await getDeployments()
  console.log(deployments)

  // Filter for 'main' branch deployments
  const mainDeployments = deployments.filter(
    (deployment) => deployment.deployment_trigger.metadata.branch === "main",
  )
  const stageDeployments = deployments.filter(
    (deployment) => deployment.deployment_trigger.metadata.branch === "stage",
  )

  // Sort deployments by creation time (latest first)
  mainDeployments.sort(
    (a, b) => new Date(b.created_on) - new Date(a.created_on),
  )
  stageDeployments.sort(
    (a, b) => new Date(b.created_on) - new Date(a.created_on),
  )

  // Keep the latest 'main' and 'stage' deployments
  const latestMainDeployment = mainDeployments[0]
  const latestStageDeployment = stageDeployments[0]

  // Delete all other deployments except the latest
  const oldDeployments = deployments.filter((deployment) => {
    return (
      deployment.id !== latestMainDeployment.id &&
      deployment.id !== latestStageDeployment.id
    )
  })

  console.log("initiating cleanup of batch of deployments")
  for (const deployment of oldDeployments) {
    await deleteDeployment(deployment.id)
  }

  console.log(`Kept latest 'main' deployment: ${latestMainDeployment.id}`)
  console.log(`Kept latest 'stage' deployment: ${latestStageDeployment.id}`)
}

// Run the cleanup script
cleanDeployments().catch(console.error)
