function EntityList(container, mediator){
	this.mediator = mediator;
	this.container_selector = container;
	this.container = $(container);
	this.container.html( "\
		<div id='entityListHeader' class='ui purple inverted menu'>\
			<div class='title item'>\
				<i class='list icon'> </i> Entities\
			</div>\
			<div class='ui icon buttons right menu purple inverted'>\
			<div class='ui button popup item' title='Sort' data-action='sort' data-arg='0'>\
					<i class='sort icon'> </i>\
			</div>\
			<div class='ui top right pointing dropdown button' id='entityFilter'>\
		    	<i class='filter icon'> </i>\
		    	<div class='menu' >\
			      	<div class='ui grid celled'>\
			      		<div class='one wide column' id='pickerBox'>\
			      			<div id='colorPicker'></div>\
			      		</div>\
			      		<div class='three wide column'>\
			      		<table class='ui table collapsing compact small' id='entityFilterList'>\
			      		</table>\
			      		<div class='3 ui buttons mini fluid'>\
							<div class='ui positive enable button'>Enable All</div>\
							<div class='ui toggle button'>Toggle All</div>\
							<div class='ui negative disable button'>Disable All</div>\
						</div>\
			      		</div>\
			      	</div>\
			    </div>\
		  	</div>\
			<div class='ui top right pointing button'>\
				<i class='settings icon'>\</i>\
			    <div class='menu'>\
		    	</div>\
			</div>\
		</div>\
	</div>\
	<div id='entityListContent'>\
	\
	</div>\
	");
		
	this.header = $("#entityListHeader");
	this.view = $("#entityListContent");
	this.activeResult = null;
	this.container.click($.proxy(this.localOnClickHandler, this));
	this.sortType = 0;
	this.sortAction = ["sort","sort alphabet","sort alphabet descending"];
	this.filter = [];
	var self = this;
	$("#pickerBox").hide();
	$('.enable.button').on('click', function(event) {
		stopPropagation(event);
		$(".filterchbox").checkbox("enable");
    	self.filter = [];
    	self.visualize();
  	});
  	$('.disable.button').on('click', function(event) {
		stopPropagation(event);
		$(".filterchbox").checkbox("disable");
    	self.filter = Object.keys(self.activeResult.groups);
    	self.visualize();
  	});
  	$('.toggle.button').on('click', function(event) {
		stopPropagation(event);
		self.filter = [];
		$(".filterchbox").checkbox("toggle");
		$(".filterchbox").each(function(index,value){
			var target = $(value).children("input[type='checkbox']");
			if(!target.prop("checked")){
				self.filter.push(target.attr("name"));
			}
		});
    	self.visualize();
  	});
	
}

