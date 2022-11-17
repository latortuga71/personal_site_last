---
layout: ../../layouts/PostLayout.astro
title:  "GoBuster Python Clone"
date:   2019-08-17 19:37:21 -0400
categories: python
---
<head>
	<style>
		body {
			background-color: #161b22;
			color: #c9d1d9;
		}
		a:hover, a:visited:hover{
			color:red;
		}
		a:visited {
			color: #c9d1d9;
		}
	</style>
</head>
<h1> GoBuster Python Clone</h1>
<p>
<a href="https://github.com/latortuga71/PyMegaBuster">REPO</a>
</p>

``` python
#!/usr/bin/python
from threading import Thread
import sys
from Queue import Queue
import time
import requests
import argparse

concurrent = 200

def doSomethingWithResult(status):
    if status.startswith("301") or status.startswith("200") or status.startswith("403"):
        print "Success: ",status.strip(),"\n",
        with open(args.out,'a+') as f:
            f.write("Success: " + status.strip() + "\n")
        f.close()

def doWork():
    while True:
        url = target + q.get()
        status = getStatus(url.strip())
        doSomethingWithResult(status)
        q.task_done()

def getStatus(url):
    try:
        r = requests.head(url,timeout=1)
        results = '{}:{}'.format(r.status_code,url)
        return results.strip()
    except:
        return "Error:"

def getArgs():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", help="http://ip/ or https://site.com/")
    parser.add_argument("--wordlist", help="/usr/share/wordlists/list.txt")
    parser.add_argument("--out",help="output successes to file")
    args = parser.parse_args()
    if not len(sys.argv) > 1 or not len(sys.argv) == 7:
        print parser.print_help()
        sys.exit()
    return args

def fix_url(url):
    if not url.endswith("/"):
        url = url + "/"
        return url
    else:
        return url

if __name__ == "__main__":
    #print("### PyMegaBuster ###")
    print '''...
######################################################################
  ___      __  __      ___      ___      ___ ___ _   ___ ___
 | _ \\_  _|  \\/  |___ / __|__ _| _ )_  _/ __/ __| |_| __| _ \\
 |  _/ || | |\\/| / -_) (_ / _` | _ \\ || \\__ \\__ \\  _| _||   /
 |_|  \\_, |_|  |_\\___|\\___\\__,_|___/\\_,_|___/___/\\__|___|_|_\\
      |__/
######################################################################
'''
    time.sleep(1)
    print("Starting....")
    global args
    args = getArgs()
    target = args.url.strip()
    target = fix_url(target)
    start = time.time()
    q = Queue(concurrent * 2)
    for i in range(concurrent):
        t = Thread(target=doWork)
        t.daemon = True
        t.start()
    try:
        for url in open(str(args.wordlist)):
            q.put(url)
        q.join()
    except KeyboardInterrupt:
        sys.exit(1)
    end = time.time()

    print("### Completed in {} seconds. ###".format( end - start))
```