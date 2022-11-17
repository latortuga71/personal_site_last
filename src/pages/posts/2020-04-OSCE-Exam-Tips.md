---
title: "OSCE Exam Tips"
date: 2020-04-02T08:53:31-05:00
draft: false
toc: false
images:
layout: ../../layouts/PostLayout.astro
tags:
  - OSCE
  - Exam
  - Tips
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

Just finished my OSCE Exam. And i wanted to contribute a quick blog post regarding the exam/course since i used alot of these myself to prepare. Ill start by laying out some key things i think that helped me pass and eleborate on each with some more details. Keep in mind this is meant to be very to the point and will not detail my exam experience such as time i took etc. (Meant to be a short blog post)

* SLAE Course
* Knowledge of PHP & Web Applications
* Practicing on VulnServer
* Knowledge of C
* Simple Shellcoding On Windows
* Using Google For Research


## SLAE Course

[I highly suggest taking this course](https://www.pentesteracademy.com/course?id=3) or just signing up to pentester academy in general, by the end of it you will understand x86 assembly pretty well. And will have written shellcode in linux. While using GDB as the debugger. I would go as far as to say this should be a required prerequisite before taking OSCE.

## Knowledge of PHP & Web Applications
About 1.5 years ago i was on a helpdesk when learning PHP and people said i was wasting my time lol. I highly suggest creating simple php applications at the very minimum and use the following [Github repo](https://github.com/paralax/lfi-labs) to practice some LFI attacks and perhaps trying to obtain RCE from an LFI attack. LFI gets touched on in the course. So you dont need to spend that much time on this but at least be able to read source code and identify vulnerable functions.


## Practicing on VulnServer
This is by far the most helpful thing you can do to pass OSCE stephen bradshaw created a vulnerable server that can be used for exploit development. Do every single function atleast twice and the harder ones 3 times.
[VulnServer](https://github.com/stephenbradshaw/vulnserver)

## Knowledge of C & Python
This helps alot, this should kind of be a prerequisite to SLAE but yeah.

## Simple Shellcoding on Windows
Do it. [Corelan Intro to Shellcoding](https://www.corelan.be/index.php/2010/02/25/exploit-writing-tutorial-part-9-introduction-to-win32-shellcoding/)

## Using Google For Research
You will be googling alot. Get used to googling your hunches on what the next step or exploit can be.

## Final Thoughts
By the end of the course and while doing vulnserver you should be familiar with SEH stuff, classic overflows and ways to jump around small buffer space as well as SUBENCODE your instructions. The course really expects you to learn on your own before and after the course. I have some links below that you should bookmark while taking the course. Before you take the exam be prepared to think way outside the box and relax.


* [John Hammond OSCE PREP VID](https://www.youtube.com/watch?v=0n3Li63PwnQ)
* [SubEncoding](http://vellosec.net/2018/08/carving-shellcode-using-restrictive-character-sets/)
* [Custom ShellCode Example](http://www.gosecure.it/blog/art/452/sec/create-a-custom-shellcode-using-system-function/)
* [Online x86 / x64 Assembler and Disassembler](https://defuse.ca/online-x86-assembler.htm)