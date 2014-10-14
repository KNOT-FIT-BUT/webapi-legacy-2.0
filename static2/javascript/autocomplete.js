result = {};
id = 0;
gender_list = {'M':'Male','F':'Female','U':'Unknown','O':'Others'};
tagso = {"cf":"coref"};
self = this;
lasttext = "";
lastautomat = "";
$(document).ready(function(){
	var jsonrpc = {"jsonrpc": "2.0", "method": "getAutocompleteInitPack", "params": {}, "id": id++};
	$.ajax({  
			type: "POST",  
			url: "/api/HTTP/jsonrpc",  
			data: JSON.stringify(jsonrpc),
			contentType: "application/json",
      		processData: false,
      		dataType: "json",
			success: parseInintPack
			
			
		});
	
	//$("#inputBox").keydown(function(){throttle(ACAjax);});
	$("#inputBox").on('textInput input change keydown paste', function(event){
	    //console.log(event);
	    throttle(ACAjax);});
	
	//document.onkeydown = KeyCheck;  //or however you are calling your method

	
	//var autocomplete = new Autocomplete();
});



function Autocomplete(){
	

}

Autocomplete.prototype = {
	
	
};

Object.defineProperty(Autocomplete.prototype, "constructor", {
	enumerable: false,
	value: Autocomplete
});

function enhanceName(duparr){
	var ecolumns = ["country","wikipedia url"];
	for(var i in ecolumns){
		enhanceBy(duparr,ecolumns[i]);
		console.log(ecolumns[i]);
	}
}

function enhanceBy(duparr, column){
	var text = "";
	var original = "";
	for(var i in duparr){
		//console.log(duparr, result);
		if(result.kb_records[duparr[i].id].hasOwnProperty(column)){
			switch(column){
				case "wikipedia url":
					original = pickBestText(result.kb_records[duparr[i].id]).toLowerCase();
					text = result.kb_records[duparr[i].id][column].substr(result.kb_records[duparr[i].id][column].lastIndexOf('/') + 1);
                    var parts = text.split(",");
					for(var s in parts){
                        var part = parts[s].replace("_"," ").trim();
                        var inOriginal = part.toLowerCase().indexOf(original);
                        var inText =duparr[i].name.toLowerCase().indexOf(part.toLowerCase());
                        if(inOriginal == -1 && inText == -1){
                            duparr[i].name +=", " + part;
                        }
                    }

				break;
				case "country":
					text = result.kb_records[duparr[i].id][column];
					if(!text.startsWith(", ")){
							text = ", " + text;
					}
					duparr[i].name+=text;
				break;
			}
			
			
		}
	}
};

function parseACResult(data){
	result = data.result;
	var output = "";
	var kb_records = data.result.kb_records;
	var orderlist = [];
	
	for(var i in kb_records){
		orderlist.push({name:pickBestText(kb_records[i]).capitalize('title'), id:parseInt(i)});
	}
	
	
	for(var i=0; i< orderlist.length; i++){
		var duparray = [];
		var text = orderlist[i].name;
		duparray.push(orderlist[i]);
		for (var j=i+1; j<orderlist.length; j++) {
    		if (orderlist[j].name == text){
    			duparray.push(orderlist[j]);
    			console.log("*",orderlist[i].name, orderlist[j].name, orderlist[j].name.match(text));
    		}
		}
		if(duparray.length > 1){
			enhanceName(duparray);
		}
	}
	
	var sorter = function(a,b){
		var ax = kb_records[a.id].confidence;
		var bx = kb_records[b.id].confidence;
		return bx-ax;
	};
	
	orderlist.sort(sorter);
	//console.log(orderlist, kb_records);

	for(var f in orderlist){
		var i = orderlist[f].id;
		var kbrow = kb_records[i];
		//console.log(i);
		output += "<a class='item dataitem' data-action='selectRow' data-arg='"+i+"'>";
		//output += "<div class='right floated ui label'>"+(entities[i].others.length + 1)+"</div>";
		output += "<div class='description'>"+orderlist[f].name+"</div>";
		output += "</a>";

	}
	$("#sugestion").html(output);
	$(".item").click(showEntry);
	return false;

}

function pickBestText(kb_item){
	var fields = ["name","display term"];
	var field = "";
	var text = "";
	//console.log(kb_item);
	for(var i in fields){
		field = fields[i];
		if(kb_item.hasOwnProperty(field) && kb_item[field] != "" && kb_item[field] != undefined){
			text = kb_item[field];
			break;
		}
	}
	return text;
}

function parseACResult2(data){
	var result = data.result;
	var output = "";
	var entities = data.result.entities;
	for(var i in entities){
		output += "<a class='item' data-action='selectRow' data-arg='"+i+"'>";
		output += "<div class='right floated ui label'>"+(entities[i].others.length + 1)+"</div>";
		output += "<div class='description'>"+entities[i].name+"</div>";
		output += "</a>";
	}
	$("#sugestion").html(output);
	$(".item").click(showEntry);
	return false;
}

function showEntry(event){
	$(".item.active").removeClass("active");
	$(".item.yellow").removeClass("yellow");
	var target = !$(event.target).is("a.item") ? $(event.target).parent() : $(event.target);
	target.addClass("active");
	var entity = target.attr("data-arg");
	$('[data-arg="'+entity+'"]').addClass("yellow");
	//console.log(result, entity);
	//showKbRow(result.entities[entity].preffered, null,[]);
	showKbRow(entity, null,[]);
	//generateVariationList(result.entities[entity].others.length, entity);
}

