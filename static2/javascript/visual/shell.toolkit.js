function Toolkit(container, mediator){
	this.mediator = mediator;
	this.container = $(container);
	this.container.sidebar({overlay:true});
	this.container.html("\
	  		<h3 class='ui header center aligned'><i class='icon archive'> </i>Assets &amp; Tools Manager</h3>\
	  		<div class='ui divider'> </div>\
				<div class='ui form'>\
				    <div class='field'>\
				      <label>Available Tools:</label>\
						  <div class='ui selection dropdown fluid' id='toolList'>\
							  	<input name='tool' type='hidden' value='ner'>\
							    <div class='default text'>Please select your favorite tool</div>\
							    <i class='dropdown icon'> </i>\
							    <div id='toolListInternal' class='menu ui transition hidden'> </div>\
						  </div>\
				    </div>\
				    <div id='toolError' class='ui red pointing above ui label fluid'>Please select a tool!</div>\
			    <div class='ui divider'> </div>\
	<div class='ui form'>\
		<div class='field'>\
			<label>Tool Parameters:</label>\
		    <div id='toolParams'>\
		    </div>\
	    </div>\
    </div>\
    <div class='ui divider'> </div>\
	<div class='field'>\
	<label>Assets Controll:</label>\
	<table class='ui table definition small compact center aligned'>\
		<thead>\
			<tr>\
				<th></th>\
				<th>Name</th>\
				<th>Type</th>\
				<th>Tool</th>\
				<th><abbr title='Status'><i class='icon off'> </i></abbr></th>\
				<th><abbr title='Control'><i class='icon cloud'> </i></abbr></th>\
			</tr>\
		</thead>\
		<tbody id='assetTable'>\
		</tbody>\
		<tfoot class='ui transition hidden'>\
		    <tr>\
			    <th colspan='6' class='' >\
			    	<div>\
			      		<ul >\
							<li>Name: </li>\
							<li>Description</li>\
							<li>Type:</li>\
							<li>Tools:</li>\
							<li>Status:</li>\
							<li>Control:</li>\
							<li>Parts:</li>\
						</ul>\
					</div>\
			    </th>\
		  	</tr>\
		 </tfoot>\
	</table>\
	<div id='assetError' class='ui red pointing above ui label fluid'>Please select an asset!</div>\
	</div>\
	<div class='ui green fluid button' data-action='hide'><i class='left icon'> </i>Hide</div>\
	</div>\
	");
	this.toolList = $("#toolList");
	this.paramList = $("#toolParams");
	this.toolListInternal = $("#toolListInternal");
	this.assetTable = $("#assetTable");
	this.toolError = $("#toolError");
	this.assetError = $("#assetError");
	this.toolError.hide();
	this.assetError.hide();
	
	this.container.click($.proxy(this.onClick, this));
	
	this.mediator.subscribe("action", $.proxy(this.onMessageAction, this));
	this.mediator.subscribe("event", $.proxy(this.onMessageEvent, this));
	
	this.tools = [];
	this.assets = [];
	this.lastSelectedAsset = "KBstatsMetrics";
	this.onInit = true;
}

