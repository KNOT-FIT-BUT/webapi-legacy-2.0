# -*- coding: utf-8 -*-
'''
Created on 24. 4. 2014

@author: casey
'''
import ner
from core.annotation.tools._abstract import AbstractTool

class NER(AbstractTool):
    '''
    classdocs
    '''
    toolName = "ner"
    params=["lower", "remove_accent"]

    def __init__(self):
        '''
        Constructor
        '''
        super(NER, self).__init__()
        self.require = ['asset', 'input_data']
        self.assetPart = "kb"
        
    def _hook(self, request):
        request.ongoing_data = self.call(request.input_data, request.asset, request.tool_params)
        
    def call(self, input_data, asset, params):
        kb = asset.getPart(self.assetPart)
        ner.dictionary=None
        data = ner.recognize(kb, input_data, False, False, False, params["lower"], params["remove accent"])
        print data
        return data