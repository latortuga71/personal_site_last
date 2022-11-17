---
title: "AWS Ephemeral Workspaces"
layout: ../../layouts/PostLayout.astro
date: 2020-01-15T13:05:45-05:00
draft: false
toc: false
images:
tags:
  - AWS
  - Python
  - Workspaces
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
<p>
AWS doesnt offer ephemeral workspaces at this point in time. So i was tasked with finding a solution and seeing if this was possible. Searching online i didnt find much. But i did find a way to work through this problem. Using lambda functions, Cloud Watch , Cloud Trail &Workspaces of course.

 In my repo i have a pdf explaining how it works (hopefully well) its basically three lambda functions. One function triggers when a new workspace is created, and creates a cloud watch rule on it to see if it disconnects or logs off. If it does it will trigger the rule and run the big function that tears down the workspace completely and rebuilds it from an image. And the last function watches for workspaces being terminated to delete the alert that is tied to that workspace.

  So it pretty much is a small ecosystem of functions working upon the work of the others. Code & PDF here => [Repo has PDF that explains in detail](https://github.com/latortuga71/AWS_Ephemeral_Workspaces)
  </p>