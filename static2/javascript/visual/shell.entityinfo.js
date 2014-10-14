function EntityInfo(container, mediator){
	
	this.container_selector = container;
	this.container = $(container);
	this.container.html("\
		<div id='entityInfoHeader' class='ui inverted teal menu'>\
			<div class='title item'>\
				<i class='info icon'> </i> Textual Entity Information\
			</div>\
			<div class='icon menu right'>\
				<a class='item'>\
					<i class='browser icon'> </i>\
				</a>\
				<a class='item active'>\
					<i class='list layout icon'> </i>\
				</a>\
				<a class='item'>\
					<i class='dashboard icon'> </i>\
				</a>\
			</div>\
		</div>\
		<div id='entityInfoContent'>\
		</div>\
	");
	this.header = $("#entityInfoHeader");
	this.view = $("#entityInfoContent");
	this.activeResult = null;
	this.container.click($.proxy(this.localOnClickHandler, this));
	this.gender_list = {'M':'Male','F':'Female','U':'Unknown','O':'Others'};
	this.tags = {"cf":"coref"};
	if(mediator){
		this.mediator = mediator;
		this.mediator.subscribe("action", $.proxy(this.onMessageAction, this));
		this.mediator.subscribe("event", $.proxy(this.onMessageEvent, this));
	}else{
		this.mediator = function(){};
	}
	
}

EntityInfo.prototype = {
	
	pack : function (screenHeight, heightPercentage) {
		var headerH = this.header.outerHeight(true);
		var container = Math.floor(screenHeight/100*heightPercentage);
		var usable = container-headerH;
		changecss(this.container_selector, "height", container+"px");
		changecss(this.container_selector, "max-height", container+"px");
		changecss("#entityInfoContent", "height", usable+"px");
		changecss("#entityInfoContent", "max-height", usable+"px");
	},
	
	setActiveResult: function(result){
		this.activeResult = result;
	},
	
	onMessageAction: function(action, argument){
		switch(action){
			case "entitySelect":
				var entity = this.activeResult.entities[argument.entityID];
				this.showKbRow(entity.preferred, entity.group, argument.tags);
			break;
			case "entityDeselect":
				this.view.empty();
			break;
		}
	},
	onMessageEvent:function(event, argument){
		
	},
	
	showKbRow: function(rowID, group, tags){
		var dataPlus = (group != null) ? this.activeResult.groups[group].dataPlus : null;
		//console.log(group, dataPlus);
		var kb_row = this.activeResult.kb_records[rowID];
		var output = "<ul>";
		var data = "";
		var richdata = "";
		for(var i in kb_row){
			data = kb_row[i];
			if(data == "" || data==null)
				continue;

			if(Array.isArray(data)){
				var result = Array();
				var self = this;
				//console.log(data);
				kb_row[i].forEach(function(entry){
					//console.log(entry);
					result.push(self.generateKBColumn(i, entry, dataPlus, tags));
				});
				richdata = result.join("; ");
			}else{
				richdata = this.generateKBColumn(i, data, dataPlus, tags);
			}
				
			console.log(i,richdata);
			richdata = richdata.replace(/\\n/g, '<br />');
			//richdata = richdata.replace(/_/g, ' ');
			output += "<li>";
			output += "<b>"+i+": </b>"+richdata;
			output += "</li>";
			
		}
		output += "</ul>";
		this.view.html(output);
	},
	
	generateKBColumn: function(column, data, dataPlus, tags){
		var richdata = "";
		if(dataPlus != null && dataPlus.hasOwnProperty(column)){
				var dplus = dataPlus[column]; 
				switch(dplus.type){
					case "url":
					case "image":
					richdata = '<a href="'+dplus.data + data+'" target="_blank">'+data+'</a>';
					break;
					default:
						richdata = data;
					break;
				}					
		}else{
			console.log(column);
			switch(column){
				case "type":
				//console.log(typeof tags);
					//console.log((tags != undefined && tags != null));
					richdata = (tags != undefined && tags != null && tags != "") ? (data + " ["+this.tags[tags]+"]") : data;
				break;
				case "gender":
					richdata = this.gender_list[data];
				break;
				default:
					if(column.endsWith("url"))
						richdata = '<a href="'+data+'">'+data+'</a>';
					else
						richdata = data;
			}
		}
		return richdata;
	},
	
	localOnClickHandler: function(event){},
};

Object.defineProperty(EntityInfo.prototype, "constructor", {
	enumerable: false,
	value: EntityInfo
});



