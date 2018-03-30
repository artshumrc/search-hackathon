import pymongo
import json

# create mongo database
client = pymongo.MongoClient("mongodb+srv://searchhackathon:searchhackathon@search-hackathon-gr4pq.mongodb.net/test")
db = client.test
coll = db.collection

querywords = ['put', 'in', 'the', 'words', 'you', 'want', 'to', 'query', 'here']

for query in querywords:
    result = coll.find_one({'word': query})
    print("Results for ", query)
    if (result != None):
        print(json.dumps(result['counts'], indent=2))
    else:
        print("No results")
