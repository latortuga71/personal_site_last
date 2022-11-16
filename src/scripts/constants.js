export const TermColors = {
  Red: '\x1B[1;31m',
  Green: '\x1B[1;32m',
  Purple: '\x1B[1;35m',
  Reset: '\x1B[0m',
};

export const posts = [
    {title: "FIRST_POST", postedData:"Nov 11 20:39", size:"15", link: "blog-0", issue: "0x00",author:"SomeOtherGuy0x11"},
    {title: "FIRST_POST", postedData:"Nov 11 20:39", size:"15", link: "blog-0", issue: "0x00",author:"SomeOtherGuy0x11"},
    {title: "FIRST_POST", postedData:"Nov 11 20:39", size:"15", link: "blog-0", issue: "0x00",author:"SomeOtherGuy0x11"},
]

export const shellprompt = "guest@latortuga.home:~$ "

export const helpMessage = `
available commands

  help                  show this message
  who                   display who is on the system
  jobs                  display status of jobs in the current session
  whoami                display effective user id
  ls                    list directory contents
  blogs                 list blog posts
  download              download file

`;

export const whoMessage = 
`OSCP        console      Nov 09 10:28 
OSCE        ttys001      Nov 10 11:54 
OSWE        ttys002      Nov 11 10:28
OSEP        ttys003      Nov 12 10:28  
OSED        ttys004      Nov 13 10:28  
OSCE3       ttys005      Nov 14 11:54
OSMR        ttys006      Nov 15 11:54  
CRTE        ttys007      Nov 16 11:56
RHCE        ttys008      Nov 17 11:58
AZ-500      ttys009      Nov 18 02:80
MS-500      ttys010      Nov 19 12:00
AZ-104      ttys011      Nov 20 01:00
SEC+        ttys012      Nov 21 11:00
CCNA        ttys013      Nov 22 12:00`

export const whoamiMessage = `{
  "Name": "christopher",
  "CurrentPosition": "Cyber Security Engineer",
  "Company: "IBM",
  "Location": "Miami, FL",
  "FavLanguages": ["Golang", "C", "Python"],
  "Hobbies": ["Working out","Climbing", "Writing Offensive Tooling"],
  "LastUpdated": "2022-11-06",
  "Github":"https://github.com/latortuga71",
  "Twitter":"https://twitter.com/latortuga71"
}`

export const jobsMessage = 
`[1]-  Running                IBM                            'Innovation/Remediation Engineer'
[2]-  Running                Cobalt.io                      'Pentester'
[3]   Stopped: 15            Conquest Cyber                 'Cyber Security Engineer/DevSecOps'
[4]   Stopped: 15            Health Channels                'Cyber Security Analyst'
[5]-  Stopped: 15            United Data Technologies       'SOC Engineer/Python Dev'
[6]+  Stopped: 15            LanInfoTech                    'HelpDesk Engineer'`


/*
term.write(String.raw`
#################################################################
#                   _    _           _   _                      #
#                  / \  | | ___ _ __| |_| |                     #
#                 / _ \ | |/ _ \ '__| __| |                     #
#                / ___ \| |  __/ |  | |_|_|                     #
#               /_/   \_\_|\___|_|   \__(_)                     #
#                                                               #
#  You are entering into a secured area! Your IP, Login Time,   #
#   Username has been noted and has been sent to the server     #
#                       administrator!                          #
#   This service is restricted to authorized users only. All    #
#            activities on this system are logged.              #
#  Unauthorized access will be fully investigated and reported  #
#        to the appropriate law enforcement agencies.           #
#################################################################
`);
*/


export const FilesOnDisk = [
  {
    name: 'resume.txt',
    path: '/resume.txt',
  },
  {
    name: 'otherfile.txt',
    path: '/otherfile.txt',
  },
];