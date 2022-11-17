---
layout: ../../layouts/PostLayout.astro
title:  "Elk Stack Alerting/Tool For Watchers"
date:   2019-09-01 19:37:21 -0400
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
<h1>Elk Stack Alerting/Tool For Watchers</h1>
<p>
So i got tasked with creating the alerts for our shiny new ELK SIEM. This is a monumental task but im currently in the labs for my OSCP and the task of running attacks
/ techniques on machines sending windows events to kibana would help me better understand red teaming. After asking how i should go about this ridiculous task. A reddit post pointed me torwards ElastAlert an open source alerting tool created by yelp. I was told we have to go with the Elastic supported tool/system called Watcher. It's basically database queries that run on an interval and if any documents are found and action can be performed. Such as sending an email or writing the document to a new index that Demisto is listening on. The only problem is, the syntax is crazy json and took me a couple days to figure out the basics. Keep in mind my only prior experience with elastic is just doing queries on kibana. Also they provide a scripting language that can be used to edit the documents that are returned or perform more complex queries. The langauge is called "painless", its an offshoot of java but its insanely difficult (The documentation will make your eyes bleed).So i didnt bother and had a colleague of mine who is the main engineer on elastic help me with some simple watches/queries as he was familiar with the ESL query language. At this point i can make any alerts using potentially simple queries which is more than enough for creating alerts based on windows logs. Network device logs will most likely need math to be performed via the scripting langauge to check if a certain ip has been blocked x amount of times in the last 30 seconds. In the meantime to get the analysts involved and to be able to create faster watches without having to write the crazy json myself. I created a tool that creates the templates for the watch for you and all you need to do is enter the keys and values you are alerting on. <a href="https://github.com/latortuga71/WatchIT">Here is the repository</a> Keep in mind this was thrown together pretty quickly in an afternoon and i did not implement proper exception catching. I plan on adding more features such key value input and then quering the database to see if the synax is correct or the watch returns a hit.
</p>