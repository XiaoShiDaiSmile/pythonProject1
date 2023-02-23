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
                    headerContentColor:"#fff",
                    headerSideColor:"#28333e",
                    headerBodyColor:"#ffff"
                },
                {
                    headerLogoColor:'#55b878',
                    headerContentColor:"#fff",
                    headerSideColor:"#009680",
                    headerBodyColor:"#ffff"
                },
            ]
            if(bgColorId){
                return config[bgColorId];
            }else{
                return config;
            }
        }
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
                pop.render({
                    type:1,
                    title:"测试",
                    area:"400",
                    offset:'r',
                    anim:1,
                    shadeClose:true
                })
        })


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
            '<div class="layui-layer layui-layer-'+that.ready.type[o.type]+' '+(o.skin?o.skin:'')+'" id="layui-layer'+that.index+'" times="'+that.index+'" type="'+that.ready.type[o.type]+'" conType="'+(conType?"object":"string")+'" style="width:'+o.area[0]+'px;height:'+o.area[1]+';z-index:'+zIndex+';position:'+
            (o.fixed?"fixed":'absolute')+
            ';">'+
                (conType&&o.type===2?'':titleHtml)+
                '<div class="layui-layer-content" id="'+o.elem+'">'+
                    (o.type===0&&o.icon!==-1?'<i class="layui-icon layui-icon-'+o.icon+'"></i>':'')+
                    (conType&&o.type===2?'':(o.content||''))+
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

