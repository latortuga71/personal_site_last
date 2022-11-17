---
layout: ../../layouts/PostLayout.astro
title:  "TheHiveProject"
date:   2019-06-01 19:37:21 -0400
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
<h1> TheHiveProject </h1>
<p>
So my company recently is switching to new siem solution the ELK stack, and offered me a chance to work on an open source case management solution called the <a href="https://github.com/TheHive-Project/TheHive">TheHiveProject</a> It offers the ability to run analyzers on malicious ip's, urls' and files all on the dashboard.
its basically a ticketing system where you can also run scripts that will poll api's and help you investigate. I loved the idea and the directory knew i was decent
with python so he gave me a shot. I ended up writing code for most of my work days. sprinkling soc analyst work when alerts would happen and made got it to the point
where it was able to receive alerts from anything sending a post request and create cases along with the malicious observables (ip,urls) to run analyzers on them.
This was achieved using a flask app to take json data then using a python module they created. create a case on the hive itself.

Below is small snippet <a href="https://github.com/latortuga71/FlaskAppForTheHIve">REPO</a>
</p>

``` python
from __future__ import print_function
from __future__ import unicode_literals
from flask import Flask, jsonify, request
import sys
import json
from thehive4py.api import TheHiveApi
from thehive4py.models import Case, CaseTemplate, CaseObservable
import ValidateJson
import TheHiveApiScript
### looking back on this, it was pretty ugly lol ##########
app = Flask(__name__)

@app.route("/postjson", methods = ["POST"])
def posthandler():               #### main function
  return_data = {}              ## json response
  headers = request.headers
  agent = headers.get('User-Agent')
  auth = headers.get('the_key')    ### get auth key from headers
  if auth == 'key you specify' and agent == 'bunch of numbers for useragent':  
    print (jsonify({"message": "OK: Authorized"}), 200)
    if request.method == "POST":    ## if post request continue
      if request.is_json:               ## if format json in header continue
        content = request.get_json()    ## get json in dictionary
        print(content)

print("Validating Json...\n")
{% endhighlight %}


After that i was able to using the examples they have on they github repo,
write my own analyzers that reach out to the Maltiverse api and the IP Info Api. <a href="https://github.com/latortuga71/TheHive_CortexAnalyzers_Responders">REPO</a>

<u>Maltiverse</u>
{% highlight python %}
#!/usr/bin/python3
# encoding: utf-8
import json
import requests
from cortexutils.analyzer import Analyzer

class Maltiverse(Analyzer):
    URI = "https://api.maltiverse.com/ip"
    def summary(self,raw):
        taxonomies = []
        level = None
        value = None
        if "message" in raw:
            if raw["Message"] == "Internal Server Error":
                level = "safe"
                value = "No Data Found"
                taxonomies.append(self.build_taxonomy(level,"Maltiverse","threat",value))
                result = {"taxonomies":taxonomies}
                return result
        if 'classification' in raw:
            r = raw.get('classification')
            if r == "malicious":
                blacklist = raw.get("blacklist")
               #print(len(blacklist))
                if len(blacklist) <= 5:
                    value = "{}".format(len(blacklist))
                    level = "suspicious"
                elif len(blacklist) >= 6:
                    value = "{}".format(len(blacklist))
                    level = "malicious"
            else:
                value = r
                level = "safe"
        else:
            print('Not classified')
            level ="safe"
            value ="safe"
        taxonomies.append(self.build_taxonomy(level,"Maltiverse","threat",value))
        result = {"taxonomies":taxonomies}
        return result
       # print(type(raw))
       # print(raw)
       # return raw




    def run(self):
        Analyzer.run(self)
        if self.data_type == 'ip':
            #print(self.get_data())
            maltiverse_data_type = self.get_data()
            try:
                response = requests.get("{}/{}".format(self.URI,maltiverse_data_type))
                #print(response)
                #jsondata = response.json()
                self.report(response.json())
            except:
                self.unexpectedError("error trying to get data")
        else:
            self.notSupported()

if __name__ == '__main__':
    Maltiverse().run()


{% endhighlight %}

<u>IP Info</u>
{% highlight python %}
#!/usr/bin/env python3
# encoding: utf-8

import json
import requests
from cortexutils.analyzer import Analyzer

class IP_INFO(Analyzer):
    URL = "http://ipinfo.io/"
    def __init__(self):
        Analyzer.__init__(self)
        self.api_key = self.get_param('config.key',None,'Key is missing')

    def summary(self,raw):
        taxonomies = []
        level = "info"
        value = "1"
        taxonomies.append(self.build_taxonomy(level,"IP INFO","INFO",value))
        result = {"taxonomies":taxonomies}
        return result

    def run(self):
        #Analyzer.run(self)
        if self.data_type == 'ip':
            data = self.get_data()
            try:
                response = requests.get("{}{}?token={}".format(self.URL,data,self.api_key))
                self.report(response.json())
            except:
                self.unexpectedError("error trying to get data")
        else:
            self.notSupported()

if __name__== '__main__':
IP_INFO().run()
{% endhighlight %}

I was also able to write a script that logged into a gmail searched for emails with the subject "Phishing" and downloaded the eml of the emails,
created a case on the hive.So users could report Phishing emails that way. the hive also comes with an eml parser that would be used in conjuction with this.
you know i like snippets.  <a href="https://github.com/latortuga71/Automate_Phishing_Cases">REPO</a>

{% highlight python %}
from __future__ import print_function
import pickle
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import base64
import email
import datetime
from apiclient import errors
import TheHiveApiScript
import sys
import re

def get_to_and_from(eml_str):
    try:
        from_ = re.findall(r"From:\s.*",eml_str)
        reporting_user = from_[0]
        from_to_list = [reporting_user]
        return from_to_list
    except:
        print("didnt work")
        from_to_list = ['Could not determine user who reported phishing email']
    return from_to_list


def create_eml(msg):
    date = str(datetime.datetime.now())
    date = date.replace(" ","_")
    date = date.replace("-","_")
    date = date.replace(":","_")
    with open(date + '.eml','w') as f:
        f.write(str(msg))
        f.close()
        return(str(date + '.eml'))


def fix_file_name(name):
    name = str(name)
    name = name.replace(' ','_').replace('|','_').replace(':','_')
    return str(name)
def ListMessagesMatchingQuery(service, user_id, query=''):
  """List all Messages of the user's mailbox matching the query.
  Args:
    service: Authorized Gmail API service instance.
    user_id: User's email address. The special value "me"
    can be used to indicate the authenticated user.
    query: String used to filter messages returned.
    Eg.- 'from:user@some_domain.com' for Messages from a particular sender.
  Returns:
    List of Messages that match the criteria of the query. Note that the
    returned list contains Message IDs, you must use get with the
    appropriate ID to get the details of a Message.
  """
  try:
    response = service.users().messages().list(userId=user_id,
                                               q=query).execute()
    messages = []
    if 'messages' in response:
      messages.extend(response['messages'])

    while 'nextPageToken' in response:
      page_token = response['nextPageToken']
      response = service.users().messages().list(userId=user_id, q=query,
                                         pageToken=page_token).execute()
      messages.extend(response['messages'])
    print(messages)
    print(messages[0]['id'])
    return messages[0]['id']
  except errors.HttpError as error:
    print ('An error occurred: %s' % error)



def GetMimeMessage(service, user_id, msg_id):
  """Get a Message and use it to create a MIME Message.
  Args:
    service: Authorized Gmail API service instance.
    user_id: User's email address. The special value "me"
    can be used to indicate the authenticated user.
    msg_id: The ID of the Message required.
  Returns:
    A MIME Message, consisting of data from Message.
  """
  try:
    message = service.users().messages().get(userId=user_id, id=msg_id,
                                             format='raw').execute()

    #print ('Message snippet\n {}'.format(message))
    test = message['raw'] + "="
    #print(test)
    decoded = base64.urlsafe_b64decode(test).decode('utf-8')
    #print(decoded)
    #str_decoded = str(decoded[1:])
    #print(str_decoded)
    mime_msg = email.message_from_string(decoded)
    #print(mime_msg)
    return mime_msg
  except errors.HttpError as error:
    print ('An error occurred {}'.format(error))

def TrashMessage(service, user_id, msg_id):
  """Delete a Message.
  Args:
    service: Authorized Gmail API service instance.
    user_id: User's email address. The special value "me"
    can be used to indicate the authenticated user.
    msg_id: ID of Message to delete.
  """
  try:
    service.users().messages().trash(userId=user_id, id=msg_id).execute()
    print ('Message with id: %s moved to trash successfully.' % msg_id)
  except errors.HttpError as error:
    print ('An error occurred: %s' % error)

def GetAttachments(service, user_id, msg_id, prefix=""):
    """Get and store attachment from Message with given id.
    Args:
    service: Authorized Gmail API service instance.
    user_id: User's email address. The special value "me"
    can be used to indicate the authenticated user.
    msg_id: ID of Message containing attachment.
    prefix: prefix which is added to the attachment filename on saving
    """
    try:
        message = service.users().messages().get(userId=user_id, id=msg_id).execute()

        for part in message['payload']['parts']:
            if part['filename']:
                if 'data' in part['body']:
                    data=part['body']['data']
                else:
                    att_id=part['body']['attachmentId']
                    att=service.users().messages().attachments().get(userId=user_id, messageId=msg_id,id=att_id).execute()
                    data=att['data']
                file_data = base64.urlsafe_b64decode(data.encode('UTF-8'))
                new_name = fix_file_name(part['filename'])
                #path = prefix+part['filename']
                path = prefix + new_name

                with open(path, 'wb') as f:
                    f.write(file_data)

                return path
    except errors.HttpError as error:
        print('An error occurred: %s' % error)


# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/gmail.modify']


def main():
    """Shows basic usage of the Gmail API.
    Lists the user's Gmail labels.
    """
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server()
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    service = build('gmail', 'v1', credentials=creds)

    # run functions below
    try:
        email_id = ListMessagesMatchingQuery(service,'me', query='Subject:[Phishing]')
        print('Aquired email id\n')
        #GetAttachments(service,'me',email_id,"C:\\Users\\calonso\\Desktop\\test\\")
        eml_decoded = GetMimeMessage(service,'me',email_id)
        print('decoded email \n')
        emlstr = str(eml_decoded)
        to_and_from_addresses = get_to_and_from(emlstr)
        print(emlstr)
        print("*************")
        print(to_and_from_addresses)
        #file_name = create_eml(eml_decoded)
        #print("eml file exported\n")
        attachment = GetAttachments(service,'me',email_id,"C:\\save wherever you want")
        print(attachment)
        if attachment:
            try:
                TheHiveApiScript.Connect_To_Hive()
                print("Connected to Hive\n")
                try:
                    tags = to_and_from_addresses[0].split('@')
                    phish_case_id = TheHiveApiScript.Create_Case("Phishing Email Reported {}".format(to_and_from_addresses[0]),'Phishing Email Reported {}'.format(to_and_from_addresses[0]),1,'RP_0001_phishing_email',tags)
                    TheHiveApiScript.Add_Obser(phish_case_id,'file',[attachment],1)
                    print("Case Created, EML added to case.")
                    try:
                        TrashMessage(service,'me',email_id)
                        print("Message Moved To Trash")
                    except:
                        print("Trash Email failed..")
                except:
                    print("Case could not be created..")
            except:
                print("Could not connect to hive")
    except errors.HttpError as error:
        print("Error case not created email not deleted {}".format(error))





if __name__ == '__main__':
main()
{% endhighlight %}
Also wrote a mail responder and a responder that could blacklist ip's or urls' on a fortigate device using paramiko.
but im not going to include snippets for that but the repo is here <a href="https://github.com/latortuga71/TheHive_CortexAnalyzers_Responders/tree/master/Cortex_Responders/responders">REPO</a>
in the end we did not go with this as our case management system but i learn alot of about the automation of case management and incident reponse solutions
```