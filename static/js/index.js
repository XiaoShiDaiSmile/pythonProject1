//通用脚本方法
var layui = function(){
    var that = this,
        o = this.options,
        id = o&&o.id;
    if(id){
        layui.that[id] = that;
        layui.config[id] = o;
    }
};
layui.that = {};
layui.config = {};
layui.events = {};
layui.each = function(obj,fn){
    var that = this,
        key,
        callFn = function(obj,key){
            return fn.call(obj[key],obj[key],key);
        };
    if(typeof fn !== "function")return that;
    if(layui._isArray(obj)){
        for(key=0;key<obj.length;key++){
            if(callFn(obj,key))break;
        }
    }else{
        for(key in obj){
            if(callFn(obj,key))break;
        }
    }
};
layui._isArray = function(obj){
    var that = this,
        len,
        type = layui._typeOf(obj);
    if(!obj || typeof obj !== "object" || obj === window)return false;
    len = "length" in obj && obj.length;
    return type === "array" || len>0 || (
        typeof len === "number"&&len<=0&&(len-1) in obj
    )
};
layui._typeOf = function(operand){
    if(operand===null)return String(operand);
    return (typeof operand === "object" || typeof operand === "function")?function(){
        var type = Object.prototype.toString.call(operand).match(/\s(.*)\]$/),
            classType = "Object|Array|Function|RegExp|Symbol|Error";
            type = type[1] || "object";
            return new RegExp('\\b('+classType+')\\b').test(type)?type.toLowerCase():"object";
    }():typeof operand;
};
layui.onevent = function(modName,events,callback){
    var that = this;
    if(typeof modName !== "string"||typeof callback!=="function")return that;
    layui.event(modName,events,null,callback);
};
layui.event = function(modName,events,params,fn){
    var that = this,
        res = null,
        filter = (events||'').match(/\((.*)\)$/),
        eventName = (modName+'.'+events).replace(filter[0],''),
        filterName = filter[1]||'',
        callback = function(item){
            var res = item && item.call(that,params);
        };
    if(fn){
        layui.events[eventName] = layui.events[eventName]||{};
        layui.events[eventName][filterName] = [fn];
        return that;
    };
    layui.each(layui.events[eventName],(item1,i1) =>{
        filterName===i1&&layui.each(item1,(item2,i2) => {
            callback(item2);
        })
    })
};
var _BODY = $("body"),
_DOC = $(document),
_win = $(window);

