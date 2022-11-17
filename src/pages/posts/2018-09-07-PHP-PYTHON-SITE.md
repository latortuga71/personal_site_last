---
layout: ../../layouts/PostLayout.astro
title:  "First PHP & Python App"
date:   2018-09-07 19:37:21 -0400
categories: PHP
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
<h1> First php app </h1>
<p>
So i just got done finishing my first SQL beginners book, and i was itching to get back into python as i was learning php and my sql for about a month. I thought up an idea to scrap wikipedia's top 1000 pages and create my own site that can search these top pages and return just the description paragraph for each page. I felt this would be a good first php project as well as the integration with python and mysql would help me think about how data can be moved once parsed<a href="https://en.wikipedia.org/wiki/Wikipedia:Database_reports/Most-watched_pages"> First i used a get request to pull the wikipedia page </a>

{% highlight python %}
import requests
request = requests.get('https://en.wikipedia.org/wiki/Wikipedia:Database_reports/Most-watched_pages')
text = request.text
{% endhighlight %}


Then used beautiful soup to parse out the page, i noticed i could grab the td tag as well as the a tag within it. Using regex helped remove the excess to only show the search words i needed. The issue was i got over 1.5 million strings in my list. I counteracted this by using indexing to only insert the last 1000 strings into the wikipedia.summary function and to then insert that into the database. (shout out to Johnathan Goldsmith) <a href='https://pypi.org/project/wikipedia/'> Python Wiki Module </a>


{% highlight python %}
soup = BeautifulSoup(text,'html.parser')
results = soup.find_all('td')
titles = []
links = []

### find all with td tag ^^^
for x in results:
titles.append(x.find('a'))
for t in titles:
    if t is not None:
        links.append(t.get('href'))
# find all with link tag within the td tags


refined_links = [l.replace('/wiki/','') for l in links]
best_search = refined_links[-300:]

# remove the /wiki/ part of the link to get just search query

{% endhighlight %}



Then i used the python mysql module to connect and insert the data into a simple database. Using a for loop and if's, checking if it already exists to not have any double entries. Oddly enough, my php wasn't so good i had to look up how to return the data from the select query, (forgot how php array's work) once that was done i just used some lazy css and bootstrap to make it look a (little?) better. Then i created an ec2 instance on aws to deploy it (xamp & cloned database)

{% highlight python %}

if True:
 my_cursor = my_data_base.cursor()
 my_cursor.execute("USE search_info")
 print('Connected to DB')
 print('Sending data to DB')
    # connect to proper database
  if True:
    for x in best_search:
        arg = x
        check_if_exists = ("SELECT * FROM wiki WHERE name = '%s' LIMIT 1 " % arg)
        my_cursor.execute(check_if_exists)
        msg = my_cursor.fetchone()
        #my_data_base.commit()
        #row_count = my_cursor.rowcount
        # check if row exists already
        if not msg:
            try:
              insert = "INSERT INTO wiki (name, description) VALUES (%s, %s )"
              val = (str(x),str(wikipedia.summary(x)))
              my_cursor.execute(insert,val)
              my_data_base.commit()
              counter +=1
              print(my_cursor.rowcount, "record inserted. #{}".format(counter))
              # insert data
            except:
                print("Error writing to database! record not added. ")


except:
print('Error')
sys.exit(0)

{% endhighlight %}

Overall i thought this was a good small project to learn how back ends work and how python can scrap from big sites, im really liking python more and more after seeing what it is capable of. I will be starting my next php book. <a href='https://www.amazon.com/PHP-MySQL-Dynamic-Web-Sites/dp/0134301846/ref=sr_1_5?ie=UTF8&qid=1545766851&sr=8-5&keywords=php'>PHP-MySQL-Dynamic-Web-Sites</a>  And probably deploying a shop or something a little more complicated (hopefully) and also integrating python (hopefully) in some shape or form.</strong> <a href='http://ec2-54-210-101-93.compute-1.amazonaws.com/index.php'>Here is the end result keep in mind it will only return certain popular results</a> <a href='https://github.com/latortuga71/Search-top-100-Wikipedia-Articles'>Here is the Repo!</a>

</p>
