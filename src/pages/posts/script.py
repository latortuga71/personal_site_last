from os import listdir
from os.path import isfile
from os import stat
from sys import argv
import json


if __name__ == "__main__":
    counter = 1
    fileObjs = []
    for o in listdir():
        if o == "script.py":
            continue
        if o == argv[0]:
            continue
        if not isfile(o):
            continue
        # file
        sz = stat(o)
        with open(o,"r") as fd:
            lines = fd.readlines()
            for line in lines:
                if "title:" in line:
                    title = line.split("title:")[1].rstrip().replace(" ","").replace("\"","")
                if "date:" in line:
                    date = line.split("date:")[1].rstrip().replace(" ","").replace("\"","")
            fileName = o.replace(".md","")
            obj =  {
                "title": fileName,
                "size": sz.st_size,
                "postedData": date,
                "link": f"/posts/{fileName}",
                "author": "latortuga0x71",
                "issue":"a",
            }
        fileObjs.append(obj)
        counter+=1
    sortedList = sorted(fileObjs,key =lambda d: d["title"])
    for i,f in enumerate(sortedList):
        f["issue"] = f"0x0{i}"
    for f in sortedList:
        pretty = json.dumps(f,indent=3).replace("\"title\"","title").replace("\"postedData\"","postedData").replace("\"link\"","link").replace("\"author\"","author").replace("}","},").replace("\"size\"","size").replace("\"issue\"","issue")
        print(pretty)
        