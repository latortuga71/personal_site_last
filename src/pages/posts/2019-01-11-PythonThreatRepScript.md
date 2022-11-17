---
layout: ../../layouts/PostLayout.astro
title:  "IP Threat Rep Script"
date:   2019-01-11 19:37:21 -0400
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
<h1> IP Threat Rep Script </h1>
<p>
Script that calls multiple API's to return threat rep for user specified IP and writes findings to a text file. Useful for sec analyst investigations.
</p>
``` python
import requests
import json
import shodan
from requests.auth import HTTPBasicAuth
import os
import datetime
import time
import wget

def Grey_Noise(file,ip):
    file = open(current_time.strftime('%d_%m_%Y') +'_'+ ip + '.txt','a')
    ### greynoise API
    r = requests.post("http://api.greynoise.io:8888/v1/query/ip",data = {'ip':ip} )
    print("**** Greynoise ****")
    #print(r.json())
    grey_noise_dataREAL = r.json()
    grey_noise_data = json.dumps(grey_noise_dataREAL)
    file.write("**** Greynoise ****")
    file.write('\n')
    file.write('\n')
    try:
        for x in range(0,len(grey_noise_dataREAL['records'])):
          file.write(str(grey_noise_dataREAL['records'][x]))
          file.write('\n')
    except:
        print('No malware records found.')
        file.write('No malware records found.')
        file.write('\n')
        file.write('\n')
    #finally:
    #    file.write(grey_noise_data)
    #    file.write('\n')
    return file.close()


def Shodan(file,ip):
    port = ['Port List: ']
    data = {}
    file = open(current_time.strftime('%d_%m_%Y') +'_'+ ip + '.txt','a')
    print("**** Shodan ****")
    file.write("**** Shodan ****")
    file.write('\n')
    file.write('\n')
    SHODAN_API_KEY = 'yourkey'
    api = shodan.Shodan(SHODAN_API_KEY)
    try:
        host = api.host(ip)
        print("""
        IP: {}
        ORG: {}
        OS: {}
       """.format(host['ip_str'],host.get('org','n/a'),host.get('os','n/a')))

        for item in host['data']:
            data[item['port']] = item['data']
            port.append(item['port'])
            print("""    Port: {}
        Banner: {}
            """.format(item['port'],item['data']))
        time.sleep(10)
    except:
        print('No Data Found')
        file.write("**** Shodan ****")
        file.write('\n')
        file.write('No Data available')
        try:
            print('Error {}'.format(shodan.APIError))
        except:
            print('No Shodan Data Found')

    try:
        file.write(str(port))
        file.write('\n')
        for key ,value in data.items():
            file.write('{} : {}'.format(key,value))
        #file.write(str(new))
        #shodan_data = port + shodan_ports + shodan_space + shodan_banners
        #shodan_data = str(shodan_data)
        file.write('\n')
    except:
        print('no shodan data to append')
    return file.close()


def Maltiverse(file,ip):
    file = open(current_time.strftime('%d_%m_%Y') +'_'+ ip + '.txt','a')
    print("**** Maltiverse ****")
    r = requests.get('https://api.maltiverse.com/ip/{}'.format(ip))
    print(r.json())
    Maltiverse_Data = r.json()

    try:
        data = json.dumps(Maltiverse_Data['blacklist'])
    except:
        data = 'Multiverse has no malware for this ip'
    ### blacklist dict of lists
    try:
        country = Maltiverse_Data['asn_country_code']
    except:
        country = "Multiverse has no country for this ip"

    try:
        city = Maltiverse_Data['city']
    except:
        city = "Multiverse has no city for this ip"


    try:
        state = Maltiverse_Data['state']
    except:
        state = "Multiverse has no State for this ip"

    try:
        comp_name = Maltiverse_Data['as_name']
    except:
        comp_name = "Multiverse has no AS Name for this ip"

    #Maltiverse_Data = json.dumps(Maltiverse_Data)
    file.write("**** Maltiverse ****")
    file.write('\n')
    file.write(data)
    file.write('\n')
    file.write(country)
    file.write('\n')
    file.write(city)
    file.write('\n')
    file.write(state)
    file.write('\n')
    file.write(comp_name)
    file.write('\n')
    file.write('\n')
    return file.close()



def FraudGuard(file,ip):
    file = open(current_time.strftime('%d_%m_%Y') +'_'+ ip + '.txt','a')
    print("**** FraudGuard Trial Expired April 3rd  ****")
    r = requests.get('https://@api.fraudguard.io/ip/{}'.format(ip), verify=True, auth = HTTPBasicAuth('yourkey','yourkey'))
    print(r.text)
    fraudGuard_data = r.text
    file.write("**** FraudGaurd Trial Expired April 3rd  ****")
    file.write('\n')
    file.write(fraudGuard_data)
    file.write('\n')
    file.write('\n')
    return file.close()


def ReverseDNS(file,ip):
    file = open(current_time.strftime('%d_%m_%Y') +'_'+ ip + '.txt','a')
    print("**** ReverseDNS  ****")
    r = requests.get('https://api.hackertarget.com/reverseiplookup/?q={}'.format(ip))
    print(r.text)
    Reverse_DNS_Data = r.text
    file.write("**** ReverseDNS  ****")
    file.write('\n')
    file.write(Reverse_DNS_Data)
    file.write('\n')
    file.close()
    return Reverse_DNS_Data

def MalwarePatrol(file,ip,DNS_INFO):
    file = open(current_time.strftime('%d_%m_%Y') +'_'+ ip + '.txt','a')
    # malware patrol api
    # iterate through file and see if ip is in block list
    print("**** Malware Patrol  ****")
    counter = 0
    dir = "C:\\Users\\calonso\\Desktop\\block_list.txt"
    #Reverse_DNS_Data = Reverse_DNS_Data.split(' ')
    # taking hostname from reverse dns and splitting ip and host name putting into block list loop

    hostname = DNS_INFO.split('\n')
    hostname = hostname[:-1]
    # remove empty string in ths list
    #[hostname[:-2] for w in hostname]
    url = "https://lists.malwarepatrol.net/cgi/getfile?receipt=yourreciept&product=32&list=firekeeper"
    if "record" not in hostname:
        if not os.path.exists(dir):
          try:
              block_list = wget.download(url,out=dir)
              if block_list:
                  print("Block List Downloaded and updated")
                  print("Checking blocklist...")
                  z = open("block_list.txt",'r')
                  file.write("**** Malware Patrol  ****")
                  file.write("\n")
                  for line in z:
                      counter +=1
                      print('Reading Line # {}'.format(counter))
                      for word in hostname:
                           if word in line:
                               print(word)
                               file.write("**** Malware Patrol  ****")
                               file.write('\n')
                               file.write("HOSTNAME FOUND ON BLOCKLIST")
                               file.write('\n')
                               file.write(line)
                               file.write('\n')
                               print('blocked hostname found!!!')
                               time.sleep(2)
          except:
              print('Could not download blocked url list')
        else:
            print('Checking blocklist...')
            z = open("block_list.txt",'r')
            #file.write("**** Malware Patrol  ****")
            file.write("\n")
            for line in z:
                counter +=1
                print('Reading Line # {}'.format(counter))
                for word in hostname:
                     if word in line:
                        print(word)
                        file.write("**** Malware Patrol  ****")
                        file.write('\n')
                        file.write("HOSTNAME FOUND ON BLOCKLIST")
                        file.write('\n')
                        file.write(line)
                        file.write('\n')
                        print('blocked hostname found!!!')
                        time.sleep(2)
    else:
        print('IP Not resolved Cannot check blacklist')
        file.write("**** Malware Patrol  ****")
        file.write("\n")
        file.write("IP Not resolved Cannot check blacklist")
        file.write("\n")

    file.close()



def VirusTotal_Scan(file,ip):
    file = open(current_time.strftime('%d_%m_%Y') +'_'+ ip + '.txt','a')
    file.write("**** Virus Total  ****")
    file.write("\n")
    virus_total_key = 'yourkey'
    VT_data = {'apikey':virus_total_key,'url':'http://{}/'.format(ip)}
    response = requests.post('https://www.virustotal.com/vtapi/v2/url/scan',data=VT_data)
    print(response.json())
    response = response.json()
    response_string = json.dumps(response)
    file.write(response_string)
    file.write('\n')
    file.write('*** Virus Total Scan Report Below ***')
    file.write('\n')
    file.close()
    return str(response['scan_id']), virus_total_key

    ## retrive report
def VirusTotal_Results(file,ip,scan_id):
    file = open(current_time.strftime('%d_%m_%Y') +'_'+ ip + '.txt','a')
    print(scan_id)
    key = 'yourkey'
    params = (('apikey',key),('resource',scan_id))
    getresults = requests.get('https://www.virustotal.com/vtapi/v2/url/report',params=params)
    results = getresults.json()
    try:
        print(results['scans'])
        for key, value in results['scans'].items():
            print(key,'\n',value,'\n')
            file.write(str(key))
            file.write('\n')
            file.write(str(value))
            file.write('\n')
    except:
        print('No Scan Data Found Yet Try Again Later...')
    return file.close()


## IPinfo.io API For when fraud guard expires
def IP_Info(file,ip):
    key = 'yourkey'
    file = open(current_time.strftime('%d_%m_%Y') +'_'+ ip + '.txt','a')
    response = requests.get('http://ipinfo.io/{}?token={}'.format(ip,key))
    data = response.json()
    file.write("**** IP Info.io  ****")
    file.write('\n')
    try:
        file.write(data['ip'])
        file.write('\n')
        file.write(data['hostname'])
        file.write('\n')
        file.write('Organization name: ')
        file.write(data['country'])
        file.write('\n')
        file.write(data['org'])
        file.write('\n')
        file.write('\n')
    except:
        file.write('Error Writing IP INFO DATA')
        file.write('\n')
        file.write('\n')



if __name__ == "__main__":
    print('*** THREAT REP SCANNER v1 ***\n')
    host_ip = input('Enter IP to be scanned: ')
    current_time = datetime.datetime.today()
    file1 = open(current_time.strftime('%d_%m_%Y') +'_'+ host_ip + '.txt','w')
    file1.write('*** THREAT REP SCANNER v1 ***')
    file1.write('\n')
    file1.write('\n')
    file1.close()
    IP_Info(file1,host_ip)
    FraudGuard(file1,host_ip)
    Grey_Noise(file1,host_ip)
    Shodan(file1,host_ip)
    Maltiverse(file1,host_ip)
    MalwarePatrol(file1,host_ip,ReverseDNS(file1,host_ip))
VirusTotal_Results(file1,host_ip,VirusTotal_Scan(file1,host_ip))
```