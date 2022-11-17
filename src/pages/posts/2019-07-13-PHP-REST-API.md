---
layout: ../../layouts/PostLayout.astro
title:  "PHP-REST_API (NO FRAMEWORK)"
date:   2019-07-13 19:37:21 -0400
categories: PHP
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
<h1> PHP-REST_API (NO FRAMEWORK) </h1>
<p>
Before jumping into my next area of studies, which seems to be more focused towards the pen testing side of security (OCSP).
I decided to jump back into PHP and create a REST API without a framework, i created one via the lumen framework and following a tutorial online it was fairly straight forward.
But i wanted to do it ~~horribly~~ on my own. With no framwork just straight php one page application.
I didnt really add any authentication. Just a value specified in the header. Maybe in the future i will go back and add this feature.
I used python to call the IP INFO api and get 500 ips along with extra information to fill the database.
Then used a switch statement to get the different requests and pull json from the database. The allowed requests are GET DEL POST and PUT.
Feel free to check out the repo here and if a entry is deleted add another one.
<a href="https://github.com/latortuga71/PHP_REST_API_NO_FRAMEWORK">REPO</a>
</p>
