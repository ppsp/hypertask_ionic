Write-Output "DECLARATIONS"
Set-Variable -Name "nameSuffix" -Value "stag9"
Set-Variable -Name "apkUrlValue" -Value "https://hypertask$nameSuffix.azurewebsites.net/staticfiles/hypertask.apk"
Set-Variable -Name "apiUrlValue" -Value "https://hypertask$nameSuffix.azurewebsites.net/"
Set-Variable -Name "updateXmlName" -Value "hypertask-update-stage.xml"
Set-Variable -Name "apiUpdateXmlUrlValue" -Value "https://hypertask$nameSuffix.azurewebsites.net/staticfiles/hypertask-update.xml"
Set-Variable -Name "configValue" -Value "staging"

Write-Output "GET VERSION VALUE"
$xml = [xml](Get-Content ".\config.xml")
$versionValues = $xml.widget.version.split(".")
$first=$versionValues[0];
if ($versionValues[0].length -eq 1) {
  $first="0"+$versionValues[0]
}
$second=$versionValues[1];
if ($versionValues[1].length -eq 1) {
  $second="0"+$versionValues[1]
}
$third=$versionValues[2];
if ($versionValues[2].length -eq 1) {
  $third="0"+$versionValues[2]
}
$versionText="$first$second$third"

Write-Output "GENERATE UPDATE XML"
Remove-Item ".\src\scripts\$updateXmlName"
Copy-Item ".\src\scripts\hypertask-update.xml" -Destination ".\src\scripts\$updateXmlName"
(Get-Content -path .\src\scripts\$updateXmlName -Raw) -replace 'versionValue',"$versionText" | Set-Content -Path .\src\scripts\$updateXmlName
(Get-Content -path .\src\scripts\$updateXmlName -Raw) -replace 'apkUrlValue',"$apkUrlValue" | Set-Content -Path .\src\scripts\$updateXmlName
