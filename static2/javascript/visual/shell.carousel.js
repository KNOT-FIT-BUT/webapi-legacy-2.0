function Carousel(container, mediator){
	this.mediator = mediator;
	this.container_selector = container;
	this.container = $(container);
	this.container.html("\
		<div id='carouselHeader' class='ui green inverted menu '>\
			<div class='title item'>\
				<i class='photo icon'> </i> Visual Entity Information\
			</div>\
			<div class='icon menu right'>\
				<a class='item' title='a' data-action='prev'>\
					<i class='angle left icon'> </i>\
				</a>\
				<div id='imgCounter' class='item'>\
					<b>-/-</b>\
				</div>\
				<a class='item' data-action='next'>\
					<i class='angle right icon'> </i>\
				</a>\
				<a class='item'>\
					<i class='dashboard icon'> </i>\
				</a>\
			</div>\
		</div>\
		<div id='carouselContent' class='image' >\
			<div id='carouselImageList' class=''>\
			</div>\
		</div>\
	");
	/*<div id='carouselContent' class='ui center aligned vertical segment' >\
			<div id='carouselImageList' class='ui medium images'>\
			</div>\
		</div>\*/
	this.header = $("#carouselHeader");
	this.view = $("#carouselContent");
	this.viewInternal = $("#carouselImageList");
	this.viewInternal.transition();
	this.activeResult = null;
	this.imageList = [];
	this.imagePos = 0;
	this.container.click($.proxy(this.localOnClickHandler, this));
	
	this.mediator.subscribe("action", $.proxy(this.onMessageAction, this));
	this.mediator.subscribe("event", $.proxy(this.onMessageEvent, this));
}

Carousel.prototype = {
	
	pack : function (screenHeight, heightPercentage) {
		var headerH = this.header.outerHeight(true);
		var container = Math.floor(screenHeight/100*heightPercentage);
		var usable = container-headerH-5;
		changecss(this.container_selector, "height", container+"px");
		changecss(this.container_selector, "max-height", container+"px");
		changecss("#carouselContent", "height", usable+"px");
		changecss("#carouselContent", "max-height", usable+"px");
	},
	
	setActiveResult: function(result){
		this.activeResult = result;
	},
	
	updateImageList: function(entityID){
		var entity = this.activeResult.entities[entityID];
		var kb_row = this.activeResult.kb_records[entity.preferred];
		var group =  this.activeResult.groups[entity.group];
		var dataPlus = group.dataPlus || Array();
		var self = this;
		this.viewInternal.empty();
		for(var id in dataPlus){
			if(dataPlus[id].type == "image" && kb_row.hasOwnProperty(id)){
				var image_links = kb_row[id];
				if(Array.isArray(image_links))
					image_links.forEach(function(item, index, array){
					//output +="<img src='"+dataPlus[id].data+item+"' alt=''>";
						self.imageList.push(dataPlus[id].data+item);
					});
			
			}
		}
		console.log(this.imageList);
		if(self.imageList.length > 0){
			$("#imgCounter").text((this.imagePos+1)+"/"+this.imageList.length);
			this.viewInternal.html("<img src='"+this.imageList[this.imagePos]+"' alt=''>");
			this.viewInternal.transition("show");
		}else{
			$("#imgCounter").text("-/-");
		}
		
	},
	
	onMessageAction: function(action, argument){
		switch(action){
			case "entitySelect":
				this.imagePos = 0;
				this.imageList = [];
				this.updateImageList(argument.entityID);
			break;
			case "entityDeselect":
				$("#imgCounter").text("-/-");
				this.imageList = [];
				this.imagePos = 0;
				this.viewInternal.empty();
			break;
		}
	},
	onMessageEvent:function(event, argument){
		
	},
	
	localOnClickHandler: function(event){
		var target = $(event.target).is("i.icon") ? $(event.target).parent() : $(event.target);
    	var action = target.attr("data-action");
    	if(action != null || action != undefined){
    		console.log(action);
			switch(action){
				case "next":
				this.nextImage();
				stopPropagation(event);
				break;
				case "prev":
				this.prevImage();
				stopPropagation(event);
				break;
			}
		}else if($(event.target).is("img")){
			var src = $(event.target).attr("src");
			window.open(src,'_blank');
		}
	},
	
	nextImage: function(){
		console.log(this.imagePos, this.imageList.length);
		console.log(this.imagePos % this.imageList.length);
		if(this.imageList.length > 0){
			this.imagePos = (this.imagePos+1)%this.imageList.length;
			$("#imgCounter").text((this.imagePos+1)+"/"+this.imageList.length);
			this.viewInternal.html("<img src='"+this.imageList[this.imagePos]+"' alt=''>");
		}
	},
	prevImage: function(){
		if(this.imageList.length > 0){
			this.imagePos = (this.imagePos-1) < 0 ? this.imageList.length -1 : (this.imagePos-1)%this.imageList.length;
			$("#imgCounter").text((this.imagePos+1)+"/"+this.imageList.length);
			this.viewInternal.html("<img src='"+this.imageList[this.imagePos]+"' alt=''>");
		}
	},
	
};

Object.defineProperty(Carousel.prototype, "constructor", {
	enumerable: false,
	value: Carousel
});



