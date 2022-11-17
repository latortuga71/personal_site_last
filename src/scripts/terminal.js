import { Terminal } from 'xterm/lib/xterm.js';
import { FitAddon } from 'xterm-addon-fit/lib/xterm-addon-fit.js';
import 'xterm/css/xterm.css';
import { posts } from './constants';
import { helpMessage } from './constants';
import { shellprompt } from './constants';
import { jobsMessage } from './constants';
import { whoMessage } from './constants';
import { whoamiMessage } from './constants';

import {TermColors} from './constants';
import {colorize} from './utils';
import { FilesOnDisk } from './constants';
import { WebLinksAddon } from 'xterm-addon-web-links/lib/xterm-addon-web-links.js';

let startOfPrompt = true;
let currentLocationOfCursor = 1;
let buffer = "";

const term = new Terminal(
    {
        allowProposedApi:true,
        convertEol: true,
        cursorBlink:true,
        termName:"TEST",
        fontSize:14,
        fontFamily:"monospace",
        theme: {
            background: '#161b22',
            brightMagenta: '#c7157a',
            //background: '#060606',
            /*cursor: '#2ab025',
            selection: '#2ab025',
            cursorAccent: '#2ab025',
            brightMagenta: '#c7157a',
            green: '#2ab025',
            brightGreen: '#2ab025',
            yellow: '#f2ca29',
            brightYellow: '#f2ca29',
            red: '#cf442b',
            brightRed: '#cf442b',
            */
        },
        windowOptions: {
            fullscreenWin:true
        }
    }
);

const prompt = () => {
    term.write(colorize(TermColors.Green,"\r\n" + shellprompt));
};
const terminalWrite = (data) => {
    term.write(`\r\n${data}`)
}

async function HandleDownload(file) { 
    const res = await fetch("../" + file);
    if (!res.ok) {
        terminalWrite(`download: ${file}: No such file or directory`);
        return;
    }
    const fileContents = await res.blob();
    const size = fileContents.size;
    const fileUrl = URL.createObjectURL(fileContents);
    const anchor = document.createElement("a");
    anchor.href = fileUrl;    // create a new handle
    anchor.download = file;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(fileUrl);
    term.write(`\r\nDownloaded ${size} bytes`);
}

async function loadFileInfo(file) { 
    const res = await fetch("../"+file)
    const fileContents = await res.text();
    const fileLength = fileContents.length;
    let entry = `-rw-r--r--    ${fileLength} latortuga0x71  staff      39 Nov 11 20:39 ${file}`;
    terminalWrite(entry);
}

async function HandleLs(){
    for (let x = 0; x < FilesOnDisk.length;x++){
        await loadFileInfo(FilesOnDisk[x].name);
    }
}

function HandleBlog(){
    for (let i = 0; i < posts.length; i++){
        let entry = `-rw-r--r-- 0 ${posts[i].author}  staff      39 Nov 11 20:39 https://latortuga.io/posts/${posts[i].title}`
        terminalWrite(entry)
    }
}

function HandleReturn(dataSent){
    let argv = dataSent.split(" ");
    switch (argv[0]) {
        case "":
            prompt();
            return;
        case "?":
            terminalWrite(helpMessage);
            prompt();
            return;
        case "help":
            terminalWrite(helpMessage);
            prompt();
            return;
        case "whoami":
            terminalWrite(whoamiMessage);
            prompt();
            return;
        case "who":
            terminalWrite(whoMessage);
            prompt();
            return;
        case "jobs":
            terminalWrite(jobsMessage);
            prompt();
            return;
        case "ls":
            HandleLs().then(() => prompt());
            return;
        case "blogs":
            HandleBlog();
            prompt();
            return;
        case "download":
            if (argv.length > 1) {
                HandleDownload(argv[1]).then(() => prompt());
                return;
            } else {
                terminalWrite("download: Missing file arg.")
                prompt();
                return;
            }
        case "pwd":
            terminalWrite("/root");
            prompt();
        case "exit":
            window.location.replace("https://latortuga.io/")
        case "clear":
            term.clear();
            prompt();
            return;
        default:
            terminalWrite(`bash: ${dataSent}: command not found`);
            prompt();
            return;
    }
}

const fitAddon = new FitAddon();
const linkAddon = new WebLinksAddon()
term.loadAddon(fitAddon);
term.loadAddon(linkAddon);

term.open(document.getElementById('terminal'));
fitAddon.fit();
term.write(colorize(TermColors.Red,String.raw`
 /$$                 /$$                        /$$                                /$$$$$$          /$$$$$$$$ /$$  
| $$                | $$                       | $$                               /$$$_  $$        |_____ $$/$$$$  
| $$       /$$$$$$ /$$$$$$   /$$$$$$  /$$$$$$ /$$$$$$  /$$   /$$ /$$$$$$  /$$$$$$| $$$$\ $$/$$   /$$    /$$|_  $$  
| $$      |____  $|_  $$_/  /$$__  $$/$$__  $|_  $$_/ | $$  | $$/$$__  $$|____  $| $$ $$ $|  $$ /$$/   /$$/  | $$  
| $$       /$$$$$$$ | $$   | $$  \ $| $$  \__/ | $$   | $$  | $| $$  \ $$ /$$$$$$| $$\ $$$$\  $$$$/   /$$/   | $$  
| $$      /$$__  $$ | $$ /$| $$  | $| $$       | $$ /$| $$  | $| $$  | $$/$$__  $| $$ \ $$$ >$$  $$  /$$/    | $$  
| $$$$$$$|  $$$$$$$ |  $$$$|  $$$$$$| $$       |  $$$$|  $$$$$$|  $$$$$$|  $$$$$$|  $$$$$$//$$/\  $$/$$/    /$$$$$$
|________/\_______/  \___/  \______/|__/        \___/  \______/ \____  $$\_______/\______/|__/  \__|__/    |______/
                                                                /$$  \ $$                                          
                                                               |  $$$$$$/                                          
                                                                \______/  
                                            @latortuga71   
`));
term.write("\r\n")
term.write(`                           --- Normal site: https://latortuga.io/ ---`)


term.write("\r\n");
term.write(colorize(TermColors.Green,shellprompt));

term.onData((data) => {
    if (currentLocationOfCursor == 1) {
        startOfPrompt = true;
    }
});

term.onLineFeed((feed) => {
});


term.onKey((keyObject) => {
    if (currentLocationOfCursor <= 0) {
        startOfPrompt = true;
    }
    let key = keyObject.key;
    let code = keyObject.code;
    switch (key){
        case "\u001b[A":
            return;
        case "\u001b[B":
            return;
        case "\u001b[D":
            return;
        case "\u001b[C":
            return;
        case "\u007f":
            if (startOfPrompt){
                return;
            }
            term.write("\b \b")
            currentLocationOfCursor -= 1;
            buffer = buffer.slice(0,buffer.length-1);
            return;
        case "\r":
            HandleReturn(buffer);
            buffer = "";
            startOfPrompt = true;
            currentLocationOfCursor = 1;
            return;
        default:
            currentLocationOfCursor += 1;
            buffer += key;
            startOfPrompt = false;
            term.write(key);
            return;
    }
});







