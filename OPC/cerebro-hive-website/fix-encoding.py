import sys

file_path = 'packages/db/index.ts'
with open(file_path, 'rb') as f:
    raw = f.read()

# Fix encoding issues by taking the first 41 lines and appending cleanly
try:
    content = raw.decode('utf-8', errors='ignore')
except:
    content = raw.decode('utf-16le', errors='ignore')

lines = content.split('\n')
clean_lines = []
for line in lines:
    clean = line.replace('\x00', '').strip()
    if clean:
        clean_lines.append(clean)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(clean_lines))

print("Fixed index.ts encoding")
