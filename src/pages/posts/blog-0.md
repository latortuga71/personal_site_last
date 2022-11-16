---
title: "Windows CTF Writeup"
date: 2021-08-31T08:53:31-05:00
draft: false
toc: false
images:
tags:
  - CTF
  - Windows
  - AD
---

## Windows AD CTF Writeup
Got back into ctf's as of late and had alot of fun with a fairly new windows box. This windows machine is heavily focused on enumeration and active directory exploitation. The most interesting part of the challenge is you basically root the machine without ever gaining a shell on the machine itself. All of the enumeration and attacks are performed remotely. This seems like it would be similar to gaining vpn access to a network and performing your attacks through the vpn. Rather than having an implant call back to your C2. The machine is exploited using a combination of end user negligence, IT errors and common AD constrained delegation misconfiguration.


## Scanning

![image](https://user-images.githubusercontent.com/42878263/131617401-510c60b2-32d3-42a0-a19f-8803bee5fd9f.png)


Scanning the machine reveals port 80 is hosting an IIS server, navigating to the server doesnt show much. Its a basic static site but there are two links that point to a document directory being accesible and hosting pdf files.

![image](https://user-images.githubusercontent.com/42878263/131617654-d841c4a8-1de0-4597-8162-e17094ea55bd.png)

* http://10.10.10.248/documents/2020-01-01-upload.pdf
* http://10.10.10.248/documents/2020-12-15-upload.pdf

The two documents dont contain anything useful. But running `exiftool` reveals the names of two users that can be used for password spraying down the line.


## BruteForcing Pdf's
With no other directories found using gobuster to brute force other directories, i wrote a script to brute force available pdfs files by looping over the date format. If the status code wasnt a 400 i would download the pdf. Extract the author metadata (to add to our user list) and extract the text from the pdf to check if the document contained anything useful.

The script source is below

```python
import requests
import os
from PyPDF3 import PdfFileReader

class BruteForceDirs():
    def __init__(self,ip,port):
        self.ip = ip
        self.port = port
        self.host = f"http://{self.ip}:{self.port}/documents/"
        self.good_urls = []

    def spam(self,year):
        months = ["01","02","03","04","05","06","07","08","09","10","11","12"]
        days = ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"]
        target_url = self.host + year + "-" + "$$" + "-" + "!!" + "-upload.pdf"
        for month in months:
            month_url = target_url.replace("$$",month)
            for day in days:
                final_url = month_url.replace("!!",day)
                response = requests.head(final_url)
                if response.status_code != 404:
                    self.good_urls.append(final_url)
                    print(final_url)
                    return

    def parse_pdf(self):
        print("Attempting to download and parse!")
        for url in self.good_urls:
            file_name = url.split("/documents/")[1]
            with requests.get(url,stream=True) as s:
                with open(file_name,"wb") as f:
                    for chunk in s.iter_content(chunk_size=512 * 1024):
                        f.write(chunk)
            print(f"PARSING PDF -> {file_name}")
            with open(file_name,"rb") as f:
                reader = PdfFileReader(f)
                contents = reader.getPage(0).extractText().split("\n")
                [print(x) for x in contents]
            try:
                os.remove(file_name)
                print(f"DONE! Deleting File! -> {file_name}")
            except Exception as e:
                print(e)
                print(f"Failed to delete file -> {file_name}")
    def print(self):
        for url in self.good_urls:
            print(url)

if __name__ == "__main__":
    bfd = BruteForceDirs("10.10.10.248","80")
    years = ["2020","2021"]
    for year in years:
        bfd.spam(year)
    bfd.print()
    bfd.parse_pdf()
```
After piping the output using `tee` and skimming over it, i found two interesting documents. One contains the default password given to new users joining the company -> NewIntelligenceCorpUser9876 <- . And one seems to be an internal document stating that a script is running to check if web servers go down and that service accounts are being locked down. (Probably due to a recent breach)

![image](https://user-images.githubusercontent.com/42878263/131618262-9548c90c-0580-4ae7-8967-f484baee92d9.png)

Along with this new information i also dumped all the authors from each pdf (of which there were around 30). Into a user list that i can use to password spray with the default password.

![image](https://user-images.githubusercontent.com/42878263/131618439-910b0143-1a1e-4005-9011-62a0bd4a58c1.png)

### Foothold
Running crackmapexec and password spraying the network shows a user has not changed the default password. And we can access some smb shares on the target host.

`cme smb -u ../users.txt -p NewIntelligenceCorpUser9876 -d intelligence.htb --continue-on-success --shares 10.10.10.248`

![image](https://user-images.githubusercontent.com/42878263/131618621-a3d1feca-00d6-44bc-9a3f-4614ed85fa95.png)

I enumerated the shares with `smbclient` and it revealed read access to several folders. One folder called 'IT' seemed to be interesting and it contained a script called downdetector.ps1

![image](https://user-images.githubusercontent.com/42878263/131618896-94e21f56-86b3-4116-b3ba-0221465a25fb.png)

The scripts contents is below
```powershell
# Check web server status. Scheduled to run every 5min
Import-Module ActiveDirectory 
foreach($record in Get-ChildItem "AD:DC=intelligence.htb,CN=MicrosoftDNS,DC=DomainDnsZones,DC=intelligence,DC=htb" | Where-Object Name -like "web*")  {
try {
$request = Invoke-WebRequest -Uri "http://$($record.Name)" -UseDefaultCredentials
if(.StatusCode -ne 200) {
Send-MailMessage -From 'Ted Graves <Ted.Graves@intelligence.htb>' -To 'Ted Graves <Ted.Graves@intelligence.htb>' -Subject "Host: $($record.Name) is down"
}
} catch {}
}
```
This script was the one referenced in the pdf document. The script performs a get request with the default credentials flag. This indicates some authentication is being performed. And it checks AD for objects with the name that start with 'web' and performs the request on that host.

## Responding
I proceeded to add a machine account to active directory. By default all users in AD have access to add machine accounts to the domain.
Not being able to use powermad for this task i found a port of [powermad to python](https://gist.github.com/3xocyte/8ad2d227d0906ea5ee294677508620f5) which i ported to python3 then used to add a machine account with the name webAttack to the domain.

![image](https://user-images.githubusercontent.com/42878263/131619794-0101e8a0-d6dc-4449-a11d-f4c20d219df7.png)


After i used the dntool created by [dirkjan](https://github.com/dirkjanm/krbrelayx) to add a dns entry to that machine account i just added to the domain. And pointed it to my machines ip address.

![image](https://user-images.githubusercontent.com/42878263/131619831-f895a699-36ea-4b52-bcb8-83ef180472d4.png)

After starting responder and waiting for a couple minutes i recieved the ntlmv2 hash from the ted.graves user. As he was the account the script was running as. Using the rockyou wordlist and john i was able to crack the hash quickly.


![image](https://user-images.githubusercontent.com/42878263/131620108-003e178f-da6b-445f-96e0-13c6926d56e3.png)

## BloodHound
At this point i have another user (ted.graves) password (Mr.Teddy) that seems to be in an IT/Dev role. I decided to run bloodhound and enumerate the domain further.


![image](https://user-images.githubusercontent.com/42878263/131620423-6d27623f-1d78-4a2a-a48d-3d547661a27b.png)

The findings were substantial and point out a clear path to domain admin. The Ted.graves user that i control is in the IT Support AD Group. This group has the ability to retreive the password for the Group Managed Service Account SVC_INT. This service account has constrained delegation permissions on the target domain controller.

![image](https://user-images.githubusercontent.com/42878263/131620791-517061f5-3ef0-40cd-9400-cdaa0ebf983e.png)

A quick google search pointed me to this [python script](https://github.com/micahvandeusen/gMSADumper) that can be used to extract the ntlm hash from the service account. After running the script as ted.graves we get the expected hash for the service account.

![image](https://user-images.githubusercontent.com/42878263/131620971-69b237e2-018b-430e-afd6-a949378e6a30.png)

## Constrained Delegation
Constrained Delegation allows us to request a kerberos ticket for the WWW service on the domain controller as any user. But unfortunately a security researcher Alberto Solino found that the service name portion of the ticket (sname) is not actually a protected part of the ticket. So we can change it to any service we want (like cifs).

I decided to leverage impackets getST.py script and request a ticket as the Administrator account on the domain. And then use impackets smbclient.py script convert it to a CIFS ticket. 

![image](https://user-images.githubusercontent.com/42878263/131621464-d8b4d200-61c3-488a-b51c-aaf301562cd1.png)


This allowed me to perform a hash dump on the domain controller using secretsdump.py.

![image](https://user-images.githubusercontent.com/42878263/131621624-d020c2e5-ca43-4c39-81a2-acb0081d464a.png)

Using the same ticket, i used smbexec.py to gain a reverse shell and read the flag.

![image](https://user-images.githubusercontent.com/42878263/131621717-ab92a609-d93e-431d-9cd1-6b15f444ceaf.png)


## Key Takeaways
* Sometimes a shell isnt needed on network to compromise accounts.
* Misconfigured active directory environments lead to easy compromise. Specifically Improper Use of GMSA and Misconfigured Constrained Delegation.
* Responder is extremely powerful
* Active Directory has a huge attack surface. And a basic user accounts have more power than most people think.

## Further Reading
* [Delegation Attacks](http://blog.redxorblue.com/2019/12/no-shells-required-using-impacket-to.html)
* [Adding Machine Accounts And Modifying DNS Records](https://dirkjanm.io/krbrelayx-unconstrained-delegation-abuse-toolkit/)
* [Group Managed Service Accounts](https://docs.microsoft.com/en-us/windows-server/security/group-managed-service-accounts/group-managed-service-accounts-overview)
* [Twitter](https://twitter.com/latortuga71)
