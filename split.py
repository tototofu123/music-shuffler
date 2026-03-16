import codecs
with codecs.open('index.html', 'r', 'utf-8') as f:
    content = f.read()

import re
style_match = re.search(r'<style>([\s\S]*?)</style>', content)
script_match = re.search(r'<script>\s*(const SONGS_URL[\s\S]*?)</script>', content)

if style_match and script_match:
    with codecs.open('style.css', 'w', 'utf-8') as f:
        f.write(style_match.group(1).strip())
    with codecs.open('script.js', 'w', 'utf-8') as f:
        f.write(script_match.group(1).strip())
    
    content = content.replace(style_match.group(0), '<link rel="stylesheet" href="style.css">')
    content = content.replace(script_match.group(0), '<script src="script.js"></script>')
    with codecs.open('index.html', 'w', 'utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("FAILED to find tags")
