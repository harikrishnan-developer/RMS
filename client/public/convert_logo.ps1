$base64Content = Get-Content -Path "logo192.png.b64"
[System.Convert]::FromBase64String($base64Content) | Set-Content -Path "logo192.png" -Encoding Byte
