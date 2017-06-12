var dataFiles = dataDir.files;
window.onload = function(){
	var bookList = $("book_left");
	var h3s = bookList.getElementsByTagName("h3");
	var navBox = $("nav_box");
	var noDir = $("noDir");
	var checkAll = $("checkAll");
	var detailList = $("detail_list");
	var lis = detailList.getElementsByTagName("li");
	var curId = 0; //记录当前选中ID
	
	function init(curId){
		//1-初始化左导航（树形菜单）
		bookList.innerHTML = createTreeByPid(-1);
		openById(curId);
		//5-左导航打开状态
		reShowChildList(curId);  
	}
	init(curId);
	
	//根据Id生成上导航、主体内容、左导航选中状态
	function openById(id){
		//2-初始化上导航（面包屑）
		navBox.innerHTML = createTopNav(id);
		//3-初始化主体
		var result = createDirDetail(id);
		if(result == ""){
			noDir.style.display = "block";
			detailList.innerHTML = "";
		}else{
			noDir.style.display = "none";
			detailList.innerHTML = result;
		}
		//4-左导航选中状态
		reChose(id); 
		handle.removeMyClass(checkAll, "checkedAll");
	}
	
	//4-给左导航绑定点击事件（事件代理）
	bookList.onclick = function(ev){
		if(ev.target.nodeName == "H3"){
			tarId = ev.target.getAttribute("data-id");
			if(tarId != curId){
				openById(tarId);
			}
			reShowChildList(tarId);
		}
	};
	//5-给上导航绑定点击事件（事件代理）
	navBox.onclick = function(ev){
		if(ev.target.nodeName == "A"){
			tarId = ev.target.getAttribute("data-id");
			if(tarId != curId){
				openById(tarId);
			}
		}
	};
	
	//选中/待选状态
	function reChose(id){
		var self = Array.from(h3s).find(function(item){
			return item.getAttribute("data-id") == id;
		});
		handle.addMyClass(self, "selected");
	
		if(curId != id){
			var oldH3 = Array.from(h3s).find(function(item){
				return item.getAttribute("data-id") == curId;
			});
			handle.removeMyClass(oldH3, "selected");
			curId = id;
		}
	}
	//显示/隐藏子级菜单
	function reShowChildList(id){
		var self = Array.from(h3s).find(function(item){
			return item.getAttribute("data-id") == id;
		});
		var selfList = self.nextElementSibling;
		if(selfList){
			var disp = getComputedStyle(selfList).display;
			if(disp == "none"){
				selfList.style.display = "block";
				handle.removeMyClass(self.children[0], "i_hasMore");
				handle.addMyClass(self.children[0], "i_showMore");
			}else{
				selfList.style.display = "none";
				handle.removeMyClass(self.children[0], "i_showMore");
				handle.addMyClass(self.children[0], "i_hasMore");
			}
		}
	}
	
	//全选/反选
	checkAll.onclick = function(){
		if(handle.hasMyClass(this, "checkedAll")){
			Array.from(lis).forEach(function(item){
				handle.removeMyClass(item, "checked");
			});
			handle.removeMyClass(this, "checkedAll");
		}else{
			Array.from(lis).forEach(function(item){
				handle.addMyClass(item, "checked");
			});
			handle.addMyClass(this, "checkedAll");
		}
	};
	
	//hover样式
	detailList.onmouseover = function(ev){
		var lis = detailList.getElementsByTagName("li");
		Array.from(lis).forEach(function(item){
			item.onmouseenter = function(ev){
				if(!handle.hasMyClass(item, "checked")){
					handle.addMyClass(this, "hover");
				}
			};
			item.onmouseleave = function(ev){
				handle.removeMyClass(this, "hover");
			};
		});
	};
	
	//用以区分同一元素身上的单击&双击事件 (用flag+setTimeout处理)
	//2-单击事件(选中&改名) 
	var clickFlag = false;
	var clickTimer = null;
	var count = 0;
	detailList.onclick = function(ev){
		clickTimer = setTimeout(function(){
			if(!clickFlag){
				var tar = ev.target;
				if(tar.nodeName == "SPAN"){ //重命名
					var ipt = document.createElement("input");
					ipt.type = "text";
					ipt.value = tar.innerHTML;
					tar.parentElement.replaceChild(ipt, tar);
					ipt.select();
				}else if(tar.nodeName == "INPUT"){ //输入内容
					return;
				}else{ //选中、解选
					if(tar.nodeName != "LI"){
						tar = tar.parentElement;
					}
					if(handle.hasMyClass(tar, "checked")){
						handle.removeMyClass(tar, "checked");
					}else{
						tar.className = "checked";
					}
					
					var bool = Array.from(lis).every(function(item){
						return handle.hasMyClass(item, "checked");
					});
					if(bool){ //全选
						handle.addMyClass(checkAll, "checkedAll");
					}else{
						handle.removeMyClass(checkAll, "checkedAll");
					}
				}
				clickFlag = false;
			}
		},300);
	};

	//3-双击事件(进入子级) 单(timeout)-单(flag)-双
	detailList.ondblclick = function(ev){
		clickFlag = true;
		clearTimeout(clickTimer);
		var tar = ev.target;
		if(tar.nodeName != "LI"){
			tar = tar.parentElement;
		}
		openById(tar.getAttribute("data-id"));
		//5-左导航打开状态
		reShowChildList(tar.getAttribute("data-id")); 
	};
	
	//4-头部导航（删除）
	$("nav_del").onclick = function(){
		var selArr = checkSel();
		if(selArr.length == 0){
			$("tips_noSel").style.display = "block";
			return;
		}
	};
	//5-头部导航（重命名）
	$("nav_rename").onclick = function(){
		var selArr = checkSel();
		if(selArr.length == 0){
			$("tips_noSel").style.display = "block";
			return;
		}
	};
	
	//检查当前所选中文件
	function checkSel(){
		return Array.from(lis).filter(function(item){
			return handle.hasMyClass(item, "checked");
		});
	}
	
	//取消所有重命名
	document.onclick = function(ev){
		if(ev.target.nodeName != "INPUT"){
			cancelAllRename();
		}
	}
	
	//取消所有重命名状态
	function cancelAllRename(){
		for (var i=0; i<lis.length; i++) {
			var ipts = lis[i].getElementsByTagName("input");
			if(ipts && ipts.length>0){
				var span = document.createElement("span");
				span.className = "title";
				span.innerHTML = ipts[0].value;
				lis[i].replaceChild(span, ipts[0]);
			}
		}
	}
}

