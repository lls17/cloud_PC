//作用域保护方法一：匿名方法自执行
//(function() {
//	//方法1：return obj
//	//方法2：挂在window下
//})();

//var fn = (function(){
//	
//})();


(function(){
	function $(id){
		return document.getElementById(id);
	}
	window.$ = $;
})();

//作用域保护方法二：全局对象
//注意：全局函数用“纯函数”，不要依赖外部数据
var handle = {
	//根据id获得自己
	getSelfById(data, id){
		return data.find(function(item){
			return item.id == id;
		});
	},
	//根据父id获取子级
	getChildsByPid(data, pid){
		return data.filter(function(item){
			return item.pid == pid;
		});
	},
	//根据我的id，获取我的祖先，包括自己
	getParentsById(data, id){
		var arr = [];
		var obj = this.getSelfById(data, id);
		if(obj){
			arr.push(obj);
			arr = arr.concat(this.getParentsById(data, obj.pid));
		}
		return arr;
	},
	hasMyClass(obj, cName){
		var arr = obj.className.split(" ");
		return !!arr.find(function(item){
			return item == cName;
		});
	},
	removeMyClass : function(obj, cName){
		obj.className = obj.className.split(cName).join(" ").trim();
	},
	addMyClass : function(obj, cName){
		if(this.hasMyClass(obj, cName)){
			this.removeMyClass(obj, cName);
		}
		var newCName = obj.className + " " + cName;
		obj.className = newCName.trim();
	},
	//通过指定属性，获得符合条件的最近一位祖先
	//  .class  #id   nodeName
	getMyParentByAttr(obj, attrStr){
		if(attrStr.charAt(0) == "."){
			while(obj.nodeName!="BODY" && !this.hasMyClass(obj, attrStr.slice(1))){
				obj = obj.parentElement;
			}
		}else if(attrStr.charAt(0) == "#"){
			while(obj.nodeName!="BODY" && obj.id != attrStr.slice(1)){
				obj = obj.parentElement;
			}
		}else{
			while(obj.nodeName!="BODY" && obj.nodeName!=attrStr.toUpperCase()){
				obj = obj.parentElement;
			}
		}
		return obj.nodeName=="BODY"?null:obj;
	},
	toggleMyClass(obj, cName){
		if(this.hasMyClass(obj, cName)){
			this.removeMyClass(obj, cName);
		}else{
			this.addMyClass(obj, cName);
		}
	},
	//检查是否有同名兄弟
	checkSameNameBro(data, pid, title){
		var bros = handle.getChildsByPid(data, pid);
		return bros.find(function(item){
			return item.title == title;
		});
	}
};