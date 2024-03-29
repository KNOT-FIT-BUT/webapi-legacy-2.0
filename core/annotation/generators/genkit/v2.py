# -*- coding: utf-8 -*-
'''
Created on 22. 5. 2014

@author: casey
'''
import os, sys
from collections import OrderedDict
from ner import dates


kb_records = {"kbID":{"entry"}}
entities = {
        "groupID":{
        "type":"entity",#date, interval
        "preferred":0,
        "others":[1,2,3,4],
        "items":[2,4,5,9]
        }
            }
items = [[0,14,"text",False, "groupID" ],[],[],[]]

features_code = {}

def generate(request):
    global features_code
    if not features_code:
        with open(os.path.join(os.path.dirname(os.path.realpath(sys.argv[0])),"api","NER","geoData.all"),"r") as f:
            data = f.read()
        for row in data.split("\n"):
            items = row.split("\t")
            if len(items) >=2:
                features_code[items[0]] = items[1]
    
    
    kb = request.asset.getPart("kb")
    itemID = 0;
    entityID= 0;
    kb_records = set([])
    tmp_entities = {}
    items = []
    groups = generateGroups(kb)
    result = request.ongoing_data
    for a in range(len(result)):
        item = result[a]
        item_id = None
        item_data = None
        tags = []
        group = None
        if isinstance(item, dates.Date):
            senses = None
            if item.class_type == item.Type.DATE:
                item_id = str(item.iso8601)
                item_data= [tags,item.s_offset, item.end_offset, item.source, str(item.iso8601)]
                group = "cd"
            elif item.class_type == item.Type.INTERVAL:
                item_id = str(item.date_from)+str(item.date_to)
                item_data= [tags,item.s_offset, item.end_offset, item.source, str(item.date_from), str(item.date_to)]
                group = "ci"
            else:
                continue
        elif item.preferred_sense:
            item_id = item.preferred_sense
            if item.is_coreference():
                tags.append("cf")
            item_data = [tags, item.begin, item.end, item.source]
            senses = list(item.senses)
            kb_records.update(senses)
            kb_records.add(item_id)
        else:
            continue
        
        if item_id and item_data:
            if item_id in tmp_entities:
                group = tmp_entities[item_id]
                groupid = group.keys()[0]
                groupdata = group.values()[0]
                groupdata["items"].append(itemID)
                item_data.insert(0,groupid)
            else:
                groupid = entityID
                entityID += 1
                groupdata = {
                    "preferred":item_id if type(item_id) is int else None,
                    "others":senses,
                    "items":[itemID],
                    "group":group
                    }
                item_data.insert(0,groupid)
                tmp_entities[item_id] = {groupid:groupdata}
            items.append(item_data)
            itemID += 1
    kb_rec = generateKBRecords(kb_records, kb)
    entities = {}
    

    for ent in tmp_entities.values():
        eid, data = ent.items()[0]
        if not data["group"]:
            if "generic" in kb.header:
                data["group"] = "generic"
            else:
                prefix = kb_rec[data["preferred"]]["id"].split(":")[0]
                data["group"] = prefix if prefix in groups else None
        entities[eid]=data
        
        
    return {
            "kb_records":kb_rec,
            "entities":entities,
            "items":items,
            "groups":groups
            }
        
def generateKBRecords(idSet, kb):
    global features_code
    splitter = kb.config["value_splitter"] if kb.config["value_splitter"] is not None else ""
    splitter = splitter.encode("utf-8")
    kb_records = {}
    for key in idSet:
        kb_data = OrderedDict()
        item_type = kb.get_field(key, 0)[0]
        if item_type in kb.header:
            columns = kb.header[item_type]
        else:
            columns = kb.header["generic"]
        for a in range(len(columns)):
                colname = columns[a];
                field_data = kb.get_field(key,a)
                if colname.startswith('*'):
                    field_data = field_data.split(splitter) if len(field_data) > 0 else ""
                    colname = colname[1:]
                elif colname == "feature code":
                    field_data = [field_data, features_code[field_data]] if field_data in features_code else field_data
                kb_data[colname] = field_data
        kb_records[int(key)] = kb_data
    return kb_records 


def generateGroups(kb):
    groups = kb.groups
    groups["cd"] = {"name":"date","dataPlus":None}
    groups["ci"] = {"name":"interval","dataPlus":None}
    return groups



