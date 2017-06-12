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

//----------------共用区-------------
	//渲染——根据Id生成上导航、主体内容、左导航选中状态
	function openById(id){
		navBox.innerHTML = createTopNav(id); //2-初始化上导航（面包屑）
		var result = createDirDetail(id);    //3-初始化主体
		if(result == ""){
			noDir.style.display = "block";
			detailList.innerHTML = "";
		}else{
			noDir.style.display = "none";
			detailList.innerHTML = result;
		}
		reChose(id); //4-左导航选中状态
//		handle.removeMyClass(checkAll, "checkedAll"); 
	}
	//操作提示
	function createTip(type, cont){
		$("tips_item").className = "tips_"+type;
		$("tips_cont").innerHTML = cont;
		setTimeout(function(){
			$("tips_item").style.opacity = 1;
			$("tips_item").style.transition = ".4s";
			$("tips_item").style.marginTop = "15px";
		},0);
		
		//延时上去的定时器只能有一个
		clearTimeout($("tips_item").tipTimer);
		$("tips_item").tipTimer = setTimeout(function(){
			$("tips_item").style.opacity = 0;
			$("tips_item").style.marginTop = 0;
		},2000);
	}
	
//----------------渲染区-------------
	function init(curId){
		bookList.innerHTML = createTreeByPid(-1); //1-初始化左导航（树形菜单）
		openById(curId); //上导航、主体、左导航选中状态
		reShowChildList(curId);  //打开左导航
	}
	init(curId);

//---------------左导航--事件绑定(代理)-------------
	bookList.onclick = function(ev){
		var parObj = handle.getMyParentByAttr(ev.target, "H3");
		if(parObj){
			tarId = parObj.getAttribute("data-id");
			if(tarId != curId){
				openById(tarId);
			}
			reShowChildList(tarId);
		}
	};

//---------------上导航--事件绑定(代理)-------------
	//上导航——书签选择
	navBox.onclick = function(ev){
		if(ev.target.nodeName == "A"){
			tarId = ev.target.getAttribute("data-id");
			if(tarId != curId){
				openById(tarId);
			}
		}
	};
	//上导航——全选/反选
	checkAll.onclick = function(){
		if(lis.length == 0){ //没有内容时，禁止全选
			return;
		}
		if(handle.hasMyClass(this, "checkedAll")){
			Array.from(lis).forEach(function(item){
				handle.removeMyClass(item, "checked");
			});
		}else{
			Array.from(lis).forEach(function(item){
				handle.addMyClass(item, "checked");
			});
		}
		handle.toggleMyClass(this, "checkedAll");
	};

//---------------头部操作区--事件绑定(代理)-------------
	//头部操作——新建
	$("nav_newDir").onmouseup = function(ev){
		var tempLi = detailList.querySelector("ul li.temp");
		if(tempLi){ //如果已有则重新获取焦点
			tempLi.getElementsByTagName("input")[0].focus();
		}else{
			$("noDir").style.display = "none";
			var html = '<li class="checked temp">'
				+ '<em class="checkSingle"></em>'
				+ '<i class="ico_dir dir_ico i_dir"></i>'
				+ '<input type="text"/>'
				+ '</li>';
			detailList.querySelector("ul").innerHTML = html + detailList.querySelector("ul").innerHTML;
			detailList.querySelector("ul li:first-child input").focus();
		}
	};
	
	//头部操作——删除
	$("nav_del").onclick = function(){
		var selArr = checkSelBooks();
		if(selArr.length == 0){
			createTip("warming", "请选择文件！");
		}else{
			$("delResure").style.display = "block";
		}
	};
	//删除弹窗——取消删除
	$("delNo").onclick = function(){
		$("delResure").style.display = "none";
	};
	$("delOpt").querySelectorAll("a")[1].onclick = function(){
		$("delResure").style.display = "none";
	};
	//删除弹窗——执行删除
	$("delOpt").querySelectorAll("a")[0].onclick = function(){
		$("delResure").style.display = "none";
		$("delIng").style.display = "block";
		var sec = 0;
		var picTimer = setInterval(function(){
			$("delIng_pic").style.transform = "rotate("+7.2*(++sec)+"deg)";
		},10);
		var arr = checkSelBooks();
		$("totalC").innerHTML = arr.length;
		var num = 1; //控制timeout间隔时间
		var count = 0; //记录删除个数
		arr.forEach(function(item){
			setTimeout(function(){
				$("curC").innerHTML = ++count;
				detailList.querySelector("ul").removeChild(item);
				var obj = Array.from(h3s).find(function(value){
					return value.getAttribute("data-id") == item.getAttribute("data-id");
				});
				if(obj){
					if(obj.nextElementSibling){
						obj.parentElement.removeChild(obj.nextElementSibling);
					}
					obj.parentElement.removeChild(obj);
				}
				if(count == arr.length){ //执行完全部删除后
					clearInterval(picTimer);
					$("delIng").style.display = "none";
					
					createTip("ok", "已删除成功！");
				}
			},500*(num++));
		});
		
		//全部删除后的重绘主体	
		if(!detailList.querySelector("li")){
			$("noDir").style.display = "block";
			var obj = Array.from(h3s).find(function(value){
				return value.getAttribute("data-id") == curId;
			});
			handle.removeMyClass(obj.children[0], "i_hasMore");
			handle.removeMyClass(obj.children[0], "i_showMore");
			handle.removeMyClass(obj.children[1], "i_openBook");
			handle.addMyClass(obj.children[1], "i_closeBook");
		}
	}
	
	//头部操作——重命名
	$("nav_rename").onmouseup = function(ev){
		var selArr = checkSelBooks();
		if(selArr.length == 0){
			createTip("warming", "请选择文件！");
			return;
		}
		var renameLi = detailList.querySelector("ul li.rename");
		if(renameLi){//已有重命名状态
			renameLi.getElementsByTagName("input")[0].select();
		}else{ //当前没有重命名状态
			renameLi = selArr[0];
			handle.addMyClass(renameLi, "rename");
			var ipt = document.createElement("input");
			ipt.type = "text";
			var span = renameLi.getElementsByTagName("span")[0];
			ipt.value = span.innerHTML;
			ipt.title = span.innerHTML;
			renameLi.replaceChild(ipt, span);
			ipt.select();
		}
	}
	//头部操作——列表/大图标模式转换
	$("nav_list").onclick = function(){
		if(handle.hasMyClass(this, "checked")){
			//转为列表模式
		}else{//转为大图标模式
			if(lis.length > 0){
				var html = "<ul class='modeList'>";
				Array.from(lis).forEach(function(){
					
				});
				html += "</ul>";
				detailList.innerHTML = html;
			}
		}
		handle.toggleMyClass(this, "checked");
	};
