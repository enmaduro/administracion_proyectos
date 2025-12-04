$content = Get-Content "src\components\ProjectDashboard.tsx" -Raw

# Fix 1: Remove storedValue from usePersistentState dependencies
$content = $content -replace '\}, \[key, storedValue\]\);', '}, [key]);'

# Fix 2: Use functional setState in usePersistentState
$content = $content -replace 'const valueToStore = value instanceof Function \? value\(storedValue\) : value;\s+setStoredValue\(valueToStore\);\s+window\.localStorage\.setItem\(key, JSON\.stringify\(valueToStore\)\);', 'setStoredValue((prevValue) => { const valueToStore = value instanceof Function ? value(prevValue) : value; window.localStorage.setItem(key, JSON.stringify(valueToStore)); return valueToStore; });'

# Fix 3: Remove setHistory from addHistoryEntry dependencies
$content = $content -replace '\}, \[setHistory\]\);', '}, []);'

# Fix 4: Remove setInvoices from handleUpdateInvoicePhase dependencies
$content = $content -replace '\}, \[setInvoices, phases, addHistoryEntry\]\);', '}, [phases]);'

# Fix 5: Remove invoices and addHistoryEntry from handleFileUpload dependencies
$content = $content -replace '\}, \[invoices, addHistoryEntry\]\);', '}, []);'

# Fix 6: Remove invoices and setInvoices from handleDeleteInvoice dependencies  
$content = $content -replace '\}, \[invoices, setInvoices, addHistoryEntry\]\);', '}, []);'

Set-Content "src\components\ProjectDashboard.tsx" -Value $content -NoNewline
