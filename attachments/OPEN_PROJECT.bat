@echo off
set UNITY="C:\Program Files\Unity\Hub\Editor\6000.5.7f1\Editor\Unity.exe"
set PROJ=C:\projects\grokmars\GrokMarsUnity
echo Starting GrokMars Unity...
start "" %UNITY% -projectPath "%PROJ%"
echo First open can take several minutes (UniVRM + 8k Mars texture).
echo Then press Play. Right-drag orbits. Buttons start tours. Type "go to Gale".
pause