Toolkit.prototype = {
	
	pack : function (screen_x, screen_y, width_p, height_p) {
		
	},
	
	update:function (tools, assets) {
		this.tools = tools;
		this.assets = assets;
		this.updateTools();
		this.updateAssets();
		if(this.onInit){
			this.onInit=false;
			this.updateParams();
		}
		
	},
	
	updateTools:function () {
		var self = this;
		
		this.toolList.dropdown('destroy');
		list = "";
		for(var tool in this.tools){
			list += "<a class='item' data-value='"+this.tools[tool].name+"'>"+this.tools[tool].name.toUpperCase()+"</a>";
		}
		this.toolListInternal.html(list);
		this.toolList.dropdown({debug:false,
    		onChange: function(val) {
    			self.updateParams();
        		self.updateAssets();
        		self.toolError.hide();
    		}
		});
		
	},
	
	updateParams:function(){
		var tool = this.toolList.dropdown("get value");
		console.log(tool, this.tools);
		var params = this.tools[tool].params;
		var output = "<form>";
		for(var param in params){
			//output+='<li><span>';
			output+='<input type="checkbox" value="'+params[param]+'" name="params">';
			output+=''+params[param]+'';
			//output+='</span></li>';
			output+='</br>';
		  
		}
		output+='</form>';
		this.paramList.html(output);
	},
	
	updateAssets:function () {
		var tool = this.toolList.dropdown("get value");
		var tbody = "";
		var tr = "<tr>";
		for(var a in this.assets){
			var tr = "<tr>";
			var disabled = "disabled='disabled'";
			if(this.assets[a]["state"] == 4 && this.isForSelectedTool(tool, this.assets[a]["tools"])){
				tr = "<tr class='positive'>";
				disabled = "";
				if(a==this.lastSelectedAsset)
					disabled="checked";
					this.assetError.hide();
				if(this.lastSelectedAsset == null){
					this.lastSelectedAsset = "KBstatsMetrics";
					disabled="checked";
				}
			}
			tbody+= tr;
			tbody+="<td><input name='assets' type='radio' value='"+a+"' "+disabled+"/></td>";
			tbody+="<td>"+this.assets[a]["name"]+"</td>";
			tbody+="<td>"+this.assets[a]["type"]+"</td>";
			tbody+="<td>"+this.assets[a]["tools"]+"</td>";
			tbody+="<td>"+this.getStatusIcon(this.assets[a]["state"])+"</td>";
			tbody+="<td>"+this.getControlIcon(this.assets[a]["state"])+"</td>";
			tbody+="</tr>";
		}
		this.assetTable.html(tbody);
	},
	
	isForSelectedTool: function(tool, assetTools){
		if(tool != "none"){
			if(Array.isArray(assetTools) && ($.inArray(tool, assetTools) > -1))
				return true;
			else if(tool == assetTools)
				return true;
		}
		return false;
	},
	
	getStatusIcon: function(status){
		
		icon = "<i class='warning icon'> </i>";//warning
		switch(status){
		case 0:
		  	icon = "<i class='empty checkbox icon'> </i>"; //add
		  break;
		case 1:
			icon = "<i class='cloud upload icon'> </i>"; //remove
		  break;
	    case 2:
		  icon = "<i class='loading icon'> </i>";
		  break;
		case 3:
		  icon = "<i class='loading icon'> </i>";
		  break;
		case 4:
		  icon = "<i class='checked checkbox icon'> </i>";
		  break;
		default:
		}
		return icon;
	},
	getControlIcon: function(status){
		icon = "<i class='warning icon'> </i>";//warning
		switch(status){
		case 0:
		  	icon = "<i class='icon add sign' data-action='loadAsset'> </i>"; //add
		  break;
		case 1:
			icon = "<i class='icon remove sign'> </i>"; //remove
		  break;
	    case 2:
		  icon = "<i class='icon lock'> </i>";
		  break;
		case 3:
		  icon = "<i class='icon lock'> </i>";
		  break;
		case 4:
		  icon = "<i class='icon remove sign' data-action='dropAsset'> </i>";
		  break;
		default:
		}
		return icon;
	},
	
	onClick: function(event){
		var target = $(event.target); 
    	var action = target.attr("data-action");
    	if(action != null || action != undefined){
    		console.log(action);
			switch(action){
				case "hide":
					this.container.sidebar('hide');
					stopPropagation(event);
				break;
				case "dropAsset":
					var assetName = target.closest('tr').find("input").attr("value"); 
					this.assets[assetName].state = 1;
					this.updateAssets();
					this.mediator.publish("action", "dropAsset",assetName);
					stopPropagation(event);
				break;
				case "loadAsset":
					var assetName = target.closest('tr').find("input").attr("value");
					this.assets[assetName].state = 1;
					this.updateAssets();
					this.mediator.publish("action", "loadAsset",assetName);
					stopPropagation(event);
				break;
			}
		}else if(target.is("input") && target.attr("type")=="radio"){
			this.lastSelectedAsset=target.attr("value");
			this.assetError.hide();
		}
		
	},
	
	onMessageAction: function(action, argument){
		
	},
	onMessageEvent:function(event, argument){
		
	},
	
	getToolAndAsset: function(){
		var tool = this.toolList.dropdown("get value");
		var asset = $("input[name=assets]:checked").val();
		var params = {};
		
		$.each($("input[name='params']"), function() {
  			params[$(this).val()] = $(this).is(':checked');
  		});
		
		console.log(tool, asset, params);
		if(tool=="none"){
			this.toolError.show();
			tool = null;
		}
		if(asset == null || asset == undefined){
			this.assetError.show();
			asset == null;
		}
		if(tool == null || asset == null)
			throw new AssetError("Tool not selected");
			
		return {"tool":tool,"asset":asset, "params":params};
		
	},
	
	
};

Object.defineProperty(Toolkit.prototype, "constructor", {
	enumerable: false,
	value: Toolkit
});


function AssetError(message){
	this.name = "AssetError";
	this.message = message;
};

AssetError.prototype = new Error();


