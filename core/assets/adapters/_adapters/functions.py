'''
Created on 13. 5. 2014

@author: casey
'''


def loadHeaderFromFile(filename):
    column_ext_def = {"g":{"type":"image"},
                      "u":{"type":"url"}
                      }
        
    columns = {}
    groups = {}
    with open(filename,'r') as f:
        raw_colums = f.read().strip()
        
    for row in raw_colums.split("\n"):
        column = []
        dataPlus = {}
        row_split = row.split("\t")
        row_head = row_split.pop(0)
        row_prefix, row_head, row_id = row_head.split(":")
        groups[row_prefix]= {"name": row_head.lower()}
        column.append(row_id.lower())
        for col_name in row_split:
            prefix = ""
            url = ""
            if ':' in col_name:
                col_split = col_name.split(":")
                prefix = ":".join(col_split[:-1])
                if "[" in prefix:
                    prefix,url = prefix.split("[")
                col_name = col_split[-1]
                for k in prefix:
                    if k in column_ext_def:
                        dataPlus[col_name.lower()] = {"type":column_ext_def[k]["type"],
                                                                     "data":url[:-1]
                                                                     }
                if "m" in prefix:
                    col_name = "*" + col_name
            column.append(col_name.lower())
        groups[row_prefix]["dataPlus"] = dataPlus
        columns[row_prefix] = column  
    return columns, groups
    
