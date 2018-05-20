from elasticsearch import Elasticsearch, helpers
import os, json, copy

es = Elasticsearch()

stemSettings = {
  "settings": {
    "analysis": {
      "analyzer": {
        "english_exact": {
          "tokenizer": "standard",
          "filter": [
            "lowercase"
          ]
        }
      }
    }
  },
  "mappings": {
    "_doc": {
      "properties": {
        "body": {
          "type": "text",
          "analyzer": "english",
          "term_vector": "with_positions_offsets_payloads",
          "store" : True,
          "fields": {
            "exact": {
              "type": "text",
              "analyzer": "english_exact"
            }
          }
        },
        "documentID": { "type": "text" },
        "estcid": { "type": "text" },
        "pubDate": { "type": "date" },
        "finalRecon": { "type": "text" },
        "gender": { "type": "text" },
        "birthFinal": { "type": "integer" },
        "deathFinal": { "type": "integer" },
        "titleGroup": { "type": "text" },
        "imprint": { "type": "text" },
        "publicationPlace": { "type": "text" },
        "totalPages": { "type": "integer" },
        "url": { "type": "text" },
        "totalvolumes": { "type": "integer" },
        "volumenumber": { "type": "integer" },
      }
    }
  } # from https://www.elastic.co/guide/en/elasticsearch/reference/master/mixing-exact-search-with-stemming.html
}

with open('metadata.json') as f:
    metadata = json.load(f)

es.indices.create(index='smol-ecco', ignore=400, body=stemSettings) # normal index
loop_index = 0
bulk_data = []

for subdir, dirs, files in os.walk(os.getcwd() + '/data'):
    for filename in files:
        if (filename[-4:] == '.txt'):
            with open(os.path.join(subdir, filename)) as textfile:

                loop_index += 1

                text = textfile.read()
                docid = subdir.split('/')[-1]
                if (docid in metadata):
                    sourcedict = copy.deepcopy(metadata[docid])
                else:
                    sourcedict = {}
                sourcedict["body"] = text

                fileid = docid + "_" + filename[:-4]

                data_dict = {
                    '_op_type': 'index',
                    '_index': 'smol-ecco',
                    '_type': '_doc',
                    '_id': fileid,
                    '_source': sourcedict
                }
                bulk_data.append(data_dict)

                # es.create(index='smol-ecco', body=text, doc_type='_doc', id=fileid)
                print(fileid)

                if (loop_index % 25 == 0):
                    helpers.bulk(client=es, actions=bulk_data)
                    es.indices.refresh()
                    bulk_data = []

helpers.bulk(client=es, actions=bulk_data)
es.indices.refresh()