//菜单组件脚本
var menu = {
    v:'1.0.0',
    config:{},
    index:0
};
menu.render = function(options){
    var inst = new Menu(options);
    return layui.call(inst);
};
var Menu = function(options){
    var that = this;
    that.options = $.extend({},that.config,menu.config,options);
    that.index = ++menu.index;
    that.id = options&&("id" in options)?options.id:that.index;
    that.init();
};
Menu.prototype = {
    constructor:menu,
    config:{},
    init:function(){
        var that = this,
            o = this.options;
        o.side&&(
            $("[data-side-fold]").attr("data-side-fold",0).find("i").addClass("layui-icon-toggle-right").removeClass("layui-icon-toggle-left"),
                $("body").addClass("layui-mini").removeClass("layui-all")
        );
        that.renderTheme({
            defaultBgColorId:1
        })
        that.pullData();
        that.listen();
    },
    render:function(data){
        var that = this,
            o = this.options;
        if(o.single){
            that.renderSingleHtml(data);
        }else{
            that.renderMultipleHtml(data);
        }
    },
    renderSingleHtml:function(data){
        var that = this,
            o = this.options;
    },
    renderMultipleHtml:function(data){
        var that =  this,
            o = this.options,
            topHtml = '',
            leftHtml = '',
            topActiveClass = 'layui-this',
            leftActiveClass = 'layui-show';
        layui.each(data,(item1,i1) => {
            topHtml += that.renderTopHtml({
                title:item1.title,
                icon:item1.icon,
                href:item1.href,
                target:item1.target,
                className:topActiveClass,
                menu:'menu_'+i1
            });
            leftHtml += that.renderLeftHtml(item1.child,{
                parentId:'menu_'+i1,
                className:leftActiveClass
            });
            topActiveClass = '';
            leftActiveClass = 'layui-hide';
        });
        $(window.parent.document).find(".layui-header-menu").empty().append(topHtml);
        $(window.parent.document).find(".layui-side").empty().append(leftHtml);
    },
    renderLeftHtml:function(d,o){
        var that = this,
            leftHtml = '',
            d = d ||[];
        layui.each(d,(item1,i1) =>{
            var children = that.renderChildHtml(item1.child);
            leftHtml += that.renderTopHtml({
                title:item1.title,
                icon:item1.icon,
                href:item1.href,
                target:item1.target,
                className:'',
                children:children
            });
        });
        leftHtml = that.renderUlHtml({children:leftHtml,id:o.parentId,className:o.className});
        return leftHtml;
    },
    renderChildHtml:function(d){
        var that = this,
            html = '',
            d = d || [];
        layui.each(d,(item1,i1) => {
            if(item1.child&&item1.child.length){
                item1.children = that.renderChildHtml(item1.child);
            }
            html += that.renderTopHtml(item1,true);
        });
        return that.renderUlHtml({children:html},true);
    },
    renderUlHtml:function(o,isSub){
        var that = this,
            wrapHtml = '';
        wrapHtml = '<ul class="layui-nav layui-nav-tree '+o.className+'" id="'+o.id+'">'+o.children+'</ul>';
        if(isSub){
            wrapHtml = '<dl class="layui-nav-child">'+o.children+'</dl>';
        }
        if(!o.children){
            return "";
        }
        return wrapHtml;
    },
    renderTopHtml:function(o,isSub){
        var that = this,
            topHtml = '';
        topHtml = '<li class="layui-nav-item menu-li '+o.className+'" '+
            (o.menu?' data-menu="'+o.menu+'"':'')+
            '><a '+
            (o.href?' data-href="'+o.href+'"':'')+
            '>'+
                (o.icon?'<i class="layui-icon layui-icon-'+o.icon+'"></i>':'<i class="layui-icon layui-icon-file"></i>')+
                '<span class="layui-left-nav">'+o.title+'</span>'+
                (o.children?'<i class="layui-icon layui-icon-arrow-down-bold"></i>':'')+
            '</a>'+
                (o.children?''+o.children+'':'')+
            '</li>';
        if(isSub){
            topHtml = '<dd class="menu-dd"><a '+
                ((!o.children||!o.children.length)&&o.href?' data-href="'+o.href+'"':'')+
                '>'+
                    (o.icon?'<i class="layui-icon layui-icon-'+o.icon+'"></i>':'<i class="layui-icon layui-icon-file"></i>')+
                    '<span class="layui-left-nav">'+o.title+'</span>'+
                    (o.children?'<i class="layui-icon layui-icon-arrow-down-bold"></i>':'')+
                '</a>'+
                     (o.children?''+o.children+'':'')+
                '</dd>';
        }
        return topHtml;
    },
    pullData:function(){
        var that = this,
            o = this.options;
        o.request = $.extend({},{
            pageName:'curr',
            limitName:'limit'
        },o.request);
        o.response = $.extend({},{
            codeName:'code',
            codeStatus:0,
            dataName:'data',
            dataType:'json',
            totalRowName:'totalRow',
            countName:'count'
        },o.response);
        if(o.url){
            var params = {};
            params[o.request.pageName] = o.curr;
            params[o.request.limitName] = o.limit;
            var data = $.extend(params,o.where);
            if(o.contentType&&o.contentType.indexOf("application/json")===0){
                data = JSON.stringify(data);
            }
            $.ajax({
                url:o.url,
                type:o.method||"get",
                data:data,
                dataType:'json',
                contentType:o.contentType,
                headers:o.headers||{},
                success:function(res){
                    o.data = res.data;
                    that.render(o.data);
                }
            })
        }else if(layui._typeOf(o.data)==="array"){
            that.render(o.data);
        }
    },
    checktab:function(href,isframe){
        var that = this,
            o = this.options,
            checkable = false;
        layui.each($(".layui-tab-title li"),(item1,i1) => {
            var tabid = $(item1).attr("lay-id");
            if(tabid!==null&&tabid===href){
                checkable = true;
            }
        });
        return checkable;
    },
    createFrame:function(op){
        var that = this,
            o = this.options,
            txt = function(){
                var arr = [],t = '';
                layui.each(op,(item1,i1) => {
                    if(/^title|content$/.test(i1))return;
                    arr.push('lay-id="'+op[i1]+'"');
                    if(arr.length>0)arr.unshift("");
                    t = arr.join("");
                })
                return t;
            }();
        var li = '<li '+txt+'>'+op.title+'</li>';
        $(".layui-tab-title").append(li);
        $(".layui-tab-body").append('<div class="layui-tab-item layui-show">'+op.content+'</div>');
    },
    openTabMenuRight:function(left,href){
        var that = this,
            o = this.options;
        that.closeTabRightMenu();
        var html = '<div class="layui-unselect layui-tab-mousedown layui-show" data-id="'+href+'" style="left:'+left+'px;">'+
                '<dl>'+
                    '<dd>'+
                        '<a href="javascript:;" data-mousedown-close="refresh">'+
                            '<i class="layui-icon layui-icon-setting"></i>'+
                            '<span>刷新当前</span>'+
                        '</a>'+
                    '</dd>'+
                    '<dd>'+
                        '<a href="javascript:;" data-mousedown-close="current">'+
                            '<i class="layui-icon layui-icon-setting"></i>'+
                            '<span>关闭当前</span>'+
                        '</a>'+
                    '</dd>'+
                    '<dd>'+
                        '<a href="javascript:;" data-mousedown-close="other">'+
                            '<i class="layui-icon layui-icon-setting"></i>'+
                            '<span>关闭其它</span>'+
                        '</a>'+
                    '</dd>'+
                    '<dd>'+
                        '<a href="javascript:;" data-mousedown-close="all">'+
                            '<i class="layui-icon layui-icon-setting"></i>'+
                            '<span>关闭全部</span>'+
                        '</a>'+
                    '</dd>'+
                '</dl>'+
            '</div>';
        $(".layui-tab-title").after(html);
    },
    closeTabRightMenu:function(){
        var that = this,
            o = this.options;
        $(".layui-tab-mousedown").remove();
    },
    deletetab:function(href){
        var that = this,
            o = this.options,
            othis = $("[lay-id='"+href+"']"),
            index = othis.index();
        if(othis.hasClass("layui-this")){
            if(othis.next()[0]){
                $(othis.next()[0]).addClass("layui-this").siblings().removeClass("layui-this");
                $(".layui-tab-item").eq(index+1).addClass("layui-show").siblings().removeClass("layui-show");
            }else if(othis.prev()[0]){
                $(othis.prev()[0]).addClass("layui-this").siblings().removeClass("layui-this");
                $(".layui-tab-item").eq(index-1).addClass("layui-show").siblings().removeClass("layui-show");
            }
        };
        othis.remove();
        $(".layui-tab-item").eq(index).remove();
    },
    rollClick:function(dire){
        var that = this,
            o = this.options,
            titleDom = $(".layui-tab-title"),
            scrollLeft = titleDom.scrollLeft();
        if(dire==="left"){
            titleDom.animate({
                scrollLeft:scrollLeft-136
            },300);
        }else{
            titleDom.animate({
                scrollLeft:scrollLeft+136
            },300);
        }
    },
    setPosition:function(){
        var that = this,
            o = this.options,
            titleDom = $(".layui-tab-title"),
            scrollLeft = 0;
        $(".layui-tab-title li").each((index,item) =>{
            if($(item).hasClass("layui-this"))return;
            scrollLeft += scrollLeft+$(item).width();
        });
        titleDom.animate({
                scrollLeft:scrollLeft
        },300);
    },
    renderTheme:function(op){
        var that = this,
            o = this.options;
        var bgColorId = parseInt(sessionStorage.getItem("bgColor"));
        if(isNaN(bgColorId)){
            bgColorId=op.defaultBgColorId;
        }
        that.renderCssHtml(bgColorId);
    },
    renderCssHtml:function(bgColorId){
        var that = this,
            o = this.options;
        if(bgColorId===undefined)return;
        var configData = that.configData.config(bgColorId);
        var style = '.layui-logo{'+
            'background:'+configData.headerLogoColor+'!important;'
        '}';
        $("#layuistyle").empty().append(style);
    },
    configData:{
        config:function(bgColorId){
            var config = [
                {
                    headerLogoColor:'#182027',
                    headerContentColor:"#c3c3c3",
                    sideColor:"#28333e",
                    bodyColor:"#eee"
                },
                {
                    headerLogoColor:'#55b878',
                    headerContentColor:"#acafb1",
                    sideColor:"#009680",
                    bodyColor:"#d2d2d2"
                },
            ]
            if(bgColorId){
                return config[bgColorId];
            }else{
                return config;
            }
        }
    },
    renderBgColorHtml:function(){
        var that = this,
            o = this.options;
        var bgColorId = parseInt(sessionStorage.getItem("bgColor"));
        if(isNaN(bgColorId)){
            bgColorId = 0;
        }
        var configData = that.configData.config();
        var html = "";
        layui.each(configData,(item1,i1) => {
            if(bgColorId===i1){
                html += '<li class="layuiBgColorItem layui-this" data-select-bgcolor="'+i1+'">';
            }else{
                html += '<li class="layuiBgColorItem" data-select-bgcolor="'+i1+'">';
            }
            html += '<div>'+
                '<span style="width:20%;height:14px;display:inline-block;vertical-align:middle;background:'+item1.headerLogoColor+';"></span>'+
                '<span style="width:80%;height:14px;display:inline-block;vertical-align:middle;background:'+item1.headerContentColor+';"></span>'+
            '</div>'+
            '<div>'+
                '<span style="width:20%;height:40px;display:inline-block;vertical-align:middle;background:'+item1.sideColor+';"></span>'+
                '<span style="width:80%;height:40px;display:inline-block;vertical-align:middle;background:'+item1.bodyColor+';"></span>'+
            '</div>'+
            '</li>';
        });
        return html;
    },
    listen:function(){
        var that = this,
            o = this.options;
        $("body").off("click","[data-side-fold]").on("click","[data-side-fold]",function(){
            $(this).attr("data-side-fold")==="1"?(
                $(this).attr("data-side-fold",0).find("i").addClass("layui-icon-toggle-right").removeClass("layui-icon-toggle-left"),
                    $("body").addClass("layui-mini").removeClass("layui-all")
            ):(
                $(this).attr("data-side-fold",1).find("i").addClass("layui-icon-toggle-left").removeClass("layui-icon-toggle-right"),
                    $("body").addClass("layui-all").removeClass("layui-mini")
            )
        });
        $("body").off("click","[data-menu]").on("click","[data-menu]",function(){
            $(this).addClass("layui-this").siblings().removeClass("layui-this");
            $("#"+$(this).attr("data-menu")).addClass("layui-show").removeClass("layui-hide").siblings().addClass("layui-hide").removeClass("layui-show");
        });
        $("body").off("click","[data-href]").on("click","[data-href]",function(){
            var othis = $(this),
                href = othis.attr("data-href"),
                title = othis.find("span").text();
            if(othis.siblings().length>0||othis.parents(".layui-header-menu").length>0)return;
            if(othis.length&&!othis.siblings().length){
                othis.closest(".layui-side").find(".layui-this").removeClass("layui-this");
                othis.parent().addClass("layui-this");
            }
            var checkable = that.checktab(href,true);
            if(!checkable){
                that.createFrame({
                    title:'<i class="layui-tab-active"></i><span>'+title+'</span><i class="layui-icon layui-icon-close layui-tab-close"></i>',
                    content:'<iframe src="'+href+'" frameborder="0" border="0" width="100%" height="100%" maxwidth="0" maxlength="0"></iframe>',
                    tabid:href
                })
            };
            $("[lay-id='"+href+"']").addClass("layui-this").siblings().removeClass("layui-this");
            $(".layui-tab-item").eq( $("[lay-id='"+href+"']").index()).addClass("layui-show").siblings().removeClass("layui-show");
        });
        $("body").off("click",".layui-side a").on("click",".layui-side a",function(){
           var othis = $(this).siblings(),
               parent = othis.parent();
           if(othis.length){
               parent[othis.css("display")==="none"?'addClass':'removeClass']("layui-nav-itemed");
           }
        });
        $("body").off("click",".layui-tab-title li").on("click",".layui-tab-title li",function(){
            $(this).addClass("layui-this").siblings().removeClass("layui-this");
            $(".layui-tab-item").eq($(this).index()).addClass("layui-show").siblings().removeClass("layui-show");
            that.setPosition();
        });
        $("body").off("mouseenter",".layui-nav-setting").on("mouseenter",".layui-nav-setting",function(){
            var child = $(this).find(".layui-nav-child");
            if(child.css("display")==="block"){
                clearTimeout(that.timer);
            };
            that.timer = setTimeout(function(){
                child.addClass("layui-show");
            },300);
        }).off("mouseleave",".layui-nav-setting").on("mouseleave",".layui-nav-setting",function(){
            var child = $(this).find(".layui-nav-child");
            clearTimeout(that.timer);
            that.timer = setTimeout(function(){
                child.removeClass("layui-show");
            },300);
        });
        $("body").off("mouseenter",".layui-tab-tool").on("mouseenter",".layui-tab-tool",function(){
            var child = $(this).find(".layui-nav-child");
            if(child.css("display")==="block"){
                clearTimeout(that.timer);
            };
            that.timer = setTimeout(function(){
                child.addClass("layui-show");
            },300);
        }).off("mouseleave",".layui-tab-tool").on("mouseleave",".layui-tab-tool",function(){
            var child = $(this).find(".layui-nav-child");
            clearTimeout(that.timer);
            that.timer = setTimeout(function(){
                child.removeClass("layui-show");
            },300);
        });
        $(".layui-tab-title").unbind("mousedown").bind("contextmenu",function(e){
            e.stopPropagation();
            return false;
        });
        $("body").off("mousedown",".layui-tab-title li").on("mousedown",".layui-tab-title li",function(e){
            var left = $(this).offset().left-$(".layui-tab-title").offset().left+($(this).width()/2),
                href = $(this).attr("lay-id");
            if(e.which===3){
                that.openTabMenuRight(left,href);
            }
        })
        $("body").off("click",".layui-side,.layui-header,.layui-body,.layui-tab-title").on("click",".layui-side,.layui-header,.layui-body,.layui-tab-title",function(){
            that.closeTabRightMenu();
        });
        $("body").off("click","[data-mousedown-close]").on("click","[data-mousedown-close]",function(){
            var currentType = $(this).attr("data-mousedown-close"),
                currentid = $(this).parents(".layui-tab-mousedown").attr("data-id");
            if(currentType==="refresh"){
                $(".layui-tab-item.layui-show").find("iframe")[0].contentWindow.location.reload();
            }else{
               $(".layui-tab-title li").each((index,item) => {
                   var href = $(item).attr("lay-id"),
                       id = $(item).attr("id");
                   if(id!=="layuitab"){
                       if(currentType==="all"){
                           that.deletetab(href);
                       }else{
                           if(currentType==="current"&&currentid===href){
                               that.deletetab(href);
                           }else if(currentType==="other"&&currentid!==href){
                               that.deletetab(href);
                           }
                       }
                   }
               })
            }
        });
        $("body").off("click","[data-refresh]").on("click","[data-refresh]",function(){
            $(".layui-tab-item.layui-show").find("iframe")[0].contentWindow.location.reload();
        });
        $("body").off("click","[data-tab-close]").on("click","[data-tab-close]",function(){
            var currentType = $(this).attr("data-tab-close");
            if(currentType==="refresh"){
                $(".layui-tab-item.layui-show").find("iframe")[0].contentWindow.location.reload();
            }else{
               $(".layui-tab-title li").each((index,item) => {
                   var href = $(item).attr("lay-id"),
                       id = $(item).attr("id"),
                       iscurrent = $(item).hasClass("layui-this");
                   if(id!=="layuitab"){
                       if(currentType==="all"){
                           that.deletetab(href);
                       }else{
                           if(currentType==="current"&&iscurrent){
                               that.deletetab(href);
                           }else if(currentType==="other"&&!iscurrent){
                               that.deletetab(href);
                           }
                       }
                   }
               })
            }
        });
        $("body").off("click",".layui-tab-title .layui-tab-close").on("click",".layui-tab-title .layui-tab-close",function(){
            that.deletetab($(this).parent().attr("lay-id"));
        });
        $("body").off("click",".layui-roll-left").on("click",".layui-roll-left",function(){
            that.rollClick("left")
        });
        $("body").off("click",".layui-roll-right").on("click",".layui-roll-right",function(){
            that.rollClick("right")
        });
        $("body").off("click","[data-bgcolor]").on("click","[data-bgcolor]",function(){
                var html = that.renderBgColorHtml();
                $("#bgColorElem ul").empty().append(html);
                pop.render({
                    type:1,
                    title:"主题配置",
                    area:"400",
                    offset:'r',
                    anim:1,
                    shadeClose:true,
                    content:$("#bgColorElem")
                })
        });
        $("body").off("click","[data-select-bgcolor]").on("click","[data-select-bgcolor]",function(){
             var othis = $(this);
             sessionStorage.setItem("bgColor",parseInt(othis.attr("data-select-bgcolor")));
             othis.addClass("layui-this").siblings().removeClass("layui-this");
             that.renderCssHtml(parseInt(othis.attr("data-select-bgcolor")));
        });
        $("body").off("click","[data-check-screen]").on("click","[data-check-screen]",function(){
            $(this).attr("data-check-screen")==="full"?(
                $(this).attr("data-check-screen","exit").find("i").addClass("layui-icon-fullscreen-shrink").removeClass("layui-icon-fullscreen-expand"),
                that.fullScreen()
            ):(
                $(this).attr("data-check-screen","full").find("i").addClass("layui-icon-fullscreen-expand").removeClass("layui-icon-fullscreen-shrink"),
                that.exitFullScreen()
            )
        });




    }
}

