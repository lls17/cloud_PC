/*
 * 弹窗定制
 * obj{
 * 		title,tag,fns
 * 		closeable,ico
 * 		pos,dragable,resizable
 * }
 * */
(function(){
	var dialog;
	var dialogBox;
	function createDialogHTML(opt){
		//先做参数合规判断（略）
		opt = opt || {};
		//参数为对象时，要克隆一份，再操作这个克隆出的数据，以防改变原对象
		var obj = {};
		for(var keyStr in opt){
			obj[keyStr] = opt[keyStr];
		}
		//生成结构
		dialog = document.createElement("div");
		dialog.className = "dialog";
		var html = "";
		if(obj.closeable){
			html += '<a class="i_cancel" id="dialogClose" href="javascript:;"></a>'
		}
		html += "<div class='dialogTip'>";
		if(obj.ico){
			html += '<i class="dialog_ico '+obj.ico+'"></i>'
		}
		html += `<div class="dialog_title">
					<strong class="tip_title" id="tip_title">${obj.title}</strong>
					<em class="tip_tag" id="tip_tag">${obj.tag}</em>
				</div></div>`;
		dialog.innerHTML = html;
		var dialogOpt = document.createElement("div");
		dialogOpt.className = "dialogOpt";
		var errorT = document.createElement("span");
		errorT.className = "error";
		dialogOpt.appendChild(errorT);
		for(var item in obj.opts){
			var a = document.createElement("a");
			a.href = "javascript:;";
			a.innerHTML = item;
			addEvent(a, "mouseup", obj.opts[item]);
			dialogOpt.appendChild(a);
		}
		dialog.appendChild(dialogOpt);
		document.body.appendChild(dialog);
		
		//生成遮罩
		dialogBox = document.createElement("div");
		dialogBox.className = "dialogBox";
		dialogBox.style.height = "100%";
		dialogBox.style.width = "100%";
		document.body.appendChild(dialogBox);
		
		//初始位置
		if(obj.pos){
			dialog.style.left = obj.pos.x + "px";
			dialog.style.top = obj.pos.y + "px";
		}else{ //默认居中显示
			dialog.style.left = (document.documentElement.clientWidth - dialog.offsetWidth)/2 + "px";
			dialog.style.top = (document.documentElement.clientHeight - dialog.offsetHeight)/2 + "px";
		}
		//是否可拖拽(只能点击title部分才能拖拽,内容区域不能拖拽)
		if(obj.dragable){
			
		}else{ //默认为false,不能拖拽
			
		}
		//是否可改变盒子大小
		if(obj.resizable){
			
		}else{ //默认为false,不能拖拽
			
		}
		//浏览器resize时重置
		window.addEventListener("resize",function(){
			if(obj.pos){
				dialog.style.left = obj.pos.x + "px";
				dialog.style.top = obj.pos.y + "px";
			}else{ //默认居中显示
				dialog.style.left = (document.documentElement.clientWidth - dialog.offsetWidth)/2 + "px";
				dialog.style.top = (document.documentElement.clientHeight - dialog.offsetHeight)/2 + "px";
			}
		});
		//关闭X 
		if(obj.closeable){
			document.getElementById("dialogClose").addEventListener("click",function(ev){
				document.body.removeChild(dialogBox);
				document.body.removeChild(dialog);
			});
		}
	}
	window.dialog = createDialogHTML;
	
	function addEvent(obj, evtName, fn){
		obj.addEventListener(evtName, function(ev){
			var result = fn();
			if(result || result==undefined){ //true关闭
				dialogBox?document.body.removeChild(dialogBox):"";
				dialog?document.body.removeChild(dialog):"";
			}
			ev.stopPropagation();
		});
	}
})();
