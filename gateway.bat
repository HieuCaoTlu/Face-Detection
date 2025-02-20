@echo off
setlocal enabledelayedexpansion

for /f "tokens=*" %%A in ('netsh interface show interface ^| findstr /C:"Wi-Fi"') do (
    set wifi_adapter=%%A
)

for /f "tokens=2 delims=:" %%A in ('getmac /v /fo list ^| findstr /C:"%wifi_adapter%"') do (
    set mac=%%A
    if not "!mac!"=="" (
        set mac_addr=!mac!
        goto :done
    )
)

:done
set "mac_addr=%mac_addr: =%"

echo { "mac_address": "%mac_addr%" } > "backend\mac_address.json"
