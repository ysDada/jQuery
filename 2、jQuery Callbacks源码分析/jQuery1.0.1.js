(function(root){
    var jQuery = function(){
        return new jQuery.prototype.init()  //返回的是init实例对象,该原型对象跟jQuery原型对象相等
    }
    jQuery.fn = jQuery.prototype = {
        init: function(){

        },
        method: function(){
            return 123
        }
    }
    jQuery.fn.extend = jQuery.extend = function(){
        var targe = arguments[0] || {}
        var length = arguments.length
        var i = 1
        var deep = false
        var option, name, copy, src, copyIsArr, clone
        //深拷贝，浅拷贝
        if(typeof targe === "boolean"){
            deep = targe
            targe = arguments[1] || {}  //为了不改变之前的步骤，将参数第二项赋给target,并且将i改为2
            i = 2
        }
        if(typeof targe !== "object"){
            targe = {}
        }
        //参数个数等于1，说明是往自身扩展
        if(i === length){
            targe = this
            i--
        }
        for(; i < length; i++){
            if((option = arguments[i]) != null){
                for(name in option){
                    copy = option[name]
                    src = targe[name]
                    if(deep && copy && (copy instanceof Object || (copyIsArr = copy instanceof Array))){//判断是否是深拷贝及浅拷贝，copyIsArr判断是否是数组
                        if(copyIsArr){  //copy是数组
                            copyIsArr = false
                            clone = src && src instanceof Array ? src : []
                        } else {
                            clone = src && src instanceof Object ? src : {}
                        }
                        targe[name] = jQuery.extend(deep, clone, copy)  //递归调用，深拷贝
                    } else if(copy){
                        targe[name] = copy
                    }
                }
            }
        }
        return targe
    }

    var optionsCache = {}

    jQuery.Callbacks = function(options){
        options = typeof options === "string" ? (optionsCache[options] || createOptions(options)) : {}
        var list = []   //储存函数
        var index,length,testting,memory,start,starts
        var fire = function(data){
            length = list.length
            index = starts || 0
            starts = 0
            //控制memory参数,将data赋值给memory
            memory = options.memory && data
            testting = true
            for(; index < length; index++){
                //控制stopOnFalse参数，如果函数返回false，则return
                if(list[index].apply(data[0],data[1]) === false && options.stopOnFalse){
                    break
                }
            }
        }
        var self = {
            //将传进来的方法放入list队列中
            add(){
                start = list.length;
                [...arguments].forEach((fn)=>{
                    if(toString.call(fn)==="[object Function]"){
                        //控制unique参数
                        if(!options.unique || list.indexOf(fn) <= -1){
                            list.push(fn)
                        }
                    }
                })
                if(memory){
                    starts = start
                    fire(memory)
                }
            },
            //控制参数的传递
            fireWith(content, arguments){
                //控制once参数
                if(!options.once || !testting){
                    fire([content, arguments])
                }
            },
            //控制上下文的绑定
            fire(){
                self.fireWith(this, arguments)
            }
        }
        return self
    }

    //接受参数，支持多个参数传递，将其保存到optionsCache缓存里面
    function createOptions(options){
        var object = optionsCache[options] = {}
        options.split(/\s+/).forEach(value => {
            object[value] = true
        })
        return object
    }

    //共享原型对象
    jQuery.prototype.init.prototype = jQuery.fn
    root.$ = root.jQuery = jQuery
})(this)