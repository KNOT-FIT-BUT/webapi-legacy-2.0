var applicatonConfig = {
	modules:{
		editor:{
			autoload:false,
			autoannotate:false,
			fontSize:null,
			fontFormat:null,
		},
		enititylist:{
			sort:0,
			hideEmpty:true,
			hideGroups:Array()
		},
		enitityinfo:{
			defaultView:true,
			hideEmpty:true
		},
		carousel:{
			delay:5000
		},
	},
	toolkit:{
		preferredTool:"ner",
		preferredAsset:"KBstatsMetrics",
		lastTool:null,
		lastAsset:null,
		smartSelect:false
	},
	groupColors:{}
	
};

$(document).ready(function(){
	//shell initialize
	var shell = new Shell();
	shell.init();
	
	//initialize css framework listeners
    $('.popup').popup({on: 'hover'});
    

   $('#testshit').sidebar({
    	overlay: true
  	});

    $('.nonebtn').click(function(){
    	$("#pageSidepanel").sidebar("toggle");
    	
    });
   
    shell.show();
    
	window.onresize = function(){
		throttle($.proxy(shell.pack, shell));
	};
    	
});




function Shell(){
	this.network = null;
	this.editor = null;
	this.entityList = null;
	this.entityInfo = null;
	this.carousel = null;
	this.pageDimmer = null;
	this.pageModal = null;
	this.sidePanel = null;
	this.mediator = null;
};


Shell.prototype = {
	init : function(){
		//init non-visual elements
		this.network = new Network(this);
		this.mediator = new Mediator();
		
		//init visual elements
		this.editor = new Editor("#leftTop", this.mediator);
		this.entityList = new EntityList("#leftBottom", this.mediator);
		this.entityInfo = new EntityInfo("#rightTop", this.mediator);
		this.carousel = new Carousel("#rightBottom", this.mediator);
		this.toolkit = new Toolkit('#pageSidepanel', this.mediator);
		
		//init static page elements
		this.pageDimmer = $("#pageDimmer").dimmer();
		this.pageModal = $("#pageModal"); 
		this.sidePanel = $("#pageSidepanel");
		
		//inin data from server
		this.network.getInitPack(); //get tools, assets, example_files, configs
		
		
		this.mediator.subscribe("action", $.proxy(this.onMessageAction, this));
		this.mediator.subscribe("event", $.proxy(this.onMessageEvent, this));
		
		$("body").click($.proxy(this.globalOnClickHandler, this));
	},
	
	dataReciever : function(){},
	
	pack: function(){
		var pageWidth = window.innerWidth,
			pageHeight = window.innerHeight;
		if (typeof pageWidth != "number"){
			if (document.compatMode == "CSS1Compat"){
				pageWidth = document.documentElement.clientWidth;
				pageHeight = document.documentElement.clientHeight;
			} else {
				pageWidth = document.body.clientWidth;
				pageHeight = document.body.clientHeight;
			}
		}
		pageHeight -= $("#headerMenu").outerHeight();
		this.editor.pack(pageHeight,55);
		this.entityList.pack(pageHeight,45);
		this.entityInfo.pack(pageHeight,55);
		this.carousel.pack(pageHeight,45);
		
	},
	
	show : function(){
		var self = this;
		if(!$('#panelWrapper').transition("is visible")){
			$('#panelWrapper').transition({
			    animation : 'fade',
			    duration  : '2s',
			    complete  : function() {
			      self.pack();
			      $('#pageDimmer').dimmer('hide');
		    	}
	  		});
  		}

	},
	
	onMessageAction: function(action, argument){
		console.log(action);
		switch(action){
			case "loadAsset":
				this.network.assetControl("load", argument);
			break;
			case "dropAsset":
				this.network.assetControl("drop", argument);
			break;
			case "entitySelect":
				$(".sel").each(function(){
	  				$(this).removeClass("sel");
				});
				$("[data-entity='"+argument.entityID+"']").each(function(){
					$(this).addClass("sel");
				})	;
			break;
			case "entityDeselect":
				$(".sel").each(function(){
	  				$(this).removeClass("sel");
				});
				
			break;
		}
			
	},
	
	onMessageEvent:function(event, argument){
		
	},
	
	onNetworkEvent: function(source, result){
		switch(source){
			case "getFile":
				this.editor.setText(result);
			break;
			case "getWebapiInitPack":
				this.editor.setExampleFiles(result.example_files);
				this.toolkit.update(result.tools, result.assets);
			break;
			case "annotate":
				//this.editor.setText(JSON.stringify(result, null, "  "));
				this.editor.setActiveResult(result);
				this.entityList.setActiveResult(result);
				this.entityInfo.setActiveResult(result);
				this.carousel.setActiveResult(result);
				this.editor.visualiseResult();
				this.entityList.visualize();
			break;
		}
	},
	onNetworkError: function(){
		
	},
	
	globalOnClickHandler: function(event){
		var target = $(event.target).is("i.icon") ? $(event.target).parent() : $(event.target);
		console.log(event.target);
		var action = target.attr("data-action");
    	if(action != null || action != undefined){
    		var argument = target.attr("data-arg");
    		console.log("global handler",action, argument);
			switch(action){
				case "loadRemoteFile":
				this.network.getFile(argument);
				break;
				case "annotate":
					try{
						var inputText = this.editor.getText();
						var asset = this.toolkit.getToolAndAsset();
						this.editor.setBussy(true);
						this.editor.disableControl();
						this.network.annotate(inputText, asset);
					}catch(error){
						console.log(error.name);
						this.sidePanel.sidebar("show");
					};
				break;
				case "annotateSelected":
				break;
				case "showToolkit":
					this.sidePanel.sidebar("show");
				break;
				case "switchMode":
				console.log($("a[data-action='switchMode']"));
					$("a[data-action='switchMode']").removeClass("active");
					target.addClass("active");
				break;
				case "showAppSettings":
					$('#pageModal').modal("show");
				break;
			}
		}
	},
};

Object.defineProperty(Shell.prototype, "constructor", {
	enumerable: false,
	value: Shell
});


function throttle(method, context) {
	clearTimeout(method.tId);
	method.tId= setTimeout(function(){
		method.call(context);
	}, 100);
};

function stopPropagation(event){
	if (event.stopPropagation){
		event.stopPropagation();
	} else {
		event.cancelBubble = true;
	}
};


String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