//---------------主体--事件绑定(代理)-------------
	//主体——0.hover效果；1.选中/解选；2.重命名；3.进入子级
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
			item.onmouseup = function(ev){
				var tar = ev.target;
				if(tar.nodeName == "EM"){ //1-选中/解选
					handle.toggleMyClass(handle.getMyParentByAttr(ev.target, "li"), "checked");
					handle.toggleMyClass(handle.getMyParentByAttr(ev.target, "li"), "hover");
					
					checkSelAll(); //检查全选
				}else if(tar.nodeName == "INPUT"){ //2-输入重命名
					ev.cancelBubble = true;
					return;
				}else{ //3-进入子级
					tar = handle.getMyParentByAttr(tar, "LI");
					openById(tar.getAttribute("data-id"));
					reShowChildList(tar.getAttribute("data-id")); //左导航打开状态
				}
			};
		});
	};
	//主体——框选
//	$("book_main").onmousedown = function(ev){
//		var oriX = ev.clientX;
//		var oriY = ev.clientY;
//		var selBox = document.createElement("div");
//		selBox.className = "selBox";
//		selBox.id = "selBox";
//		document.body.appendChild(selBox);
//		document.body.onmousemove = function(ev){
//			selBox.style.width = Math.abs(ev.clientX - oriX) + "px";
//			selBox.style.height = Math.abs(ev.clientY - oriY) + "px";
//			selBox.style.left = Math.min(ev.clientX, oriX) + window.pageXOffset + "px";
//			selBox.style.top = Math.min(ev.clientY, oriY) + window.pageYOffset + "px";
//			
//			Array.from(lis).forEach(function(item){
//				if(crash(selBox, item)){
//					handle.addMyClass(item, "checked");
//					handle.removeMyClass(item, "hover");
//				}else{
//					handle.removeMyClass(item, "checked");
//				}
//				checkSelAll();
//			});
//		};
//	};

