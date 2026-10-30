import urllib.request
import re
import json
import xml.etree.ElementTree as ET

url = "https://nsearchives.nseindia.com/corporate/xbrl/PIT_500209_317202618425_IT_WebXMLFile_20260731_180428309.xml"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req) as resp:
    content = resp.read().decode('utf-8', errors='ignore')

root = ET.fromstring(content)
print("Root tag:", root.tag)

# Find all tags without namespace
tags = set()
for elem in root.iter():
    clean_tag = elem.tag.split("}")[-1] if "}" in elem.tag else elem.tag
    if "Person" in clean_tag or "Security" in clean_tag or "Date" in clean_tag or "Regulation" in clean_tag or "Transaction" in clean_tag:
        print(f"Tag: {clean_tag} -> Text: {elem.text} (Attrs: {elem.attrib})")
