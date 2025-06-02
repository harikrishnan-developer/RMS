$base64Content = Get-Content -Path "favicon.ico.b64"
[System.Convert]::FromBase64String($base64Content) | Set-Content -Path "favicon.ico" -Encoding Byte