//---------------函数组件--------------
	//左导航——更新选中/待选状态
	function reChose(id){
		var oldH3 = Array.from(h3s).find(function(item){
			return item.getAttribute("data-id") == curId;
		});
		handle.removeMyClass(oldH3, "selected");
			
		var self = Array.from(h3s).find(function(item){
			return item.getAttribute("data-id") == id;
		});
		handle.addMyClass(self, "selected");
		curId = id;
	}
	//左导航——打开/关闭子级菜单
	function reShowChildList(id){
		var self = Array.from(h3s).find(function(item){
			return item.getAttribute("data-id") == id;
		});
		var selfList = self.nextElementSibling;
		if(selfList){
			var disp = getComputedStyle(selfList).display;
			if(disp == "none"){
				selfList.style.display = "block";
			}else{
				selfList.style.display = "none";
			}
			handle.toggleMyClass(self.children[0], "i_hasMore");
			handle.toggleMyClass(self.children[0], "i_showMore");
			handle.toggleMyClass(self.children[1], "i_closeBook");
			handle.toggleMyClass(self.children[1], "i_openBook");
		}
	}
	
	//检查当前所选中文件
	function checkSelBooks(){
		return Array.from(lis).filter(function(item){
			return handle.hasMyClass(item, "checked");
		});
	}
	//检查是否全选
	function checkSelAll(){
		var bool = Array.from(lis).every(function(item){
			return handle.hasMyClass(item, "checked");
		});
		if(bool){ //全选
			handle.addMyClass(checkAll, "checkedAll");
		}else{
			handle.removeMyClass(checkAll, "checkedAll");
		}
	}
	
	//取消所有重命名状态
	function cancelRename(){
		console.log("IN");
		var renameLi = detailList.querySelector("ul li.rename");
		var tempLi = detailList.querySelector("ul li.temp");
		if(renameLi){
			var ipt = renameLi.getElementsByTagName("input")[0];
			var newName = ipt.value.trim();
			if(tempLi){ //新建文件状态下，取消重命名，恢复原命名
				var span = document.createElement("span");
				span.className = "title";
				span.innerHTML = ipt.title;
				span.title = ipt.title;
				renameLi.replaceChild(span, ipt);
				handle.removeMyClass(renameLi, "rename");
			}else{
				//命名为空
				if(newName == ""){
					createTip("warming", "命名不能为空！");
					ipt.select();
					return;
				}
				//命名冲突
				var sameBro = handle.checkSameNameBro(dataFiles, curId, newName);
				if(sameBro && sameBro.id!=renameLi.getAttribute("data-id")){
					createTip("warming", "重命名-已有同名文件！");
					ipt.select();
					return;
				}
				
				var span = document.createElement("span");
				span.className = "title";
				span.innerHTML = newName;
				span.title = newName;
				renameLi.replaceChild(span, ipt);
				handle.removeMyClass(renameLi, "rename");
				createTip("ok", "重命名成功！");
			}
		}
	};
	//取消命名为空的新建文件夹
	function cancelNewDir(){
		var tempLi = detailList.querySelector("ul li.temp");
		var renameLi = detailList.querySelector("ul li.rename");
		if(tempLi){
			var ipt = tempLi.getElementsByTagName("input")[0];
			var newName = ipt.value.trim();
			if(renameLi){ //新建状态下，有未完成的重命名
				var span = document.createElement("span");
				span.className = "title";
				span.innerHTML = ipt.title;
				span.title = ipt.title;
				renameLi.replaceChild(span, ipt);
				handle.removeMyClass(renameLi, "rename");
			}else{
				if(newName == ""){ //命名为空时，取消新建
					tempLi.parentElement.removeChild(tempLi);
				}else if(handle.checkSameNameBro(dataFiles, curId, newName)){ //命名冲突
					createTip("warming", "新建-已有同名文件！");
					ipt.select();
				}else{ //新建成功
					var span = document.createElement("span");
					span.className = "title";
					span.innerHTML = newName;
					span.title = newName;
					tempLi.replaceChild(span, ipt);
					handle.removeMyClass(tempLi, "temp");
					createTip("ok", "新建成功！");
				}
			}
		}
	}
	
	//document事件代理
	document.body.onmouseup = function(ev){
		if(ev.target.id != "nav_rename"){
			cancelRename();
		}
		if(ev.target.id != "nav_newDir"){
			cancelNewDir();
		}
		
		//取消框选
		if($("selBox")){
			document.body.removeChild(selBox);
		}
		document.body.onmousemove = null;
	};
	
	//九宫格碰撞检查
	function crash(obj1, obj2){
		var box1 = obj1.getBoundingClientRect();
		var box2 = obj2.getBoundingClientRect();
		if(box1.right<box2.left || box1.left>box2.right
			|| box1.bottom<box2.top || box1.top>box2.bottom){
			return false;
		}
		return true;
	}
	
}

//-------------------Html生成函数---------------------
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
		html += '<ul class="modePic clearfix">';
		arrChilds.forEach(function(item){
			html += '<li data-id="'+item.id+'">';
			html += '<em class="checkSingle"></em>';
			var type = item.type?item.type:"file";
			html += '<i class="ico_dir dir_ico i_'+type+'"></i>';
			html += '<span class="title" title="'+item.title+'">'+item.title+'</span>';
			html += "</li>";
		});
		html += '</ul>';
	}
	return html;
}
