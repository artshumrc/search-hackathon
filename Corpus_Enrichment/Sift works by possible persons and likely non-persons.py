import csv, re
file = "ecco_data_combined_metadata.csv"

possible_non_persons = []
likely_persons = []
 
        if re.search('[1-9]{4}-[1-9]{4}', row["authorGroup"]) is not None: # look for birth/death date ranges, as in "Pufendorf, Samuel, Freiherr von           1632           1694           1632-1694" 
            likely_persons += [row]
            print("Is this a person?")
            print(row["authorGroup"])
        elif re.search('[dl]\.\s[1-9]{4}', row["authorGroup"]) is not None: # look for death/flourishing dates
            likely_persons += [row]
            print("Is this a person?")
            print(row["authorGroup"])        
        elif re.search('[\w\s]+\.\s[\w\s]*', row["authorGroup"]) is not None: # look for hierarchical names, like "England and Wales. Parliament. House of Commons" 
            possible_non_persons += [row]
            print("Is this a non-person?")
            print(row["authorGroup"])
        else: #to do: write a function for filtering specific stopwords, such as "company"
            likely_persons += [row]
            print("Is this a person?")
            print(row["authorGroup"])

#testing: results need work
print("These might not be people")
for row in possible_non_persons:
    print(row["authorGroup"].strip())
