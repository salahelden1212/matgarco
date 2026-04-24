@echo off
echo ========================================
echo   Matgarco AI Service - Testing
echo ========================================
echo.

echo Testing health endpoint...
curl -s http://localhost:8000/health | python -m json.tool
echo.

echo Testing description generation...
curl -s -X POST http://localhost:8000/api/generate-description ^
  -H "Content-Type: application/json" ^
  -d "{\"productName\":\"iPhone 15 Pro\",\"category\":\"Electronics\",\"price\":50000,\"tags\":[\"smartphone\",\"apple\",\"premium\"]}" ^
  | python -m json.tool
echo.

echo Testing SEO generation...
curl -s -X POST http://localhost:8000/api/generate-seo ^
  -H "Content-Type: application/json" ^
  -d "{\"productName\":\"iPhone 15 Pro\",\"category\":\"Electronics\"}" ^
  | python -m json.tool
echo.

echo ========================================
echo   Tests Complete
echo ========================================
pause