//弹窗组件脚本
var pop = {
    v:'1.0.0',
    config:{},
    index:0
};
pop.render = function(options){
    var inst = new Pop(options);
    layui.call(inst);
    return inst.index;
};
pop.msg = function(content,options){
    var that = this;
    return pop.render($.extend({},{
        content:content,
        time:3000,
        title:false,
        btn:false,
        closeBtn:false,
        shade:false,
        skin:'layui-layer-msg'
    },options));
};
pop.confirm = function(content,options,yes,cancel){
    var that = this,
        type = typeof options === "function";
    if(type){
        cancel = yes;
        yes = options;
    }
    return pop.render($.extend({},{
        content:content,
        yes:yes,
        cancel:cancel
    },type?{}:options));
};
pop.tips = function(content,follow,options){
    var that = this;
    return pop.render($.extend({},{
        type:4,
        time:3000,
        title:false,
        btn:false,
        closeBtn:false,
        shade:false,
        fixed:false,
        content:[content,follow]
    },options));
};
var Pop = function(options){
    var that = this;
    that.options = $.extend({},that.config,pop.config,options);
    that.index = ++pop.index;
    that.id = options&&("id" in options)?options.id:that.index;
    that.init();
};
Pop.prototype = {
    constructor:pop,
    config:{
        type:0,
        area:"auto",
        offset:"auto",
        fixed:true,
        time:0,
        isOutAnimate:true,
        title:'信息',
        btn:['确定','取消'],
        closeBtn:true,
        btnAlign:"right",
        shade:0.3,
        shadeClose:false,
        move:'.layui-layer-title',
        moveout:false,
        zIndex:100000,
        icon:-1,
        anim:0,
        ismax:false
    },
    ready:{
        type:['dialog','page','iframe','loading','tips'],
        anim:['layui-anim-00','layui-anim-01','layui-anim-02'],
        end:{}
    },
    init:function(){
        var that = this,
            o = this.options;
        that.render();
        that.listen();
    },
    render:function(){
        var that = this,
            o = this.options,
            conType = typeof o.content === "object";
        if(o.elem&&$("#"+o.elem).length>0)return;
        if(typeof o.area === "string"){
            o.area = o.area === "auto"?['','']:[o.area,''];
        }
        switch(o.type){
            case 0:
                that.closeAll("dialog");
                break;
            case 4:
                conType||(o.content=[o.content,"body"]);
                o.follow = o.content[1];
                o.content = o.content[0]+'<i class="layui-layer-tipG"></i>';
                delete o.title;
                o.tips = typeof o.tips === "object"?o.tips:[o.tips,true];
                that.closeAll("tips");
                break;
        }
        that.vessel(conType,function(html,titleHtml){
            $("body").append(html[0]);
            conType?function(){
                if(o.type===2||o.type===4){
                    $("body").append(html[1]);
                }else{
                    o.content.data("display",o.content.css("display")).show().addClass("layui-layer-wrap").wrap(html[1]);
                    o.content.parent().before(titleHtml);
                }
            }():$("body").append(html[1])
        }).auto(that.index);
        o.dom = $("#layui-layer"+that.index+"");
        if(that.ready.anim[o.anim]){
            var animClass = 'layui-anim '+that.ready.anim[o.anim];
            o.dom.addClass(animClass).one("transitionend",function(){
                o.dom.removeClass(animClass);
            })
        }
        o.type===4?that.tips():function(){
            that.offset();
        }();
        o.time<=0||setTimeout(function(){
            that.close(that.index);
        },o.time);
        that.move().callback();
    },
    move:function(){
        var that = this,
            o = this.options;

        return that;
    },
    callback:function(){
        var that = this,
            o = this.options;
        o.end&&(that.ready.end[that.index] = o.end);
    },
    tips:function(){
        var that = this,
            o = this.options;
    },
    offset:function(){
        var that = this,
            o = this.options,
            layerdom = $("#layui-layer"+that.index+""),
            area = [layerdom.outerWidth(),layerdom.outerHeight()],
            type = typeof o.offset === "object";
        o.offsetLeft = ($(window).width()-area[0])/2;
        o.offsetTop = ($(window).height()-area[1])/2;
        if(type){
            o.offsetLeft = o.offset[0];
            o.offsetTop = o.offset[1];
        }else if(o.offset!=="auto"){
            if(o.offset==='t'){
                o.offsetTop = 14;
            }else if(o.offset === "r"){
                o.offsetLeft = $(window).width()-area[0];
            }
        }
        layerdom.css({
            left:o.offsetLeft,
            top:o.offsetTop
        })
    },
    auto:function(index){
        var that = this,
            o = this.options,
            layerdom = $("#layui-layer"+index+"");
        if(o.area[1]===0&&o.maxwidth>0){
            layerdom.outerWidth()>o.maxwidth&&layerdom.width(o.maxwidth);
        }
        var area = [layerdom.outerWidth(),layerdom.outerHeight()],
            titleHeight = layerdom.find(".layui-layer-title").outerHeight()||0,
            btnHeight = layerdom.find(".layui-layer-btn").outerHeight()||0,
            setHeight = function(elem){
                var elem1 = layerdom.find(elem);
                elem1.height(area[1]-titleHeight-btnHeight-2*(parseFloat(elem1.css("padding-top"))||0));
            };
        switch(o.type){
            case 2:
                setHeight("iframe");
                break;
            default:
                if(o.area[1]===""){
                    if(o.maxheight>0&&o.area[1]>o.maxheight){
                        area[1] = o.maxheight;
                        setHeight(".layui-layer-content");
                    }else if(o.fixed&&o.area[1]>$(window).height()){
                        area[1] = $(window).height();
                        setHeight(".layui-layer-content");
                    }else if(o.fixed&&o.area[0]!==''){
                        area[1] = $(window).height();
                        setHeight(".layui-layer-content");
                    }
                }else{
                    setHeight(".layui-layer-content");
                }
                break;
        }
    },
    vessel:function(conType,callback){
        var that = this,
            o = this.options,
            titType = typeof o.title === "array",
            titleHtml = o.title?'<div class="layui-layer-title" style="background:'+(titType?o.title[1]:'')+';">'+(titType?o.title[0]:o.title)+'</div>':'',
            zIndex = that.index+o.zIndex,
            ismax = o.ismax&&(o.type===2||o.type===4);
        callback([
            o.shade?'<div class="layui-layer-shade" id="layui-layer-shade'+that.index+'" style="background:rgb(0,0,0);z-index:'+(zIndex-1)+';opacity:'+o.shade+';"></div>':'',
            '<div class="layui-layer layui-layer-'+that.ready.type[o.type]+' '+(o.skin?o.skin:'')+'" id="layui-layer'+that.index+'" times="'+that.index+'" type="'+that.ready.type[o.type]+'" conType="'+(conType?"object":"string")+'" style="width:'+o.area[0]+'px;height:'+o.area[1]+'px;z-index:'+zIndex+';position:'+
            (o.fixed?"fixed":'absolute')+
            ';">'+
                (conType&&o.type===1?'':titleHtml)+
                '<div class="layui-layer-content" id="'+o.elem+'">'+
                    (o.type===0&&o.icon!==-1?'<i class="layui-icon layui-icon-'+o.icon+'"></i>':'')+
                    (conType&&o.type===1?'':(o.content||''))+
                '</div>'+
                '<div class="layui-layer-setwin">'+(function(){
                    var closebtn = ismax?'<div class="layui-layer-ico layui-layer-close"><i class="layui-icon layui-icon-close"></i></div>':'';
                    o.closeBtn&&(closebtn+='<div class="layui-layer-ico layui-layer-close"><i class="layui-icon layui-icon-close"></i></div>');
                    return closebtn;
            }())+'</div>'+
                (o.btn?function(){
                    var button = '';
                    for(var i=0;i<o.btn.length;i++){
                        button += '<a href="javascript:;" class="layui-btn layui-btn'+i+'">'+o.btn[i]+'</a>';
                    }
                    return '<div class="layui-layer-btn layui-layer-btn-'+o.btnAlign+'">'+button+'</div>';
                }():'')+
            '</div>'
        ],titleHtml);
        return that;
    },
    closeAll:function(type,callback){
        var that = this,
            o = this.options,
            dom = $(".layui-layer");
        dom.each((index,item) => {
            var othis = $(item),
                is = type?type===othis.attr("type"):1;
            is&&that.close(othis.attr("times"));
        })
    },
    close:function(index,callback){
        var that = this,
            o = this.options,
            layerdom = $("#layui-layer"+index+""),
            type = layerdom.attr("type"),
            remove = function(){
                if(type&&type===that.ready.type[1]){
                    layerdom.children(":not(.layui-layer-content)").remove();
                    var wrap = layerdom.find(".layui-layer-wrap");
                    for(var i=0;i<2;i++){
                        wrap.unwrap();
                    }
                    wrap.css("display",wrap.data("display")).removeClass("layui-layer-wrap");
                }else{
                    layerdom[0].innerHTML = '';
                    layerdom.remove();
                }
                typeof that.ready.end[that.index] === "function"&&that.ready.end[that.index](that.index,layerdom);
            };
        if(!layerdom[0])return;
        if(o.isOutAnimate){
            var animClass = 'layui-anim '+that.ready.anim[o.anim]+'-out';
            o.dom.addClass(animClass);
        }
        $("#layui-layer-shade"+that.index+"").remove();
        if(!o.isOutAnimate){
            remove();
        }else{
            setTimeout(function(){
                remove();
            },300)
        }
    },
    listen:function(){
        var that = this,
            o = this.options;
        $(window).on("resize",function(){
            o.type===4?that.tips():that.offset();
        });
        $("body").off("click","#layui-layer"+that.index+" .layui-layer-close").on("click","#layui-layer"+that.index+" .layui-layer-close",function(){
            that.close(that.index);
        });
        o.shadeClose&&$("body").off("click","#layui-layer-shade"+that.index+"").on("click","#layui-layer-shade"+that.index+"",function(){
            that.close(that.index);
        });


    }
};

