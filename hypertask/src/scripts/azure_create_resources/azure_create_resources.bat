
rem DECLARATIONS
set nameSuffix="staging4"
set nameSuffix=%nameSuffix:"=%
set planName="/subscriptions/5e4f4d8f-6a42-4457-8568-7acfd66c5e65/resourceGroups/HabitTracker/providers/Microsoft.Web/serverFarms/ASP-HabitTracker-91e6"
set subscriptionId="5e4f4d8f-6a42-4457-8568-7acfd66c5e65"
set uniqueId=%RANDOM%

rem SET ACCOUNT
call az account set --subscription %subscriptionId%

rem CREATE RESOURCE GROUP
call az group create --name hypertask-group-%nameSuffix% --location "eastus2"

rem CREATE AZURE VAULT
call az provider register -n Microsoft.KeyVault
call az keyvault create --name hypertask-vault-%nameSuffix% ^
--resource-group hypertask-group-%nameSuffix% ^
--location "eastus2"

rem CREATE APP SERVICE
call az webapp create --name hypertask%nameSuffix% ^
--plan %planName% ^
--resource-group hypertask-group-%nameSuffix% ^
--runtime "DOTNETCORE|3.1"

rem CREATE INSIGHTS
call az monitor app-insights component create --app hypertask-insights-%nameSuffix% ^
--location eastus2 ^
--kind web ^
-g hypertask-group-%nameSuffix% ^
--application-type web

rem CREATE DATABASE
call az cosmosdb create ^
-n hypertask-db-%nameSuffix% ^
-g hypertask-group-%nameSuffix% ^
--kind MongoDB ^
--server-version 3.6 ^
--default-consistency-level Eventual ^
--locations regionName="eastus2" failoverPriority=0 isZoneRedundant=False

rem CREATE TASK_TODO COLLECTION
call az cosmosdb mongodb collection create ^
--account-name hypertask-db-%nameSuffix% ^
--database-name hypertask ^
--name task_todo ^
--resource-group hypertask-group-%nameSuffix% ^
--idx @src/scripts/azure_create_resources/idxpolicy-task_todo.json

rem CREATE TASK_GROUP
call az cosmosdb mongodb collection create ^
--account-name hypertask-db-%nameSuffix% ^
--database-name hypertask ^
--name task_group ^
--resource-group hypertask-group-%nameSuffix% ^
--idx @src/scripts/azure_create_resources/idxpolicy-task_group.json

rem CREATE USER COLLECTION
call az cosmosdb mongodb collection create ^
--account-name hypertask-db-%nameSuffix% ^
--database-name hypertask ^
--name user ^
--resource-group hypertask-group-%nameSuffix% ^
--idx @src/scripts/azure_create_resources/idxpolicy-user.json

rem GET CONNECTION STRING
set command="az cosmosdb keys list --type connection-strings --name hypertask-db-%nameSuffix% --resource-group hypertask-group-%nameSuffix%"
FOR /F "tokens=* USEBACKQ" %%F IN ('%command%') DO (
echo allo1
SET var=%%F
echo var
)
echo allo2
ECHO %var%

rem GET INSIGHTS INSTRUMENTATION KEY

rem GET FIREBASE

rem GET AZURE DEVOPS PERSONNAL TOKEN

rem CREATE VAULT SECRETS
call az keyvault secret set --name hypertask-mongo-connection
--vault-name hypertask-vault-%nameSuffix%
--value VAR