//1-渲染左导航（树形菜单）
function createTreeByPid(pid){
	var childArr = handle.getChildsByPid(dataFiles, pid);
	var result = '';
	if(childArr && childArr.length>0){
		result += '<ul>';
		childArr.forEach(function(item){
			var index = handle.getParentsById(dataFiles, item.id).length-1;
			result += '<li>';
			result += '<h3 data-id='+item.id+' style="padding-left:'+(40+index*28)+'px">';
			var childHTML = createTreeByPid(item.id);
			if(childHTML != ""){
				result += '<i class="ico_main i_hasMore" style="left:'+(20+index*28)+'px"></i>';
			}
			result += '<i class="ico_main i_closeBook"></i> ';
			result += item.title;
			result += '</h3>';
			result += childHTML;
			result += '</li>';
		});
		result += '</ul>';
	}
	return result;
}

//2-渲染上导航（面包屑）
function createTopNav(id){
	var arrParent = handle.getParentsById(dataFiles, id).reverse();
	var newArr = arrParent.map(function(item){
		return '<a href="javascript:;" data-id="'+item.id+'">'+item.title+'</a>';
	});
	return newArr.join('<i class="ico_main i_next"></i>');
}

//3-渲染右部主体
function createDirDetail(pid){
	var arrChilds = handle.getChildsByPid(dataFiles, pid);
	var html = "";
	if(arrChilds.length != 0){
		html += '<ul>';
		arrChilds.forEach(function(item){
			html += '<li data-id="'+item.id+'">';
			html += '<em class="checkSingle"></em>';
			var type = item.type?item.type:"file";
			html += '<i class="ico_dir dir_ico i_'+type+'"></i>';
			html += '<span class="title">'+item.title+'</span>';
			html += "</li>";
		});
		html += '</ul>';
	}
	return html;
}