//表格组件脚本
var table = {
    v:'1.0.0',
    config:{},
    index:0,
    cache:[]
};
table.render = function(options){
    var inst = new Table(options);
    return layui.call(inst);
};
table.on = function(events,callback){
    var that = this;
    layui.onevent('table',events,callback);
};
var Table = function(options){
    var that = this;
    that.options = $.extend({},that.config,table.config,options);
    that.index = ++table.index;
    that.id = options&&("id" in options)?options.id:that.index;
    that.init();
};
Table.prototype = {
    constructor:table,
    config:{
        curr:1,
        limit:5,
        loading:true,
        prev:'<i class="layui-icon layui-icon-arrow-left-bold"></i>',
        next:'<i class="layui-icon layui-icon-arrow-right-bold"></i>',
        text:{
            none:'暂无数据!'
        }
    },
    init:function(){
        var that = this,
            o = this.options;
        that.renderBox();
        that.renderToolbar();
        that.pullData();
        that.listen();
    },
    renderToolbar:function(){
        var that = this,
            o = this.options;
        var leftDefaultHtml = [
            '<div class="layui-table-inline" lay-event="add"><i class="layui-icon layui-icon-add"></i></div>',
            '<div class="layui-table-inline" lay-event="edit"><i class="layui-icon layui-icon-edit"></i></div>',
            '<div class="layui-table-inline" lay-event="delete"><i class="layui-icon layui-icon-delete"></i></div>'
        ].join("");
        if(o.toolbar==="default"){
            $("#layui-table"+that.index+"").find(".layui-table-tool-temp").empty().append(leftDefaultHtml);
        }else if(typeof o.toolbar === "function"){
            $("#layui-table"+that.index+"").find(".layui-table-tool-temp").empty().append(o.toolbar(o));
        }
    },
    render:function(data,curr,limit){
        var that = this,
            o = this.options;
        o.count = data.length;
        o.startcurr = data*limit-limit;
        o.datalist = data.concat().splice(o.startcurr,limit);
        table.cache[that.index] = o.datalist;
        that.setKey();
        that.renderTheadHtml();
        that.renderTbodyHtml();
        that.setAutoWidth();
        form.render();
    },
    setAutoWidth:function(){
        var that = this,
            o = this.options,
            colnum = 0,
            autonum = 0,
            autowidth = 0,
            curwidth = o.el.width(),
            countwidth = 0,
            minwidth = o.minwidth||47;
        layui.each(o.cols,(item1,i1) => {
            layui.each(item1,(item2,i2) =>{
                if(item2.hide)return;
                colnum++;
            })
        });
        curwidth = curwidth-function(){
            return o.skin==='line'?2:colnum+2;
        }();
        var setDefaultWidth = function(back){
            if(!back){
                var width = 0;
                layui.each(o.cols,(item1,i1) => {
                    layui.each(item1,(item2,i2) =>{
                        if(!item2.width&&item2.type!=="checkbox"){
                            item2.width = width = 0;
                            autonum++;
                        }else if(item2.type === "checkbox"){
                            item2.width = width = item2.width||49;
                        }else{
                            width = item2.width;
                        }
                        countwidth = countwidth+width;
                    })
                });
                countwidth<curwidth&&autonum&&(
                    autowidth = (curwidth-countwidth)/autonum
                )
            }
        };
        setDefaultWidth();
        layui.each(o.cols,(item1,i1) => {
              layui.each(item1,(item2,i2) =>{
                  if(!item2.width&&item2.type!=="checkbox"){
                            $(".layui-table-cell-"+that.index+"-"+item2.key+"").css({'width':autowidth<minwidth?minwidth:autowidth+'px'});
                        }else if(item2.type === "checkbox"){
                            $(".layui-table-cell-"+that.index+"-"+item2.key+"").css({'width':item2.width+'px'});
                        }else{
                           $(".layui-table-cell-"+that.index+"-"+item2.key+"").css({'width':item2.width+'px'});
                        }
                    })
                });
    },
    renderTbodyHtml:function(){
        var that = this,
            o = this.options,
            tbodytr = [],
            tbodytr_fixed = [],
            tbodytr_fixed_r = [];
        layui.each(o.datalist,(item1,i1) => {
            var tbodytd = [],
                tbodytd_fixed =[],
                tbodytd_fixed_r = [];
            layui.each(o.cols,(item2,i2) => {
                layui.each(item2,(item3,i3) =>{
                    var field = item3.field,
                        content = item1[field];
                    var td = '<td data-field="'+item3.field+'" data-key="'+that.index+'-'+item3.key+'">'+
                        '<div class="layui-table-cell layui-table-cell-'+that.index+'-'+item3.key+''+
                        (item3.type==="checkbox"?" layui-cell-checkbox":'')+
                        '">'+(function(){
                            var tplData = $.extend({},{

                            },item1);
                            switch(item3.type){
                                case "checkbox":
                                    return '<input type="checkbox" name="layuiTableCheckbox" '+
                                        (tplData.isShow?' checked':'')+
                                    '/>';
                                    break;
                            }
                            if(item3.toolbar){
                                return item3.toolbar(tplData);
                            }
                            return item3.template?function(){
                                if(typeof item3.template === "function"){
                                    return item3.template(tplData);
                                }
                            }():function(){
                                if(content===undefined||content === null){
                                    return '<i class="layui-icon layui-icon-file"></i>';
                                }
                                return content;
                            }();
                        }())+'</div>'+
                    '</td>';
                    tbodytd.push(td);
                    if(item3.fixed&&item3.fixed !== "right")tbodytd_fixed.push(td);
                    if(item3.fixed==="right")tbodytd_fixed_r.push(td);
                });
            });
            tbodytd.length>0&&tbodytr.push('<tr data-index="'+i1+'">'+tbodytd.join("")+'</tr>');
            tbodytd_fixed.length>0?(tbodytr_fixed.push('<tr data-index="'+i1+'">'+tbodytd_fixed.join("")+'</tr>')):($("#layui-table"+that.index+"").find(".layui-table-fixed-l").remove());
            tbodytd_fixed_r.length>0?(tbodytr_fixed_r.push('<tr data-index="'+i1+'">'+tbodytd_fixed_r.join("")+'</tr>')):($("#layui-table"+that.index+"").find(".layui-table-fixed-r").remove());
        });
        $("#layui-table"+that.index+"").find(".layui-table-main tbody").empty().append(tbodytr.join(""));
        $("#layui-table"+that.index+"").find(".layui-table-fixed-l .layui-table-body tbody").empty().append(tbodytr_fixed.join(""));
        $("#layui-table"+that.index+"").find(".layui-table-fixed-r .layui-table-body tbody").empty().append(tbodytr_fixed_r.join(""));
    },
    renderTheadHtml:function(){
        var that = this,
            o = this.options,
            theadtr = [],
            theadtr_fixed = [],
            theadtr_fixed_r = [];
        layui.each(o.cols,(item1,i1) => {
            var theadth = [],
                theadth_fixed = [],
                theadth_fixed_r = [];
            layui.each(item1,(item2,i2) =>{
                var th = '<th data-field="'+item2.field+'" data-key="'+that.index+'-'+item2.key+'">'+
                    '<div class="layui-table-cell layui-table-cell-'+that.index+'-'+item2.key+''+
                    (item2.type === "checkbox"?' layui-cell-checkbox':'')+
                    '">'+(function(){
                        switch(item2.type){
                            case "checkbox":
                                return '<input type="checkbox" name="layuiTableCheckbox" lay-filter="layuiTableAllChoose"/>';
                                break;
                        }
                        return item2.title;
                    }())+'</div>'+
                '</th>';
                theadth.push(th);
                if(item2.fixed&&item2.fixed!=="right")theadth_fixed.push(th);
                if(item2.fixed==="right")theadth_fixed_r.push(th);
            });
            theadth.length>0&&theadtr.push('<tr data-index="'+i1+'">'+theadth.join("")+'</tr>');
            theadth_fixed.length>0&&theadtr_fixed.push('<tr data-index="'+i1+'">'+theadth_fixed.join("")+'</tr>');
            theadth_fixed_r.length>0&&theadtr_fixed_r.push('<tr data-index="'+i1+'">'+theadth_fixed_r.join("")+'</tr>');
        });
        $("#layui-table"+that.index+"").find(".layui-table-header-d thead").empty().append(theadtr.join(""));
        $("#layui-table"+that.index+"").find(".layui-table-fixed-l .layui-table-header thead").empty().append(theadtr_fixed.join(""));
        $("#layui-table"+that.index+"").find(".layui-table-fixed-r .layui-table-header thead").empty().append(theadtr_fixed_r.join(""));
    },
    setKey:function(){
        var that = this,
            o = this.options;
        layui.each(o.cols,(item1,i1) => {
            layui.each(item1,(item2,i2) =>{
                item2.key = i1+'-'+i2;
                item2.hide = item2.hide||false;
            })
        })
    },
    pullData:function(){
        var that = this,
            o = this.options;
        o.request = $.extend({},{
            pageName:'curr',
            limitName:'limit'
        },o.request);
        o.response = $.extend({},{
            codeName:'code',
            codeStatus:0,
            dataName:'data',
            dataType:'json',
            totalRowName:'totalRow',
            countName:'count'
        },o.response);
        if(o.url){
            var params = {};
            params[o.request.pageName] = o.curr;
            params[o.request.limitName] = o.limit;
            var data = $.extend(params,o.where);
            if(o.contentType&&o.contentType.indexOf("application/json")===0){
                data = JSON.stringify(data);
            }
            $.ajax({
                url:o.url,
                type:o.method||"get",
                data:data,
                dataType:'json',
                contentType:o.contentType,
                headers:o.headers||{},
                success:function(res){
                    o.data = res.data?res.data:[];
                    that.render(o.data,o.curr,o.limit);
                }
            })
        }else if(layui._typeOf(o.data)==="array"){
            o.data = o.data?o.data:[];
            that.render(o.data,o.curr,o.limit);
        }
    },
    renderBox:function(){
        var that = this,
            o = this.options,
            hasRender = $(o.elem).next(".layui-table-view");
        hasRender[0]&&hasRender.remove();
        var html = '<div class="layui-form layui-border-box layui-table-view" id="layui-table'+that.index+'">'+
            (o.toolbar?'<div class="layui-table-tool">'+
                '<div class="layui-table-tool-temp"></div>'+
                '<div class="layui-table-tool-left"></div>'+
            '</div>':'')+
            '<div class="layui-table-box">'+
                '<div class="layui-table-header layui-table-header-d">'+
                    '<table class="layui-table" cellpadding="0" cellspacing="0" border="0">'+
                        '<thead></thead>'+
                    '</table>'+
                '</div>'+
                '<div class="layui-table-body layui-table-main">'+
                    '<table class="layui-table" cellpadding="0" cellspacing="0" border="0">'+
                        '<tbody></tbody>'+
                    '</table>'+
                '</div>'+
                '<div class="layui-table-fixed layui-table-fixed-l">'+
                    '<div class="layui-table-header">'+
                        '<table class="layui-table" cellpadding="0" cellspacing="0" border="0">'+
                            '<thead></thead>'+
                        '</table>'+
                    '</div>'+
                    '<div class="layui-table-body">'+
                        '<table class="layui-table" cellpadding="0" cellspacing="0" border="0">'+
                            '<tbody></tbody>'+
                        '</table>'+
                    '</div>'+
                '</div>'+
                '<div class="layui-table-fixed layui-table-fixed-r">'+
                    '<div class="layui-table-header">'+
                        '<table class="layui-table" cellpadding="0" cellspacing="0" border="0">'+
                            '<thead></thead>'+
                        '</table>'+
                    '</div>'+
                    '<div class="layui-table-body">'+
                        '<table class="layui-table" cellpadding="0" cellspacing="0" border="0">'+
                            '<tbody></tbody>'+
                        '</table>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<div class="layui-table-page">'+
                '<div id="layui-table-page'+that.index+'"></div>'+
            '</div>'+
        '</div>';
        $(o.elem).after(html);
        o.dom = $("#layui-table"+that.index+"");
        o.el = $(o.elem);
    },
    listen:function(){
        var that = this,
            o = this.options;
        $(window).on("resize",function(){
            that.setAutoWidth();
        });
        $("body").off("click","#layui-table"+that.index+" *[lay-event]").on("click","#layui-table"+that.index+" *[lay-event]",function(){
            var othis = $(this),
                filter = o.el.attr("lay-filter");
            layui.event('table','toolbar('+filter+')',$.extend({},{
                event:othis.attr("lay-event")
            }))
        });


    }
};