EntityList.prototype = {
	
	pack : function (screenHeight, heightPercentage) {
		var headerH = this.header.outerHeight(true);
		var container = Math.floor(screenHeight/100*heightPercentage);
		var usable = container-headerH;
		changecss(this.container_selector, "height", container+"px");
		changecss(this.container_selector, "max-height", container+"px");
		changecss("#entityListContent", "height", usable+"px");
		changecss("#entityListContent", "max-height", usable+"px");
	},
	
	setActiveResult: function(result){
		this.activeResult = result;
		this.generateFilterGroup();
	},
	
	generateFilterGroup: function(){
		$("#entityFilterList .checkbox").checkbox();
		$("#entityFilter").dropdown("destroy");
		var keys = Object.keys(this.activeResult.groups);
		keys.sort();
		var cols = 2, rows = Math.ceil(keys.length/cols);
		console.log(this.activeResult.groups, cols, rows);
		var output = "<tbody>";
		var checked;
		for(var r =0; r < rows; r++){
			output+="<tr>";
			for(var c = 0;c < cols; c++){
				if(r*cols + c < keys.length){
					var key = keys[r*cols + c];
					checked = " checked ";
					if($.inArray(key,this.filter) > -1){
						checked = " ";
					}
					output+="<td><div class='ui toggle checkbox filterchbox'>\
	  							<input type='checkbox' name='"+key+"'"+checked+"></input>\
	  							<label ><strong class='bg-"+key+" rnd' data-group='"+key+"'>"+this.activeResult.groups[key].name+"</strong></label>\
							</div><i class='color basic icon black pickero' data-action='changeColor' data-arg='"+key+"'></i></td>";
				}else{
					output+="<td></td>";
				}
			}
			output+="</tr>";
		}
		/*output +="<tr><th colspan='"+cols+"'><div class='3 ui buttons mini fluid'>\
									<div class='ui positive enable button'>Enable</div>\
									<div class='ui toggle button'>Toggle</div>\
									<div class='ui negative disable button'>Disable</div>\
								</div>\</th></tr>";*/
		output += "</tbody>";
		$("#entityFilterList").html(output);
		$("#entityFilter").dropdown({debug:false, on: 'click', duration:10, delay: {show: 50, hide: 10},action:"nothing"});
		$(".checkbox").checkbox({context:true});//onChange: $.proxy(this.onFilterChange,this)
		$("#colorPicker").colpick({flat:true, submit:true,layout:'hex',onSubmit:$.proxy(this.onColorChange,this)}).colpickSetColor("FFFFFF",true);
		//$(".pickero").click(function(){;});
		
	},
	
	localOnClickHandler: function (event){
		
		var target = $(event.target);
		console.log(event,target, this.filter);
		switch(true){
			case target.is("span.alabel"):
				var entID = target.attr("data-entity");
				this.mediator.publish("action", "entitySelect", {"entityID":entID,"itemID":null});	
			break;
			case (target.is("div") || target.is("i") || target.is("span")):
				target = ($(event.target).is("i.icon")&& !$(event.target).is("i.pickero")) ? $(event.target).parent() : $(event.target);
	    		var action = target.attr("data-action");
	    		if(action != null || action != undefined){
		    		var argument = target.attr("data-arg");
		    		//console.log("local handler",action, argument);
					switch(action){
						case "sort":
							var targetIcon = target.children().first();
							targetIcon.removeClass(this.sortAction[this.sortType]);
							this.sortType = ++this.sortType % this.sortAction.length;
							targetIcon.addClass(this.sortAction[this.sortType]);
							target.attr("data-arg", this.sortType);
							this.visualize();
						break;
						case "changeColor":
							var color = $(".bg-"+argument).css('background-color');
							console.log(rgb2hex(color,false),argument);
							$("#colorPicker").colpickSetColor(rgb2hex(color,false),true);
							$("#colorPicker").attr("data-arg",argument);
							$("#pickerBox").show();
						break;
					}
				}
				stopPropagation(event);
			break;
			case target.is("strong") || target.is("label"):
				target = $(event.target).is("strong") ? $(event.target) : $(event.target).find("strong");
				var group = target.attr("data-group");
				if(target.parent().prev("input[name='"+group+"']").prop("checked")){
					var index = this.filter.indexOf(group);
					if (index > -1) {
    					this.filter.splice(index, 1);
					}
				}else{
					if($.inArray(group,this.filter) == -1){
						this.filter.push(group);
					}
				}
				this.visualize();
				stopPropagation(event);
			break;
			default:
				this.mediator.publish("action", "entityDeselect", {});
				stopPropagation(event);
			
		}
		
		 
		
	},
	
	onColorChange: function(hsb,hex,rgb,element,flag){
		var arg = $(element).attr("data-arg");
		changecss("."+arg,"color","#"+hex);
		changecss(".bg-"+arg,"background-color","#"+hex);
		$("#pickerBox").hide();
		$("#colorPicker").removeAttr("data-arg");
	},
	
	onFilterChange: function(event){
		console.log("filter change",event);
	},
	
	visualize: function(){
		if(this.activeResult == null)
			return;
		var output = "";
		var entities = this.activeResult.entities;
		var result = Array();
		for(var i in entities){
			var entity = entities[i]; 
			//console.log(i, entity, this.activeResult.items[entity.items[0]]);
			var pid = entity.preferred;
			var group = entity.group;
			var text = this.getBestTextField(this.activeResult.kb_records[pid]) || this.activeResult.items[entity.items[0]][4];
			//output+="<span class='alabel bg-"+group+"' data-entity='"+i+"'>"+text+"</span>";
			result.push(Array(i, group, text));
		}
		if(this.sortType > 0){
			var srtfnc = (this.sortType == 1) ? function(a,b){
			var upA = a[2].toUpperCase();
    		var upB = b[2].toUpperCase();
    		return (upA < upB) ? -1 : (upA > upB) ? 1 : 0;
			} : function(a,b){
			var upA = a[2].toUpperCase();
    		var upB = b[2].toUpperCase();
    		return (upA < upB) ? 1 : (upA > upB) ? -1 : 0;
			} ;
			result.sort(srtfnc);
		}
		var self = this;
		result.forEach(function(item){
			//console.log($.inArray(item[1],this.filter),item[1],self.filter);
			if($.inArray(item[1],self.filter) == -1)
			output+="<span class='alabel bg-"+item[1]+"' data-entity='"+item[0]+"'>"+item[2]+"</span>";
		});
		this.view.html(output);
		
		var selected = $(".sel").first();
		if(selected.is("strong")){
			var entID = selected.attr("data-entity");
			this.mediator.publish("action", "entitySelect", {"entityID":entID,"tags":""});
		}
	},
	
	getBestTextField : function(kb_item, show_count){
		if(kb_item != null && kb_item !=undefined ){
			var fields = ["preferred term","name","display term"];
			var field = "";
			var text = "";
			for(var i in fields){
				field = fields[i];
				if(kb_item[field] != "" && kb_item[field] != undefined){
					text = kb_item[field];
					break;
				}
			}
			return text;
		}
		return null;
	}
};

Object.defineProperty(EntityList.prototype, "constructor", {
	enumerable: false,
	value: EntityList
});

function rgb2hex(rgb, withHash){
 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
 return ((withHash) ? "#" : "") +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2);
}


