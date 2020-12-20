!macro customInstall
   SetRegView 64
   WriteRegStr HKCR "*\shell\SealGo" "" "Upload pictures w&ith SealGo"
   WriteRegStr HKCR "*\shell\SealGo" "Icon" "$INSTDIR\SealGo.exe"
   WriteRegStr HKCR "*\shell\SealGo\command" "" '"$INSTDIR\SealGo.exe" "upload" "%1"'
   SetRegView 32
   WriteRegStr HKCR "*\shell\SealGo" "" "Upload pictures w&ith SealGo"
   WriteRegStr HKCR "*\shell\SealGo" "Icon" "$INSTDIR\SealGo.exe"
   WriteRegStr HKCR "*\shell\SealGo\command" "" '"$INSTDIR\SealGo.exe" "upload" "%1"'
!macroend
!macro customUninstall
   DeleteRegKey HKCR "*\shell\SealGo"
!macroend
