function Network(observer){
	this.sender = null;
	this.events = null;
	this.id = 1;
	this.observer = observer;
	this.init();
}

Network.prototype = {
	
	init : function(){
		var ws_available = typeof(WebSocket)!== "undefined";
		var sse  = typeof(EventSource) !== "undefined";
		var web_worker = typeof(Worker) !== "undefined";
		this.event_pooling();
	},
	
	event_ws: function(){},
	event_pooling : function(){
		var self = this;
		setInterval(function(){
			self.send("getWebapiInitPack",null);
		},4000);
	},
	event_sse : function(){},
	
	sender_ws : function(){},
	sender_ajax : function(){},
	
	messageHandler : function(){},
	
	send: function(method, params){
		var jsonrpc = {"jsonrpc": "2.0", "method": method, "params": params, "id": this.id++};
		$.ajax({  
			type: "POST",  
			url: "/api/HTTP/jsonrpc",  
			data: JSON.stringify(jsonrpc),
			contentType: "application/json",
      		processData: false,
      		dataType: "json",
			success: $.proxy(this.success,this),
			error:function(jqXHR,textStatus, errorThrown){
				console.log("some shit happend"+errorThrown);
			}
			
		});
		
	},
	
	getInitPack: function(){
		this.send("getWebapiInitPack",null);
		//return {"configs": [], "example_files": ["example_input2_a", "The_Four_Seasons.txt", "example_input2", "Paul_Kane", "traveling_artist_part_3", "traveling_artist_part_2", "Dossier_and_OS_texts.docx"], "tools": ["NER", "Figa"], "assets": [{"description": "", "type": "", "state": 0, "tools": "figa", "id": "Freebase", "name": "FreeBase"}, {"description": "", "type": "", "state": 0, "tools": "figa", "id": "Wikipedia", "name": "Wikipedia"}, {"description": "", "type": "", "state": 0, "tools": ["ner", "figa"], "id": "KBstatsMetrics", "name": "KB stats Metrics"}]};
	},
	
	annotate: function(text, asset){
		this.send("annotate",{"text":text,"tool":asset.tool, "assetName":asset.asset, "toolParams":asset.params});
	},
	
	getFile: function(name){
		this.send("getFile",{filename:name});
		
	},
	
	getConfig: function(name){
		this.send("getConfig",{filename:name});
		
	},
	
	assetControl: function(action, name){
		this.send(action+"Asset",{assetName:name});
		
	},
	
	success: function(data){
		if(data.hasOwnProperty("jsonrpc") && data.hasOwnProperty("result")){
			var result = data["result"];
			var source = data["source"];
			this.observer.onNetworkEvent(source, result);
			
		}
	}
};

Object.defineProperty(Network.prototype, "constructor", {
	enumerable: false,
	value: Network
});