Write-Output "DECLARATIONS"
Set-Variable -Name "nameSuffix" -Value "stag7"
Set-Variable -Name "planName" -Value "/subscriptions/5e4f4d8f-6a42-4457-8568-7acfd66c5e65/resourceGroups/HabitTracker/providers/Microsoft.Web/serverFarms/ASP-HabitTracker-91e6"
Set-Variable -Name "subscriptionId" -Value "5e4f4d8f-6a42-4457-8568-7acfd66c5e65"
Set-Variable -Name "uniqueId" -Value "81278"

(gc hypertask-update-stage.xml) -replace 'foo', 'bar' | Out-File -encoding ASCII myFile.txt