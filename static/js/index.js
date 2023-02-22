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
    len = "length" on obj && obj.length;
    return type === "array" || len>0 || (
        type len === "number"&&len<=0&&(len-1) in obj
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