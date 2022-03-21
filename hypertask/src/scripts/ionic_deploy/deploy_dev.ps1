Write-Output "DECLARATIONS"
$nameSuffix="dev1"
$apkUrlValue="https://hypertask$nameSuffix.azurewebsites.net/staticfiles/hypertask.apk"
$apiUrlValue="https://hypertask$nameSuffix.azurewebsites.net/"
$updateXmlName="hypertask-update-prod.xml"
$apiUpdateXmlUrlValue="https://hypertask$nameSuffix.azurewebsites.net/staticfiles/hypertask-update.xml"
$configValue="development"

Write-Output "GET VARIABLES FROM secrets.json"
$json = (Get-Content ".\src\scripts\ionic_deploy\secrets.json" -Raw) | ConvertFrom-Json
$keystorePassword = $json.keystorePassword;

Write-Output "TESTS"
ng test --watch=false

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

Write-Output "GENERATE ENVIRONMENT.PROD.TS"
Remove-Item "F:\GIT\hypertask-ionic\src\environments\environment.prod.ts"
Copy-Item ".\src\environments\environment.source.dev.ts" -Destination ".\src\environments\environment.prod.ts"
(Get-Content -path .\src\environments\environment.prod.ts -Raw) -replace 'apiUrlValue',"$apiUrlValue" | Set-Content -Path .\src\environments\environment.prod.ts
(Get-Content -path .\src\environments\environment.prod.ts -Raw) -replace 'apiUpdateXmlUrlValue',"$apiUpdateXmlUrlValue" | Set-Content -Path .\src\environments\environment.prod.ts
# GET INSTRUMENTATION KEY FROM AZURE ?

Write-Output "START BUILD"
ionic cordova build android --prod --release -c $configValue

Write-Output "GIT CHECKOUT DEV BRANCH"
Set-Location F:\GIT\HyperTaskWebApi
git checkout dev
git status
Set-Location F:\GIT\hypertask-ionic

Write-Output "UPDATE APPSETTINGS"
$a = Get-Content 'F:\GIT\HyperTaskWebApi\HyperTaskWebApi\appsettings.json' -raw | ConvertFrom-Json
$a.KeyVaultName = "hypertask-vault-$nameSuffix"
$a | ConvertTo-Json -depth 32| set-content 'F:\GIT\HyperTaskWebApi\HyperTaskWebApi\appsettings.dev.json'

Write-Output "DELETE TARGET APK"
if ([System.IO.File]::Exists("F:\hypertask.apk")) {
  Remove-Item F:\hypertask.apk
}

Write-Output "COPY UNSIGNED APK"
Copy-Item F:\GIT\hypertask-ionic\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk F:\app-release-unsigned.apk

Write-Output "SIGN UNSIGNED APK"
Set-Location C:\Program Files\Java\jdk1.8.0_221\bin\
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore F://my-release-key.keystore F://app-release-unsigned.apk hypertask -storepass $keystorePassword

Write-Output "ZIP APK"
F:\Android\Sdk\build-tools\29.0.2\zipalign -v 4 F:\app-release-unsigned.apk F://hypertask.apk

Write-Output "COPY APK INTO SOURCE CONTROLLED FOLDER"
Copy-Item F:\hypertask.apk F:\GIT\HyperTaskWebApi\HyperTaskWebApi\StaticFiles\hypertask.apk

Write-Output "OVERWRITE VERSION FILE"
if ([System.IO.File]::Exists("F:\GIT\HyperTaskWebApi\HyperTaskWebApi\StaticFiles\hypertask-update.xml")) {
  Remove-Item F:\GIT\HyperTaskWebApi\HyperTaskWebApi\StaticFiles\hypertask-update.xml
}
Copy-Item F:\GIT\hypertask-ionic\src\scripts\hypertask-update-stage.xml F:\GIT\HyperTaskWebApi\HyperTaskWebApi\StaticFiles\hypertask-update.xml

Write-Output "GIT STATUS"
Set-Location F:\GIT\HyperTaskWebApi
git status

Write-Output "PRESS ANY KEY"
Write-Output "LAST CHANCE TO CANCEL BEFORE COMMIT" 
PAUSE

Write-Output "GIT PUSH BRANCH"
git add .
git commit -m "- Automated dev build"
git push

Write-Output "SLEEP"
timeout /t 5

Write-Output "OPENING BROWSER"
[system.Diagnostics.Process]::Start("brave", "https://ppspwindowsmanager.visualstudio.com/Habit%%20Tracker%%20Web%%20Api/_build")