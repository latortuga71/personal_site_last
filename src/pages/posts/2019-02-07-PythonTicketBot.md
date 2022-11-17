---
layout: ../../layouts/PostLayout.astro
title:  " Python ConnectWise Script"
date:   2019-02-07 19:37:21 -0400
categories: Python
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
<h1> Python ConnectWise Script </h1>
<p>
Script that automates cleaning up old tickets in the connect wise manage ticketing system via their API. Didnt finish adding automation (while loop) cron job is another option.
</p>
``` python
import json
import requests
import time


def get_individual_ticket(ticket_id):
    url = "https://yourcompaniesconnectwise.com/v4_6_release/apis/3.0/service/tickets/{}".format(ticket_id)
    payload = ""
    headers = {
        'Authorization': "Basic insertkeyhere",
        'cache-control': "no-cache",

        }
    response = requests.request("GET", url, data=payload, headers=headers)
    response = response.json()
    print('Ticket #:',response['id'])
    print('***************')
    print(' Date Created:',response['dateEntered'])
    print(' Summary:',response['summary'],'\n','STATUS: ',response['status']['name'],'\n','LastUpdated: ',response['_info']['lastUpdated'],'\n','UpdatedBy:',response['_info']['updatedBy'])
    try:
        print(' Owner:',response['owner']['name'])
        print('\n')
    except:
        print(' No Owner Assigned')
        print('\n')



### below works but you gotta make url in postman first querystrings not working for some reason use .format to add querystring in url string
def searching_for_ticket(querystring,Closed_or_Not,sort,results_num):
    global ticket_number_list
    ticket_number_list = []
    payload = ""
    url = "https://yourcompaniesconnectwise.com/v4_6_release/apis/3.0/service/tickets?conditions=summary contains '{}'  AND ClosedFlag = {} AND id > 840000&fields=id,name,status,summary,_info,owner&orderBy=id {}&pageSize={}".format(querystring,Closed_or_Not,sort,results_num)
    headers = {
            'Authorization': "Basic insertkeyhere",
            'cache-control': "no-cache",
            }
    response = requests.request("GET", url, data=payload, headers=headers)
    response = response.json()
    for x in range(results_num):
        print('Ticket #:',response[x]['id'])
        ticket_number_list.append(str(response[x]['id']))
        print('***************')
        print(' Summary:',response[x]['summary'],'\n','STATUS: ',response[x]['status']['name'],'\n','LastUpdated: ',response[x]['_info']['lastUpdated'],'\n','UpdatedBy:',response[x]['_info']['updatedBy'])

        try:
            print(' Owner:',response[x]['owner']['name'])
            print('\n')
        except:
            print(' No Owner Assigned')
            print('\n')
    time.sleep(2)
    return print(ticket_number_list)
def Update_Ticket(ticket_id):
    # things to update are in the json dictionary
    # if the value is nested u can add distionary to value
    url = "https://yourcompaniesconnectwise.com/v4_6_release/apis/3.0/service/tickets/{}".format(ticket_id)
    json = [{'op':'replace', 'path':'status', 'value':{'name':'Closed'}},{'op':'replace', 'path':'summary', 'value':'Test Ticket![Closed By Bot]'}]
    headers = {'Authorization': "Basic insertkeyhere",'Content-Type':'application/json', 'Accept':'application/json'}
    resp = requests.patch(url, json=json, headers=headers)
    print('Updating Ticket....')

#get_individual_ticket('897042')
# indivdual ticket function working perfect
# ordering by id desc = newest to olders asc = oldest to newest


# parameters contains => 'string', is open or not => bool, sort by => asc or desc  , # of results 10 NEEDS TO BE INT NOT STRING
###searching_for_ticket('FortiSIEM','False','desc',10)

if __name__ == "__main__":
    get_individual_ticket('898283')
    searching_for_ticket('Test Ticket','False','desc',1)
    for x in ticket_number_list:
        Update_Ticket(x)
    get_individual_ticket('898283')



## above will return the list of tickets to change
## example below
## Update_Ticket(searching_for_ticket(**args))



#get_individual_ticket('898283')
#time.sleep(5)
#Update_Ticket('898283')
#time.sleep(5)
#get_individual_ticket('898283')
# test ticket 898283

```
