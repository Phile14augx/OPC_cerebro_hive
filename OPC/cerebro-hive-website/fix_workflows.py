import os
import glob

workflow_dir = r"d:\`{MY_PROJECTS\`}\`{OPC_cerebro_hive\`}\.github\workflows"
# We need to un-escape the path for python
workflow_dir = r"d:\{MY_PROJECTS}\{OPC_cerebro_hive}\.github\workflows"

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # Replace npm cache
    if 'cache: npm' in content or "cache: 'npm'" in content or 'cache: "npm"' in content:
        content = content.replace("cache: npm", "cache: pnpm\n        cache-dependency-path: OPC/cerebro-hive-website/pnpm-lock.yaml")
        content = content.replace("cache: 'npm'", "cache: pnpm\n        cache-dependency-path: OPC/cerebro-hive-website/pnpm-lock.yaml")
        content = content.replace('cache: "npm"', "cache: pnpm\n        cache-dependency-path: OPC/cerebro-hive-website/pnpm-lock.yaml")
        modified = True

    # Replace npm ci
    if 'npm ci' in content:
        content = content.replace('npm ci', 'pnpm install --frozen-lockfile')
        modified = True
        
    # Replace npm run
    if 'npm run' in content:
        content = content.replace('npm run', 'pnpm run')
        modified = True

    # Specifics for visual-regression
    if 'visual-regression.yml' in filepath:
        if 'pnpm/action-setup' not in content:
            setup_pnpm = """    - uses: pnpm/action-setup@v4
      with:
        version: 9
"""
            content = content.replace('- uses: actions/setup-node', setup_pnpm + '    - uses: actions/setup-node')
            
        if 'working-directory' not in content:
            content = content.replace('run: pnpm install --frozen-lockfile', 'working-directory: OPC/cerebro-hive-website\n      run: pnpm install --frozen-lockfile')
            content = content.replace('run: npx playwright install', 'working-directory: OPC/cerebro-hive-website\n      run: npx playwright install')
            content = content.replace('run: npx playwright test', 'working-directory: OPC/cerebro-hive-website\n      run: npx playwright test')
        modified = True

    # Specifics for sbom
    if 'sbom.yml' in filepath:
        if 'pnpm/action-setup' not in content:
            setup_pnpm = """      - uses: pnpm/action-setup@v4
        with:
          version: 9
"""
            content = content.replace('- uses: actions/setup-node', setup_pnpm + '      - uses: actions/setup-node')
        content = content.replace('cache: npm', 'cache: pnpm\n          cache-dependency-path: OPC/cerebro-hive-website/pnpm-lock.yaml')
        content = content.replace('@cyclonedx/cyclonedx-npm', '@cyclonedx/cyclonedx-node')
        modified = True
        
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {os.path.basename(filepath)}")

for file in glob.glob(os.path.join(workflow_dir, '*.yml')):
    fix_file(file)
