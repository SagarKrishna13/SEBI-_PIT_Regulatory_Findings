import urllib.request
import re
import json
import xml.etree.ElementTree as ET

sample_urls = [
    # INFY
    ("INFY", "Infosys Limited", "https://nsearchives.nseindia.com/corporate/xbrl/PIT_500209_317202618425_IT_WebXMLFile_20260731_180428309.xml"),
    # WIPRO
    ("WIPRO", "Wipro Limited", "https://nsearchives.nseindia.com/corporate/xbrl/PIT_507685_3172026175016_IT_WebXMLFile_20260731_175022364.xml"),
    # HCLTECH
    ("HCLTECH", "HCL Technologies Limited", "https://nsearchives.nseindia.com/corporate/xbrl/XML_30_07_2026_IT_WebXMLFile_20260730_175454851.xml"),
    # RELIANCE
    ("RELIANCE", "Reliance Industries Limited", "https://nsearchives.nseindia.com/corporate/xbrl/PIT_500325_22520262270_IT_WebXMLFile_20260522_220704532.xml"),
    # JSWSTEEL
    ("JSWSTEEL", "JSW Steel Limited", "https://nsearchives.nseindia.com/corporate/xbrl/PIT_500228_3072026115735_IT_WebXMLFile_20260730_115738811.xml"),
    # DMART
    ("DMART", "Avenue Supermarts Limited", "https://nsearchives.nseindia.com/corporate/xbrl/PIT_540376_2872026183418_IT_WebXMLFile_20260728_183435492.xml"),
]

req_headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

for sym, co, url in sample_urls:
    try:
        req = urllib.request.Request(url, headers=req_headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode('utf-8', errors='ignore')
            print(f"[{sym}] Success, length: {len(content)}")
    except Exception as e:
        print(f"[{sym}] Failed: {e}")
