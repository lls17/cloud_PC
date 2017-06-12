var dataFiles = dataDir.files;
var picMode = true; //显示模式(默认为大图标模式)
window.onload = function(){
	document.body.style.height = document.documentElement.clientHeight-60 + "px";
	document.body.style.width = document.documentElement.clientWidth + "px";
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
	}
	//提示定制
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
	//更新数据，并重绘左导航
	function upDateBookList(obj, type){
		if(type == "add"){
			dataFiles.unshift(obj);
		}else if(type == "update"){
			var index = dataFiles.findIndex(function(item){
				return item.id == obj.id;
			});
			dataFiles.splice(index, 1, obj);
		}else if(type == "del"){
			var index = dataFiles.findIndex(function(item){
				return item.id == obj.id;
			});
			dataFiles.splice(index, 1);
		}
		bookList.innerHTML = createTreeByPid(-1);
		reShowChildList(curId, h3s);  //打开左导航
	}
	
//----------------渲染区-------------
	function init(curId){
		bookList.innerHTML = createTreeByPid(-1); //1-初始化左导航（树形菜单）
		openById(curId); //上导航、主体、左导航选中状态
		reShowChildList(curId, h3s);  //打开左导航
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
			reShowChildList(tarId, h3s);
		}
		checkSelAll();
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
		if(tempLi){ //当前为新建状态（如果已有）则重新获取焦点
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
		cancelRename();
		ev.cancelBubble = true;
	};
	
	//头部操作——删除
	$("nav_del").onclick = function(){
		var selArr = checkSelBooks();
		if(selArr.length == 0){
			createTip("warming", "请选择文件！");
		}else{
			dialog(
				{
					"title":"确定要删除这个文件夹吗？",
					"tag":"已删除的文件可以在回收站找到",
					"closeable":"true",
					"ico":"i_resure",
					"opts":{
						"确认Yes":delOk,
						"取消No":function(){return true;}
					}
				}
			);
		}
	};
	//执行删除
	function delOk(){
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
				if(obj){ //DOM操作删除LI
					if(obj.nextElementSibling){
						obj.parentElement.removeChild(obj.nextElementSibling);
					}
					obj.parentElement.removeChild(obj);
				}
				if(count == arr.length){ //执行完全部删除后
					clearInterval(picTimer);
					$("delIng").style.display = "none";
					createTip("ok", "已删除成功！");
					
					//全部删除后的重绘主体，取消全选
					if(!detailList.querySelector("li")){
						$("noDir").style.display = "block";
						handle.removeMyClass(checkAll, "checked");
					}
				}
				
				//如需一个一个删（一次一次的更新左导航）
				obj.id = obj.getAttribute("data-id");
				upDateBookList(obj, "del");
			},500*(num++));
		});
	}
	
	//头部操作——重命名
	$("nav_rename").onmouseup = function(ev){
		var selArr = checkSelBooks();
		if(selArr.length == 0){
			createTip("warming", "请选择待重命名的文件！");
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
		cancelNewDir();
		ev.cancelBubble = true;
	}
	//头部操作——移动到
	$("nav_moveTo").onmouseup = function(ev){
		var selArr = checkSelBooks();//准备移动的文件
		if(selArr.length == 0){
			createTip("warming", "请选择要移动的文件！");
			return;
		}
		dialog(
			{
				"title":"选择存储位置",
				"tag":"<div class='book_move book_tree'>"+createTreeByPid(-1)+"</div>",
				"closeable":"false",
//				"ico":"ico_main i_all",
				"opts":{
					"确认":function(){
						if(moveFlag){ //可移动
							moveTo(selArr, tarId);
						}
						return moveFlag;
					},
					"取消":function(){
						return true;
					}
				}
			}
		);
		var h3s_move = document.querySelectorAll(".book_move h3");
		reShowChildList(0, h3s_move);
		
		var moveFlag = false; //默认非法移动
		var tarId = -1; //目标ID
		
		//初始选中（“微云”）样式
		var curSel = document.querySelector(".book_move h3");
		handle.addMyClass(curSel,"selected");
		//错误提示区
		var err = document.querySelector(".dialog .error");
			
		//点击事件代理
		document.querySelector(".book_move").onmouseup = function(ev){
			var parObj = handle.getMyParentByAttr(ev.target, "H3");
			if(parObj){
				moveFlag = true;
				err.innerHTML = "";
				//交换选中样式
				handle.removeMyClass(curSel,"selected");
				handle.addMyClass(parObj,"selected");
				curSel = parObj;
				
				tarId = parObj.getAttribute("data-id");
				if(tarId != 0){
					reShowChildList(tarId, h3s_move);
				}
				
				//不能将文件移动到自身或其子文件夹下
				var parentArr = handle.getParentsById(dataFiles, tarId);
				for (var i = 0; i < parentArr.length; i++) {
					for (var j = 0; j < books.length; j++) {
						if(parentArr[i].id == books[j].getAttribute("data-id")){
							err.innerHTML = "不能将文件移动到自身或其子文件夹下!";
							moveFlag = false;
						}
					}
				}
				
				//不能移动到自己父亲下，已存在
				var firstSel = handle.getSelfById(dataFiles, books[0].getAttribute("data-id"));
				if(tarId == firstSel.pid){
					err.innerHTML = "该文件下已经存在!";
					moveFlag = false;
				}
			}
		};
		ev.cancelBubble = true;
	}
	//处理移动
	function moveTo(books, tarId){
		var allIn = true; //默认全部移动成功
		//更新datas数据
		for(var i=0; i<books.length; i++){
			var self = handle.getSelfById(dataFiles, books[i].getAttribute("data-id"));
			//检查目标文件夹下有重名文件
			if(handle.checkSameNameBro(dataFiles, tarId, self.title)){
				allIn = false;
			}else{
				self.pid = tarId;
				//页面移除成功的文件
				detailList.querySelector("ul").removeChild(books[i]);
			}
		}
		//重名导致部分移动失败提示
		if(allIn){
			createTip("ok", "全部移动成功！");
		}else{
			createTip("warming", "部分文件移动失败，因重名！");
		}
		
		//重绘左导航
		bookList.innerHTML = createTreeByPid(-1);
		//全选判断
		checkSelAll();
		//全部移动后的重绘主体	
		if(!detailList.querySelector("li")){
			$("noDir").style.display = "block";
			handle.removeMyClass(checkAll, "checked");
		}
	}
	//头部操作——列表/大图标模式转换
	$("nav_list").onclick = function(){
		picMode = !picMode;
		handle.toggleMyClass(this, "checked");
		var result = createDirDetail(curId);   
		//重新初始化主体
		if(result == ""){
			noDir.style.display = "block";
			detailList.innerHTML = "";
		}else{
			noDir.style.display = "none";
			detailList.innerHTML = result;
		}
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
					reShowChildList(tar.getAttribute("data-id"), h3s); //左导航打开状态
				}
			};
		});
		return false;
	};
	//主体——框选/拖拽
	$("book_main").onmousedown = function(ev){
		if(ev.which !== 1){//排除中键和右键，只在点击左键起作用
			return;
		} 
		ev.cancelBubble = true; //去掉浏览器选中文字默认行为
		
		var dragFlag = false;
		var tarLi = handle.getMyParentByAttr(ev.target, "LI");
		if(tarLi && handle.hasMyClass(tarLi, "checked")){ //拖拽
			dragFlag = true;
		}
		
		var oriX = ev.clientX;
		var oriY = ev.clientY;
		var selBox = null; //框选
		var dragBox = null; //拖拽
		var minL = $("book_main").getBoundingClientRect().left;
		var maxL = $("book_main").getBoundingClientRect().right;
		var minT = $("book_main").getBoundingClientRect().top;
		var maxT = $("book_main").getBoundingClientRect().bottom;
		var selLis = checkSelBooks();
		var noSelLis = Array.from(lis).filter(function(item){
			return !handle.hasMyClass(item, "checked");
		});
		document.body.onmousemove = function(ev){
			if(dragFlag){ //拖拽
				if(!dragBox){
					dragBox = document.createElement("div");
					dragBox.className = "dragBox";
					dragBox.id = "dragBox";
					dragBox.tarId = -1; //拖拽到的ID
					dragBox.innerHTML = selLis.length;
					dragBox.style.left = oriX-minL-10+"px";
					dragBox.style.top = oriY-minT-10+"px";
					$("book_main").appendChild(dragBox);
				}
				dragBox.style.left = ev.clientX-minL-15+"px";
				dragBox.style.top = ev.clientY-minT-15+"px";
				
				//碰撞检测——与非选中的LI做碰撞检测
				noSelLis.forEach(function(item){ //碰撞检测——选中、取消选择状态更新
					if(crash(dragBox, item)){
						handle.addMyClass(item, "hover");
						dragBox.tarId = item.getAttribute("data-id");
					}else{
						handle.removeMyClass(item, "hover");
						if(dragBox.tarId == item.getAttribute("data-id")){
							dragBox.tarId = -1;
						}
					}
				});
				
			}else{ //框选
				if(!selBox){
					selBox = document.createElement("div");
					selBox.className = "selBox";
					selBox.id = "selBox";
					$("book_main").appendChild(selBox);
				}
				var left = ev.clientX<minL ? 0 : Math.min(ev.clientX, oriX)-minL;
				var top = ev.clientY<minT ? 0 : Math.min(ev.clientY, oriY)-minT;
				var width = ev.clientX<minL ? oriX-minL : Math.abs(ev.clientX-oriX);
				var height = ev.clientY<minT ? oriY-minT : Math.abs(ev.clientY-oriY);
				if(ev.clientX > maxL){
					width = maxL - oriX;
				}
				if(ev.clientY > maxT){
					height = maxT - oriY;
					//内部下滑
					$("book_main").getElementsByClassName("modePic")[0].scrollTop = ev.clientY-maxT;
				}
				selBox.style.left = left + "px";
				selBox.style.top = top + "px";
				selBox.style.width = width + "px";
				selBox.style.height = height + "px";
				
				Array.from(lis).forEach(function(item){ //碰撞检测——选中、取消选择状态更新
					if(crash(selBox, item)){
						handle.addMyClass(item, "checked");
						handle.removeMyClass(item, "hover");
					}else{
						handle.removeMyClass(item, "checked");
					}
					checkSelAll();
				});
				return false;
			}
		};
		return false;
	};
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
	function reShowChildList(id, h3List){
		var self = Array.from(h3List).find(function(item){
			return item.getAttribute("data-id") == id;
		});
		if(self){
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
	}
	
	//检查当前所选中文件（除去新建）
	function checkSelBooks(){
		return Array.from(lis).filter(function(item){
			return handle.hasMyClass(item, "checked")&&!handle.hasMyClass(item, "temp");
		});
	}
	//检查是否全选
	function checkSelAll(){
		var bool = Array.from(lis).every(function(item){
			return handle.hasMyClass(item, "checked");
		});
		if(bool && lis.length>0){ //全选
			handle.addMyClass(checkAll, "checkedAll");
		}else{
			handle.removeMyClass(checkAll, "checkedAll");
		}
	}
	
	//取消所有重命名状态
	function cancelRename(){
		console.log("冒泡~ 取消重命名");
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
				
				//更新左导航
				var newDate = {
					id: renameLi.getAttribute("data-id"),
					pid: curId,
					title: newName,
					type: "file"
				};
				upDateBookList(newDate, "update");
					
				createTip("ok", "重命名成功！");
			}
		}
	};
	//取消命名为空的新建文件夹
	function cancelNewDir(){
		console.log("冒泡~ 取消新建");
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
					
					//更新左导航
					var newDate = {
						id: parseInt(dataFiles.length*Math.random()*100+Math.random()),
						pid: curId,
						title: newName,
						type: "file"
					};
					upDateBookList(newDate, "add");
					
					createTip("ok", "新建成功！");
				}
			}
		}
	}
	
	//document事件代理
	document.body.onmouseup = function(ev){
		cancelNewDir();
		cancelRename();
		checkSelAll(); //全选状态+新建状态下，取消新建的checkbox
		
		//取消框选
		if($("selBox")){
			$("book_main").removeChild($("selBox"));
		}
		//拖拽释放
		if($("dragBox")){
			var tarId = $("dragBox").tarId;
			if(tarId && tarId >-1){//可以放入
				moveTo(checkSelBooks(), tarId);
			}
			
			$("book_main").removeChild($("dragBox"));
		}
		document.body.onmousemove = null;
		return false;
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
		if(picMode){
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
		}else{
			html += '<ul class="modeList clearfix">';
			arrChilds.forEach(function(item){
				html += '<li data-id="'+item.id+'">';
				html += '<div class="item_info"><em class="checkSingle"></em>';
				var type = item.type?item.type:"file";
				html += '<i class="ico_main dir_ico i_'+type+'"></i>';
				html += '<span class="title" title="'+item.title+'">'+item.title+'</span></div>';
				html += `<div class='item_opt'>
							<a href="javascript:;">
								<i class="ico_head opt_ico i_download"></i>
							</a>
							<a href="javascript:;">
								<i class="ico_head opt_ico i_share"></i>
							</a>
							<a href="javascript:;">
								<i class="ico_head opt_ico i_move"></i>
							</a>
							<a href="javascript:;">
								<i class="ico_head opt_ico i_rename"></i>
							</a>
							<a href="javascript:;">
								<i class="ico_head opt_ico i_del"></i>
							</a>
						</div>
						<div class="item_time">${item.createtime==undefined?new Date():item.createtime}</div>`
				
				html += "</li>";
			});
			html += '</ul>';
		}
	}
	return html;
}