function selectVariant(event){
	var target = $(event.target);
	$(".alabel.activo").removeClass("activo");
	target.addClass("activo");
	
	var entity = target.attr("data-entity");
	var otherID =  target.attr("data-others");
	if(otherID < 0){
		showKbRow(result.entities[entity].preffered, null,[]);
	}else{
		showKbRow(result.entities[entity].others[otherID], null,[]);
	}
}

function generateVariationList(count, entityID){
	var output = "";
	var active = "activo";
	for(var i = 0; i <= count; i++){
		output += "<a class='alabel "+active+"' data-others='"+(i-1)+"' data-entity='"+entityID+"'>"+(i+1)+"</div>";
		active = "";
	}
	$("#variations").html(output);
	$(".alabel").click(selectVariant);
	//$(".alabel").blur(function(){$("#kbEntry").empty();});
}

function ACAjax(){

	var value = $("#inputBox").val();
	var automat =  $("input[name=fsaAutomat]").val();//$("#fsaForm").dropdown("get value");

	if((value == lasttext && lastautomat == automat)){
	   return;
	}
	    lasttext = 	value;
	    lastautomat = automat;
	    $("#kbEntry").empty();
		var jsonrpc = {"jsonrpc": "2.0", "method": "autocomplete", "params": {"inputData":value+"\n","automat":automat}, "id": id++};
		console.log(jsonrpc);
		$.ajax({  
			type: "POST",  
			url: "/api/HTTP/jsonrpc",  
			data: JSON.stringify(jsonrpc),
			contentType: "application/json",
      		processData: false,
      		dataType: "json",
			success: parseACResult
			
			
		});
	
}

function parseInintPack(data){
	//console.log(data);
	var output = "";
	var automats = data.result.automats.sort();
	for(var i in automats){
		output += "<div class='item' data-value='"+automats[i]+"'>"+automats[i]+"</div>";
	}
	$("#fsaList").html(output);
	$("#fsaForm").dropdown({debug:false, on: 'click', duration:10, delay: {show: 50, hide: 10}, onHide:ACAjax});
	$("#fsaForm").dropdown("set value",automats[0]).dropdown("set selected",automats[0]);
	
	return false;
}

function throttle(method, context) {
	clearTimeout(method.tId);
	method.tId= setTimeout(function(){
		method.call(context);
	}, 200);
};

function showKbRow(rowID, group, tags){
	if(rowID == null || rowID == undefined)return;
	var dataPlus = (group != null) ? self.result.groups[group].dataPlus : null;
	//console.log(rowID, group, self.result);
	var kb_row = self.result.kb_records[rowID.toString()];
	var output = "<ul>";
	var data = "";
	var richdata = "";
	for(var i in kb_row){
		data = kb_row[i];
		if(data == "" || data==null)
			continue;

		if(Array.isArray(data)){
			var result = Array();
			//console.log(data);
			kb_row[i].forEach(function(entry){
				//console.log(entry);
				result.push(generateKBColumn(i, entry, dataPlus, tags));
			});
			richdata = result.join("; ");
		}else{
			richdata = generateKBColumn(i, data, dataPlus, tags);
		}
			
		richdata = richdata.replace(/\\n/g, '<br />');
		//richdata = richdata.replace(/_/g, ' ');
		output += "<li>";
		output += "<b>"+i+": </b>"+richdata;
		output += "</li>";
		
	}
	output += "</ul>";
	$("#kbEntry").html(output);
}

function generateKBColumn(column, data, dataPlus, tags){
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
		//console.log(column);
		switch(column){
			case "type":
			//console.log(typeof tags);
				//console.log((tags != undefined && tags != null));
				richdata = (tags != undefined && tags != null && tags != "") ? (data + " ["+tagso[tags]+"]") : data;
			break;
			case "gender":
				richdata = gender_list[data];
			break;
			default:
				if(column.endsWith("url"))
					richdata = '<a href="'+data+'">'+data+'</a>';
				else
					richdata = data;
		}
	}
	return richdata;
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.startsWith = function(preffix) {
    return this.indexOf(preffix, 0) !== -1;
};

String.prototype.capitalize = function(type) {
 
	// if type = all, capitalize first letter of each word
	if(type === 'all'){
		array		= this.split(' '); // split on spaces
		capitalized	= '';
 
		$.each(array, function( index, value ) {
			capitalized += value.charAt(0).toUpperCase() + value.slice(1);
 
			if( array.length != (index+1) )
				capitalized += ' '; // add a space if not end of array
		});
		return capitalized;
	}
 
	// if type = title, capitalize first letter of each word so long as it is not
	// an article, coordinate conjunction, preposition (etc) unless it is the first word
	// -> traditionally left uppercase if over 4 or 5 letters
	// -> I'm only doing the common ones, add more in the doNotCapitalize array
	if(type === 'title'){
		array		= this.split(' '); // split on spaces
		capitalized	= '';
		doNotCapitalize	= ["a", "an", "and", "as", "at", "but", "by", "etc", "for", "in", "into", "is", "nor", "of", "off", "on", "onto", "or", "so", "the", "to", "unto", "via"];
 
		$.each(array, function( index, value ) {
			// only capitalize if first word or not in doNotCapitalize array
			if( index === 0 || $.inArray(value, doNotCapitalize) === -1 ) // inArray returns -1 for false, 0 for element index in array
				capitalized += value.charAt(0).toUpperCase() + value.slice(1);
			else
				capitalized += value;
 
			if( array.length != (index+1) )
				capitalized += ' '; // add a space if not end of array
		});
		return capitalized;
	}
	
	// else just capitalize first letter of first word
	return this.charAt(0).toUpperCase() + this.slice(1);
};
 
function searchStringInArray (str, strArray) {
	for (var j=0; j<strArray.length; j++) {
    	if (strArray[j].match(str)) return j;
	}
	return -1;
}
