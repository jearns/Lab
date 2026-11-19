"""Build the offline guide from a pinned local checkout of the upstream book."""
import gzip
import json
import re
import subprocess
import sys
from pathlib import Path

root = Path(sys.argv[1]).resolve()
dest = Path(__file__).parent / "data"
dest.mkdir(exist_ok=True)
chapters = []
for path in sorted((root / "book").glob("[0-9]*.md")):
    code, title = path.stem.split("-", 1)
    chunks = re.split(r"(?m)^###\s+(\d+)[.、]\s*(.+?)\s*$", path.read_text())
    entries = [{"n": int(n), "title": t, "body": re.sub(r"<!--.*?-->", "", b, flags=re.S).strip()}
               for n, t, b in zip(chunks[1::3], chunks[2::3], chunks[3::3])]
    if not entries:
        raise ValueError(path.name)
    chapters.append(dict(id=code, title=title, path=path.name, entries=[[e["n"],e["title"]] for e in entries]))
    raw = json.dumps(entries, ensure_ascii=False, separators=(",",":")).encode()
    (dest / (code + ".gz")).write_bytes(gzip.compress(raw, mtime=0))
def git(*args):
    return subprocess.check_output(["git","-C",str(root),*args],text=True).strip()
index = dict(version=git("rev-parse","HEAD"), date=git("log","-1","--format=%cs"), chapters=chapters)
(dest / "guide.json").write_text(json.dumps(index, ensure_ascii=False, separators=(",",":")))
