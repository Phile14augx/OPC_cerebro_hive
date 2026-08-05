import os

root_dir = r"d:\{MY_PROJECTS}\{OPC_cerebro_hive}\OPC\cerebro-hive-website"

def replace_in_file(filepath, is_package_json=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    if is_package_json:
        if '"@prisma/client"' in content:
            # simple replace for now: "@prisma/client": "^7.9.0" -> "@cerebro/db": "workspace:*"
            # we can use regex
            import re
            content, count = re.subn(r'"@prisma/client":\s*".*?"', r'"@cerebro/db": "workspace:*"', content)
            if count > 0:
                modified = True
    else:
        if '@prisma/client' in content:
            content = content.replace("'@prisma/client'", "'@cerebro/db'")
            content = content.replace('"@prisma/client"', '"@cerebro/db"')
            modified = True
            
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {filepath}")

for root, dirs, files in os.walk(root_dir):
    # Exclude node_modules, .next, dist
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    if '.next' in dirs:
        dirs.remove('.next')
    if 'dist' in dirs:
        dirs.remove('dist')
    if '.git' in dirs:
        dirs.remove('.git')
        
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            replace_in_file(os.path.join(root, file), is_package_json=False)
        elif file == 'package.json':
            replace_in_file(os.path.join(root, file), is_package_json=True)
