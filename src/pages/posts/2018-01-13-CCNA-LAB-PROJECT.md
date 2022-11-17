---
title:  "CCNA Lab Project"
layout: ../../layouts/PostLayout.astro
date:   2018-01-13 19:37:21 -0400
categories: CCNA
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
<h1> CCNA Lab Project </h1>
<p>
This is the small office network i created using a ROAS for intervlan routing on the left side of the office (second floor) and used ospf to route between the second and third floors of the office. The second floor is in area 0 and the third is in area 1. the right side (third floor) has 3 subnets /24 masks each with connectivity to the internet and the other lan. And the Second Floor is subnetted with a /27 mask creating 6 subnets support up to 30 hosts each floor has two gateways running HSRP for redundancy, if one gateway goes down. the other becomes default for the lan

The second half of the network using eBGP to connect to the ISP's and to a remote office site, that has an GRE tunnel back to the second floor lan. There is connectivity from all sites to the internet. Nat is enabled from the Officd to the ISP. And there is redundancy from the ISP to the Office as well with two lines incase either router on each floor goes down. This project was my first big step towards my career and set the ground work for alot of my knowledge i have today <a href="https://imgur.com/gallery/s2aPjMN">Full pics here</a>    
</p>

<img src="/assets/img/lab1.jpg" alt="drawing" width="750"/>
<img src="/assets/img/lab2.jpg" alt="drawing" width="750"/>
