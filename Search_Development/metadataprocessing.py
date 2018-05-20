import csv
import datetime
import json
import re

outputdict = {}

for i in [1, 3, 4]:
    with open('metadata_' + str(i) + '.csv') as metadatafile:
        filereader = csv.reader(metadatafile)
        for line in filereader:
            if (i == 1):
                line = line[0:7] + line[8:]
            documentID = line[0]
            if (documentID == '') or (documentID in outputdict) or (not documentID.isdigit()):
                print("Error in documentID, line is: ", line)
            else:
                documentID = documentID
                estcid = line[1]
                pubDate = line[2]
                if ((not pubDate.isdigit()) or (len(pubDate) != 8)):
                    print("Error in pubDate,", pubDate.isdigit(), len(pubDate), pubDate, " line is: ", line)
                    continue
                year = int(pubDate[0:4])
                month = int(pubDate[4:6])
                day = int(pubDate[6:8])
                if (month < 1) or (month > 12):
                    print("Error in pubDate ", pubDate, " line is: ", line)
                    continue
                pubDate = datetime.date(year, month, day)
                finalRecon = line[6]
                finalRecon = re.sub(r'\[\]', '', finalRecon)
                gender = line[11]
                if (line[13] != ''):
                    birthFinal = int(line[13])
                else:
                    birthFinal = -1
                if (line[15] != ''):
                    deathFinal = int(line[15])
                else:
                    deathFinal = -1
                titleGroup = line[17].strip()
                imprint = line[18].strip()
                publicationPlace = line[19]
                if (line[20].isdigit()):
                    totalPages = int(line[20])
                else:
                    totalPages = -1
                url = line[8]

                outputdict[documentID] = {
                    "documentID": documentID,
                    "estcid": estcid,
                    "pubDate": str(pubDate),
                    "finalRecon": finalRecon,
                    "gender": gender,
                    "birthFinal": birthFinal,
                    "deathFinal": deathFinal,
                    "titleGroup": titleGroup,
                    "imprint": imprint,
                    "publicationPlace": publicationPlace,
                    "totalPages": totalPages,
                    "url": url
                }

# print(json.dumps(outputdict, indent=2))
with open('metadata.json', 'w') as outfile:
    json.dump(outputdict, outfile, indent=2)
