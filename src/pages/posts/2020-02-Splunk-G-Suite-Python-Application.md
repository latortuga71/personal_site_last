---
title: "Splunk-G-Suite-Python-App"
date: 2020-02-02T13:05:45-05:00
draft: false
toc: false
images:
layout: ../../layouts/PostLayout.astro
tags:
  - Splunk
  - G Suite
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

## Ingesting G Suite Alert Center Logs Into Splunk

I was recently tasked with ingesting alot of data from various cloud platforms like AWS & GCP into splunk.
Splunk provides very good documentation and provides add-ons for both of these platforms. However for G-Suite (which is like 0365 but for google) There seems to be one app that is used and actually works very well. [G Suite App](https://splunkbase.splunk.com/app/3791/#/details) [Kyle Smith wrote it](https://splunkbase.splunk.com/apps/#/author/alacercogitatus).

It has logging options for most apps in G Suite. (you can literally see every log from drive) After setting it up i realized that i really didnt need to see all that stuff and instead opted to look for an option regarding the [G Suite Alert Center](https://support.google.com/a/answer/9105393?hl=en&ref_topic=9105077)

At this point i was happy with the alerts triggered. Since it will alert on DLP rules as well as sus logins or sus emails.
Also you can create custom alerts based on rules set up [using that investigation center gui](https://support.google.com/analytics/answer/1033021?hl=en). It gives you options to create different rules based on the logs its constantly looking at if that makes sense. Unfortunately at the time and still (i think) the g suite app doesnt support the alert center logs. So i sought out a way to ingest those using the Splunk HEC. 

Searching online i couldnt find much in this topic/issue. So i contacted google and asked about this [article](https://developers.google.com/admin-sdk/alertcenter/guides).
The quickstart guide is in java. I asked if they had any way to do this in python or another language. The support rep told me there was NO way to do this in another language...Ok.

Searching google i was able to find a [reference](https://developers.google.com/resources/api-libraries/documentation/alertcenter/v1beta1/python/latest/alertcenter_v1beta1.alerts.html) to the api. So i started writing something to query it for latest alerts.
the hardest part was finding the syntax for the initial build function that is provided by the google library. I found a post that had the correct syntax and i was finally able to query it [here](https://github.com/googleapis/google-api-python-client/issues/777).
Before this obviously you need to set up the proper credentials the article for those steps are [here](https://developers.google.com/identity/protocols/oauth2/service-account) Specifically the "Delegating domain-wide authority to the service account" section.
```python
scopes = ["https://www.googleapis.com/auth/apps.alerts"]
SERVICE_ACCOUNT_FILE = 'json creds'
credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, subject="acount here", scopes=scopes)
service = build('alertcenter', 'v1beta1', credentials=credentials).alerts()

```

After getting the initial auth squared away, i was able to focus on getting the queries i wanted. I decided i would loop it to check every minute for a new alert in the past minute this [page](https://developers.google.com/admin-sdk/alertcenter/reference/filter-fields.html) helped with the queries needed to filter alerts. Once the timestamp and query format was correct i just practiced with the sending of the data to slunk wich is a straight forward post request. I added this to a linux server as a service with SystemD 
And it hasnt failed me yet or missed an alert.

Here is the end result once in splunk.

![asmi popup](/gsuite.png)

This could probably be added to the current G Suite App or made even better. But this was my way to work through the problem.
[The Repo](https://github.com/latortuga71/GSuiteAlerts2Splunk)

The Code Below 

``` python
import json
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2 import service_account
import requests
import datetime
from sys import exit
from time import sleep
import logging

logging.basicConfig(filename='/opt/gsuite-alerts.log',level=logging.INFO)

'''
	    scopes = ["https://www.googleapis.com/auth/apps.alerts"]
	    SERVICE_ACCOUNT_FILE = 'json creds'
	    credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, subject="acount here", scopes=scopes)
	    service = build('alertcenter', 'v1beta1', credentials=credentials).alerts()
'''

#recent_alerts = service.list().execute().get("alerts", [])
#https://developers.google.com/resources/api-libraries/documentation/alertcenter/v1beta1/python/latest/alertcenter_v1beta1.alerts.html#list
#https://developers.google.com/admin-sdk/alertcenter/reference/filter-fields.html
#https://github.com/googleapis/google-api-python-client/issues/777
#filter = "createTime >= \"2018-04-05T00:00:00Z\""
# FILTER NEEDS TO BE IN STRING FORMAT THE WHOLE THING ESCAPE DOUBLE QUOTES


class AlertAPI(object):
	alert_id = None
	scopes = ["https://www.googleapis.com/auth/apps.alerts"]
	SERVICE_ACCOUNT_FILE = 'appcreds.json'
	credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, subject="account here", scopes=scopes)
	#service = build('alertcenter', 'v1beta1', credentials=credentials).alerts()



	def check_new_alerts(self):
		self.service = build('alertcenter', 'v1beta1', credentials=self.credentials).alerts()
		self.one_min_behind = datetime.datetime.utcnow() - datetime.timedelta(minutes=1)
		self.now = datetime.datetime.utcnow()
		self.time_filter_str1 = self.one_min_behind.isoformat().split(".")[0] + "Z"
		self.time_filter_str2 = self.now.isoformat().split(".")[0] + "Z"
		self.final_filter = "createTime >= \"{}\" AND createTime < \"{}\" ".format(self.time_filter_str1,self.time_filter_str2)
		logging.info(self.final_filter)
		orderfilter = "create_time asc"
		self.recent_alerts = self.service.list(orderBy=orderfilter,filter=self.final_filter).execute() #pageSize=2 filter=self.final_filter OR type=\"*\"
		#print(self.recent_alerts)
		if not self.recent_alerts:
			# write this to a log file eventually
			#print(self.recent_alerts)
			self.num_of_alerts = 0
		else:
			self.num_of_alerts = len(self.recent_alerts['alerts'])
			logging.info("Alerts found => {}".format(self.num_of_alerts))
			logging.info(self.recent_alerts)



	def post_to_splunk(self,payload):
		self.ready2post = {}
		self.ready2post['sourcetype'] = "gsuite_alerts_api"
		self.ready2post['event'] = payload
		self.finalpayload = json.dumps(self.ready2post,indent=2)
		self.headers = {"Authorization":"Splunk tokenhere ",
						"Content-type":"application/json"}
		resp = requests.post("splunk hec url",headers=self.headers,data=self.finalpayload)
		logging.info(resp)
		logging.info(resp.text)
		resp_dict = json.loads(resp.text)
		if resp_dict['text'] != "Success":
			logging.warning("Failed Posting to splunk")
		else:
			logging.info("Successfully Posted to splunk")




	def main(self):
		while True:
		    #self.check_new_alerts()
		    try:
		    	self.check_new_alerts()
		    except Exception as e:
		    	logging.warning("ERROR {}".format(e))
		    	sleep(60)
		    	continue

		    if self.num_of_alerts == 0:
		    	logging.info("No Alerts Found!")
		    	sleep(60)
		    	continue
		    else:
		    	if self.recent_alerts['alerts'][0]['alertId'] == self.alert_id:
		    		logging.info("Last Alert Posted ID is same as oldest pulled alert...")
		    		logging.info("Continue to top of loop until this is resolved")
		    		sleep(60)
		    		continue

		    	for x in range(0,self.num_of_alerts):
		    		#print(x)
		    		self.post_to_splunk(self.recent_alerts['alerts'][x])
		    		if x + 1 == self.num_of_alerts:
		    			logging.info("attemping to get last alerts alert id")
		    			self.alert_id = self.recent_alerts['alerts'][x]['alertId']
		    logging.info("below is last alerts alert id")
		    logging.info(self.alert_id)
		    logging.info("done sleeping running loop again... checking for new alerts")
		    sleep(60)


if __name__ == '__main__':
    AlertAPI().main()

 ```

