# this assumes you've already fetched image filenames via OpenRefine, SPARQL, or whatever
# useful background: https://stackoverflow.com/questions/34393884/how-to-get-image-url-property-from-wikidata-item-by-api?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa

import hashlib
import pandas as pd

def wikidata_image_url(filename):
    filename = filename.encode('utf-8')
    directory = hashlib.md5(filename).hexdigest()[0]  + "/" + hashlib.md5(filename).hexdigest()[0] + hashlib.md5(filename).hexdigest()[1] + "/"
    fileurl = str('https://upload.wikimedia.org/wikipedia/commons/') + directory + filename.decode("utf-8")
    return fileurl

csv_input = pd.read_csv('example.csv')
csv_input['image url'] = csv_input['image filename'].apply(wikidata_image_url)
csv_input.to_csv('output.csv', index=False)
