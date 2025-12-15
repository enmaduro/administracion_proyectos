# Fix the usePersistentState hook in Aplicacion.tsx
$filePath = "src\Aplicacion.tsx"
$content = Get-Content $filePath -Raw

# Replace the buggy setValue function with the fixed version
$oldPattern = @'
  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback\(\(value\) => \{
    try \{
      const valueToStore = value instanceof Function \? value\(storedValue\) : value;
      setStoredValue\(valueToStore\);
      window\.localStorage\.setItem\(key, JSON\.stringify\(valueToStore\)\);
    \} catch \(error\) \{
      console\.error\(`Error setting localStorage key "\$\{key\}":`, error\);
    \}
  \}, \[key, storedValue\]\);
'@

$newCode = @'
  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback((value) => {
    try {
      setStoredValue((prevValue) => {
        const valueToStore = value instanceof Function ? value(prevValue) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);
'@

$content = $content -replace $oldPattern, $newCode

Set-Content $filePath -Value $content -NoNewline
Write-Host "Fix applied successfully!"
