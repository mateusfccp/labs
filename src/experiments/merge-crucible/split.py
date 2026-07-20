import re
import os

with open('merge_crucible_rogue_grid.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract CSS
style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if style_match:
    os.makedirs('src', exist_ok=True)
    with open('src/style.css', 'w', encoding='utf-8') as f:
        f.write(style_match.group(1).strip())

# Extract JS
script_match = re.search(r'<!-- GAME LOGIC -->\s*<script>(.*?)</script>', content, re.DOTALL)
if script_match:
    os.makedirs('src', exist_ok=True)
    with open('src/main.js', 'w', encoding='utf-8') as f:
        f.write(script_match.group(1).strip())
        
# Extract HTML body without style and script
html_clean = re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="/src/style.css" />', content, flags=re.DOTALL)
html_clean = re.sub(r'<!-- GAME LOGIC -->\s*<script>.*?</script>', '<script type="module" src="/src/main.js"></script>', html_clean, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_clean)

print("Split completed successfully.")