//表单组件脚本
var form = {
    v:'1.0.0',
    config:{},
    index:0
};
form.render = function(options){
    var inst = new Form(options?options:{});
    return layui.call(inst);
};
var Form = function(options){
    var that = this;
    that.options = $.extend({},that.config,form.config,options);
    that.index = ++form.index;
    that.id = options&&("id" in options)?options.id:that.index;
    that.init();
};
Form.prototype = {
    constructor:form,
    config:{

    },
    init:function(){
        var that = this,
            o = this.options;
        that.render();
    },
    render:function(){
        var that = this,
            o = this.options,
            elemForm = $(".layui-form"+function(){
                return o.filter?'[lay-filter="'+o.filter+'"]':'';
            }()),
            items = {
                input:function(){

                },
                checkbox:function(){
                    //console.log("checkbox")
                },
                select:function(){
                    var selects = elemForm.find("select");

                    selects.each((index,select) => {
                        var othis = $(select),
                            disabled = select.disabled,
                            value = select.value,
                            selected = $(select.options[select.selectedIndex]),
                            optionfirst = select.options[0],
                            tips = "请选择",
                            isSearch = typeof othis.attr("lay-search")==="string",
                            placeholder = optionfirst?(optionfirst.value?(optionfirst.innerHTML||tips):tips):tips,
                            hasRender = othis.next(".layui-form-select");
                        var reElem = $(['<div class="layui-form-select '+
                            (isSearch?' layui-form-unselect':'')+
                            (disabled?' layui-form-disabled':'')+
                        '">'+
                            '<div class="layui-select-title">'+
                                '<input type="text" class="layui-input '+
                                    (isSearch?' layui-form-unselect':'')+
                                    (disabled?' layui-form-disabled':'')+
                                '" placeholder="'+$.trim(placeholder)+'" value="'+(value?$.trim(selected.html()):'')+'" '+
                                    ((!disabled&&isSearch)?'':' readonly')+
                                '/>'+
                                '<i class="layui-icon layui-icon-arrow-down-bold"></i>'+
                            '</div>'+
                            '<dl class="layui-anim layui-anim-upbit">'+(function(options){
                                var html = [];
                                options.each((index,item) => {
                                    if(index===0&&!item.value){
                                        html.push('<dd class="layui-select-tips" lay-value="">'+$.trim(item.innerHTML||tips)+'</dd>');
                                    }else{
                                        html.push('<dd class="'+(item.value===value?'layu-this':'')+'" lay-value="'+item.value+'">'+$.trim(item.innerHTML)+'</dd>');
                                    }
                                })
                                html.length<0&&html.push('<dd class="layui-select-none">暂无数据</dd>');
                                return html.join("");
                            }(othis.find("*")))+'</dl>'+
                        '</div>'].join(""));
                        hasRender[0]&&hasRender.remove();
                        othis.after(reElem);
                           // console.log(selected)
                    })

                }
            };
            o.type?items[o.type]():layui.each(items,(item1,i1) => {
                item1();
            });
    }
}

