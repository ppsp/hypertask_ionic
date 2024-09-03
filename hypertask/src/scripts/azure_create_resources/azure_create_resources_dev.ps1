# ********************************************************
# *** This file will not work without secrets-dev.json ***
# ********************************************************


Write-Output "DECLARATIONS"
$nameSuffix="dev4"
$environmentSetting="Development"
$appServiceName="hypertask$nameSuffix"

Write-Output "GET VARIABLES FROM secrets-dev.json"
$json = (Get-Content ".\src\scripts\azure_create_resources\secrets-dev.json" -Raw) | ConvertFrom-Json
$subscriptionResourceId = $json.subscriptionResourceId;
$subscriptionId = $json.subscriptionId;
$azurePipelineServicePrincipalId = $json.azurePipelineServicePrincipalId;

Write-Output "SET ACCOUNT"
az account set --subscription $subscriptionId
#Connect-AzAccount

Write-Output "CREATE RESOURCE GROUP"
az group create --name hypertask-group-$nameSuffix --location "eastus2"

Write-Output "CREATE AZURE VAULT"
az provider register -n Microsoft.KeyVault
az keyvault create --name hypertask-vault-$nameSuffix `
--enabled-for-deployment true `
--resource-group hypertask-group-$nameSuffix `
--location "eastus2"

Write-Output "CREATE APP SERVICE"
$appService = az webapp create --name $appServiceName `
--plan $subscriptionResourceId `
--resource-group hypertask-group-$nameSuffix `
--assign-identity [system] `
--runtime '"DOTNETCORE|3.1"'

Write-Output "ADD ENVIRONMENT VARIABLE - ASPNETCORE_ENVIRONMENT"
az webapp config appsettings set --name $appServiceName `
--resource-group hypertask-group-$nameSuffix `
--settings ASPNETCORE_ENVIRONMENT=$environmentSetting

Write-Output "ADD ENVIRONMENT VARIABLE AZURE_VAULT_NAME"
az webapp config appsettings set --name $appServiceName `
--resource-group hypertask-group-$nameSuffix `
--settings AZURE_VAULT_NAME=hypertask-vault-$nameSuffix

Write-Output "CREATE INSIGHTS"
$output = az monitor app-insights component create --app hypertask-insights-$nameSuffix `
--location eastus2 `
--kind web `
--resource-group hypertask-group-$nameSuffix `
--application-type web

Write-Output "ADD APPLICATION INSIGHTS TO WEB APP"
az feature register --name AIWorkspacePreview --namespace microsoft.insights
az provider register -n microsoft.insights
[String]$instrumentationKey = (az monitor app-insights component show --app hypertask-insights-$nameSuffix --resource-group hypertask-group-$nameSuffix --query  "instrumentationKey" --output tsv)
az webapp config appsettings set `
--name $appServiceName `
--resource-group hypertask-group-$nameSuffix `
--settings APPINSIGHTS_INSTRUMENTATIONKEY=$instrumentationKey APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=$instrumentationKey ApplicationInsightsAgent_EXTENSION_VERSION=~2

Write-Output "CREATE DATABASE"
az cosmosdb create `
--name hypertask-db-$nameSuffix `
--resource-group hypertask-group-$nameSuffix `
--kind MongoDB `
--server-version 3.6 `
--default-consistency-level Eventual `
--locations regionName="eastus2" failoverPriority=0 isZoneRedundant=False
#--enable-free-tier true ` only prod free we only have 1

Write-Output "CREATE TASK_TODO COLLECTION"
az cosmosdb mongodb collection create `
--account-name hypertask-db-$nameSuffix `
--database-name hypertask `
--name task_todo `
--resource-group hypertask-group-$nameSuffix `
--idx @src/scripts/azure_create_resources/idxpolicy-task_todo.json

Write-Output "CREATE TASK_GROUP"
az cosmosdb mongodb collection create `
--account-name hypertask-db-$nameSuffix `
--database-name hypertask `
--name task_group `
--resource-group hypertask-group-$nameSuffix `
--idx @src/scripts/azure_create_resources/idxpolicy-task_group.json

Write-Output "CREATE USER COLLECTION"
az cosmosdb mongodb collection create `
--account-name hypertask-db-$nameSuffix `
--database-name hypertask `
--name user `
--resource-group hypertask-group-$nameSuffix `
--idx @src/scripts/azure_create_resources/idxpolicy-user.json

Write-Output "GET CONNECTION STRING"
$output = az cosmosdb keys list --type connection-strings --name hypertask-db-$nameSuffix --resource-group hypertask-group-$nameSuffix
Write-Output $output
$formattedOutput = $output | ConvertFrom-Json
$connectionString = $formattedOutput.connectionStrings[0].connectionString
Write-Output $connectionString

Write-Output "CREATE VAULT SECRET - MONGO CONNECTION STRING"
az keyvault secret set --name hypertask-mongo-connection `
--vault-name hypertask-vault-$nameSuffix `
--value $connectionString

Write-Output "CREATE VAULT SECRET - INSIGHTS API KEY"
Write-Output InstrumentationKey=$instrumentationKey
az keyvault secret set --name hypertask-insights-api-key `
--vault-name hypertask-vault-$nameSuffix `
--value InstrumentationKey=$instrumentationKey

Write-Output "CREATE VAULT SECRET - AZURE DEVOPS TOKEN"
$output = az keyvault secret show --name "ppspserviceprincipalkey" --vault-name "HabitTrackerVaultUsEast2"
Write-Output $output
$formattedOutput = $output | ConvertFrom-Json
$token = $formattedOutput.value
Write-Output $token
az keyvault secret set --name hypertask-azure-devops-personnal-token `
--vault-name hypertask-vault-$nameSuffix `
--value $token

Write-Output "CREATE VAULT SECRET - FIREBASE API KEY"
$output = az keyvault secret show --name "firebase-pp-app" --vault-name "HabitTrackerVaultUsEast2"
Write-Output $output
$formattedOutput = $output | ConvertFrom-Json
$apiKey = $formattedOutput.value
$secureString = ConvertTo-SecureString $apiKey -AsPlainText -Force
Set-AzKeyVaultSecret -VaultName hypertask-vault-$nameSuffix -Name 'hypertask-firebase' -SecretValue $secureString

Write-Output "GIVE ACCESS TO VAULT FROM WEB APP"
$formattedOutput = $appService | ConvertFrom-Json
$appServiceId = $formattedOutput.identity.principalId
Write-Output "APP SERVICE OBJECT ID"
Write-Output $appServiceId
az keyvault set-policy --name hypertask-vault-$nameSuffix `
--object-id $appServiceId `
--secret-permissions get list `
--key-permissions get list

Write-Output "GIVE ACCESS TO VAULT FROM AZURE PIPELINE"
az keyvault set-policy --name hypertask-vault-$nameSuffix `
--spn $azurePipelineServicePrincipalId `
--secret-permissions get list `
--key-permissions get list