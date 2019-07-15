from selenium import webdriver
from selenium.webdriver.common.by import By
import csv

# Use path to chromedriver in your pc
driver = webdriver.Chrome("/home/jaymoh/Desktop/Projects/webscrapping/football_results/chromedriver")

driver.get("https://www.flashscore.co.ke/football/italy/serie-a-2010-2011/")

# for offline access use path th the offline flashscore html file
driver.get("file:///home/jaymoh/Desktop/Projects/webscrapping/football_results/Serie%20A%202010_2011%20results,%20Football%20Italy%20-%20FlashScore.html")

data = []

match = driver.find_elements(By.CSS_SELECTOR, "div.event__match.event__match--static.event__match--oneLine")
for each in match:
    ft_scores = each.find_elements(By.CSS_SELECTOR, "div.event__scores")
    ht_scores = each.find_elements(By.CSS_SELECTOR, "div.event__part")
    results = {
        'country' : driver.find_element(By.CSS_SELECTOR, "span.event__title--type").text,
        'league' : driver.find_element(By.CSS_SELECTOR, "span.event__title--name").text,
        'league_stage' : driver.find_element(By.CSS_SELECTOR, "div.event__round.event__round--static").text,
        'time' : each.find_element(By.CSS_SELECTOR, "div.event__time").text,
        'home_team' : each.find_element(By.CSS_SELECTOR, "div.event__participant.event__participant--home").text,
        'ft_home_score' : [i.text.split()[0] for i in ft_scores][0],
        'ft_away_score' : [i.text.split()[2] for i in ft_scores][0],
        'away_team' : each.find_element(By.CSS_SELECTOR, "div.event__participant.event__participant--away").text,
        'ht_home_score' : [list(i.text).pop(1) for i in ht_scores][0],
        'ht_away_score' : [list(i.text).pop(-2) for i in ht_scores][0]

    }

    data.append(results)

columns = ['country', 'league', 'league_stage', 'time', 'home_team', 'ft_home_score', 'ft_away_score', 'away_team', 'ht_home_score', 'ht_away_score']
with open("scrapped_results.csv", 'w+') as db:
    writer = csv.DictWriter(db, columns)
    writer.writerow({x: x for x in columns})

    for each in data:
        writer.writerow(each)

print(data)
driver.quit()
