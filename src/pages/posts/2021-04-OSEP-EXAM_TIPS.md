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

This will be a quick post discussing my thoughts on the OSEP exam and course.

## TLDR
I highly recommend OSEP for any security focused individuals, red team or blue team. The course is fantastic and very up to date.

## Experience before starting course
I had been through the OSCP, OSCE and OSWE Courses prior to this course. Also i had completed all the [Sektor7](https://www.sektor7.net/) windows courses.
Prior to the course i spent alot of time learning about the windows api with [Pavels books](https://scorpiosoftware.net/books/) and i feel this helped alot once the tool writing portions of the OSEP course began. But this is not needed as most of the course is done in powershell and C#. It just helped to have that strong base. The only requirement i would suggest to this course is OSCP or pentesting experience(active directory) and some programming knowledge.

## Course Tips
I initially paid for 2 months of lab time but i constantly fell into the rabbit hole of writing my own tools. And had to pay for a lab extension to finish the labs. Going through the course is pretty straight forward. But like everyone has said really the biggest benefit is the labs. If you are able to complete the last 6 labs on your own. You are 100% ready for the exam. If you decide to write alot of your own tools this will cost lab time. But will pay off in the exam as it adds to your methodology.

## Exam tips
For the exam my biggest tips are having a go to methodology once you get on a new machine. In terms of enumeration and shell upgrade. I wrote a [powershell module](https://github.com/latortuga71/TortugaToolKit) that i used heavily in the exam (it cost me lots of time and i had to get a lab extension though). This paid off through adding my methodology when getting on a new machine. As i could just immediately load my module and do my typical enumeration. I opted for metasploit as my C2 and my powershell module as one of the main methods of enumeration. But anything can work. The labs 100% prepare you for the exam. I really like this aspect because it really is about taking what you learned in the course and effectively applying it to a real Active Directory Environment. You are given 48 hours which is more than enough time to complete this exam. Despite some dumb setbacks i was able to complete this within 12 hours. And if i didnt commit any mistakes less time is easily doable.

## Worth it?
Yes. It really helped me understand advanced Active Directory attacks. As well as a more realistic pentesting engagment as i havent had any real world pentesting experience. This course and OSWE are really the best courses offensive security has to offer. And i really recommend infosec people who want to get better to do both of those. As the knowledge gained is easily worth the price.

## Last Tips
* Take lots of notes so you can just copy and paste commands quickly.
* If you do the cybernetics pro lab on hackthebox you will be well prepared.

## Links
* [TurtleToolKit](https://github.com/latortuga71/TortugaToolKit)
* [Twitter](https://twitter.com/latortuga71)
