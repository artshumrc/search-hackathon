
from elasticsearch import Elasticsearch, helpers
import os
import json
import requests


def list_folders (dir):
    r = []
    for root, dirs, files in os.walk(dir):
        if root != dir:
            r.append(root)
    return r


def ensure_dir(file_path):
    directory = os.path.dirname(file_path)
    if not os.path.exists(directory):
        os.makedirs(directory)


def list_files(dir):
    for root, dirs, files in os.walk(dir):
        return files


def main(directory):
    ecco_mapping = {"ecco-doc": {"properties": { "chunkID":{"type":"text"}, "documentID":{"type": "integer"}, "ecco": { "type": "nested", "properties": { "documentID":{"type":"integer"}, "ESTCID": {"type": "text"}, "unit": {"type": "text"}, "reel": {"type": "integer"}, "mcode": {"type": "text"}, "pubDate": {"type":"date"}, "releaseDate":  {"type": "date"}, "sourceBibCitation": {"type": "text"}, "sourceLibrary": {"type": "text"}, "language": {"type": "text"}, "module": {"type": "text", "analyzer": "keyword"}, "documentType": {"type": "text"}, "notes": {"type": "text"}, "authorGroup": {"type": "text"}, "titleGroup": {"type": "text"}, "volumeGroup": {"type": "text"}, "imprint": {"type": "text"}, "collation": {"type": "text"}, "publicationPlace": {"type": "text"}, "totalPages": {"type": "integer"}, "SourceDocPath": {"type": "text"}}}, "hollis": {"type": "nested","properties": {"BIB_DOC_CHAR": {"type": "integer"}, "estcid": {"type": "text"}, "estcid with leading zeroes": {"type": "text"}, "hollis permalink": {"type": "text"}, "TITLE_DISPLAY": {"type": "text"},"AUTHOR": {"type": "text"}, "IMPRINT": {"type": "text"},"HOL_TEXT": {"type": "text"}}}, "fulltext": {"type": "text"}}}}
    es = Elasticsearch([{'host': 'localhost', 'port': 9200}])
    INDEX_NAME = "ecco_index"
    TYPE_NAME = "ecco_doc"
    ID_FIELD = "chunkID"

    if es.indices.exists(INDEX_NAME):
        print("deleting '%s' index..." % (INDEX_NAME))
        res = es.indices.delete(index=INDEX_NAME)
        print(" response: '%s'" % (res))

    # test - one shard and no replicas
    # request_body = {"settings": {"number_of_shards": 1,"number_of_replicas": 0},"mappings": ecco_mapping}
    # print("creating '%s' index..." % (INDEX_NAME))
    # res = es.indices.create(index=INDEX_NAME, body=request_body)
    # print(" response: '%s'" % (res))
    ##mapping_index = es.indices.put_mapping(index=INDEX_NAME, doc_type=TYPE_NAME, body=ecco_mapping)
    ##print(" mapping index response: '%s'" % (mapping_index))

    #need to bulk index documents: go through each folder, create an array of files, bulk index at the folder level, then next
    ecco_folders = list_folders(directory)
    count = 0
    # giant_json = ''
    for folder in ecco_folders:
        count += 1
        files = list_files(folder)
        bulk_data = []
        for file in files:
            filename = file.rsplit('.', 1)[0]
            with open(folder + "/" + file, 'r', encoding='utf-8') as f:
                chunk = json.load(f)
                chunkID = chunk['documentID'] + "_" + filename
                chunk['chunkID'] = chunkID
                metadata = {'_index': INDEX_NAME, '_type': TYPE_NAME, '_id': chunkID}
                #bulk_data.append(metadata)
                #bulk_data.append(chunk)
                # giant_json.append(metadata)
                # giant_json.append("\n")
                # giant_json.append(chunk)
                # giant_json.append("\n")
                # print(giant_json)
                data_dict = {
                    '_op_type': 'index',
                    '_index': INDEX_NAME,
                    '_type': TYPE_NAME,
                    '_id': chunkID,
                    '_source': chunk
                }
                bulk_data.append(data_dict)
        if count % 25 == 0:
            print("Indexing " + str(count) + " of " + str(len(ecco_folders)) + " folders")
        #res = es.bulk(index=INDEX_NAME, body=bulk_data, refresh=True)
        #print(res)
        helpers.bulk(client=es, actions=bulk_data)
        es.indices.refresh()
    # sanity check
    res = es.search(index=INDEX_NAME, size=2, body={"query": {"match_all": {}}})
    print(" response: '%s'" % (res))
    print("Complete")


res = requests.get('http://localhost:9200')
print(res.content)
main("/mnt/data/")

