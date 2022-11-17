---
layout: ../../layouts/PostLayout.astro
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

On the heels of passing my OSWE exam i wanted to write up a quick post to reassure people on the difficulty level of the exam. As there seems to be some misinformation regarding exactly how difficult it is. In short i would say **its difficult but doable.** Alot of posts seem to point in the direction of it being a huge codebase that is impossible to go through. That was not my experience. I will give a brief overview of what i did to prepare as well as a link to my repository of notes leading up to the exam.

## Exploit Writing HTB
I highly suggest performing some of the below hack the box machines to brush up on exploit development in preparation for the course =>[OWSE like boxes](https://docs.google.com/spreadsheets/d/1dwSMIAPIam0PuRBkCiDI88pU3yzrqqHkDtBngUHNCw8/edit#gid=665299979) 
This helped me alot and gives you boilerplate code during the exam if you are low on time.
If you have no experience writing exploits this is a must. I already have extensive experience with python so this was just a fun way to brush up for me.


## PortSwigger Labs
Before starting this journey i wasnt very good at sql injection (still not very good). And web app pentesting in general from a black box perspective. These labs helped me learn the common vulns to look out for as well as some more obscure ones i wasnt aware of. I suggest performing these and writing exploits to perform them if applicable. This will increase proficiency in burp as well as exploit development. [The Labs](https://portswigger.net/web-security/all-labs)


## Debugging
You will perform some debugging during the course. But i would suggest writing some of your own web apps in a language such as Java or C# and use Visual Studio Code to debug them. You will need this skill during the exam and without it you will fail. Nothing crazy just get used to using VS Code and debugging a simple web app.

## Languages to know
Before starting the course i was most familiar with Python and had some experience with C and Golang. You do not need to be a developer but i think an understanding of programming is required. I am not good at javascript but after the course my javascript skills improved immensely. Writing some simple apps in the MVC style would help with reading all the code required in the course/exam.
The course also does go over MVC style apps but some background knowledge would help.

## Summary of skills needed (in my opinion)
The top skills i would think are neccesary for passing the exam are below in no particular order

* Language to write exploits in (Intermediate level)
* Burp Skillz
* Read code in any langauge and be able to follow flow of code
* Some pentesting skills OSCP etc
* Have some methodology for auditing code
* google skills (finding obscure sqli payloads etc)
* Stay calm, pay attention to small details

## But can i pass if i dont know how to program
You need atleast a language to write exploits in, that is required (in my opinion).
But everything else can be learned in the prep before and during course.

## Exam Review
I dont have exact times, but the first box was down in around 9 hours, and the second was about done around 6pm the second day. The proctors were really cool. And didnt really notice them.

## Tips For Exam
Here are a couple of exam tips that i think are the most important takeaways for the exam.

* Have a methodology for auditing the code. I took a black box approach and mapped out the application. Then having a view from the outside found the features with the biggest attack surface within the code and started there.
* If using python write the whole exploit inside of one class and use requests.Session() for your web requests.
* Be familiar with implementing binary search for sql injections to speed data exfiltration.
* Perform all the extra boxes at the end of the course and if you can do all those you should be good for the exam.
* Be comfortable with debugging with VS Code
* Stay calm, play some music.

## Links
* Reach out on twitter if you have any questions
* [Twitter](https://twitter.com/latortuga71)
* [Notes Repo](https://github.com/latortuga71/AWAE-Prep-Exploits-Notes)




