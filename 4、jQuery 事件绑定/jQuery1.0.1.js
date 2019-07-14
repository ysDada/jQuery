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
    jQuery.extend({
        //Callbacks队列函数，用于管理函数队列
        Callbacks: function(options){
            options = typeof options === "string" ? (optionsCache[options] || createOptions(options)) : {}
            var list = []   //储存函数
            var index,length,testting,memory,start,starts
            var fire = function(data){
                length = list.length
                index = starts || 0
                //控制memory参数,将data赋值给memory
                memory = options.memory && data
                testting = true
                for(; index < length; index++){
                    //控制stopOnFalse参数，如果函数返回false，则retun
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
					return this;
                },
                //控制上下文的对象
                fireWith(content, arguments){
                    //控制once参数
                    if(!options.once || !testting){
                        fire([content, arguments])
                    }
                },
                //控制参数的传递
                fire(){
                    self.fireWith(this, arguments)
                }
            }
            return self
        },
		// 异步回调解决方案
        Deferred: function(func){
            //延迟对象的三种不同状态信息描述
            var tuples = [
                ["resolve", "done", jQuery.Callbacks("once memory"), "resolved"],
                ["reject", "fail", jQuery.Callbacks("once memory"), "rejected"],
                ["notify", "progress", jQuery.Callbacks("memory")],
            ],
            state = "pedding",
            promise = {
                state(){
                    return state
                },
                then(){
                },
                promise(obj){
                    return obj != null ? jQuery.extend(obj, promise) : promise
                }
            },
            //延迟对象
            deferred = {}

            tuples.forEach((tuple, i)=>{
                var list = tuple[2],    //创建一个队列，会创建三次队列
                    stateString = tuple[3]

                //promise[ done | fail | progress ] = list.add
                //调用done,fail,progress会给队列里面添加处理函数
                promise[tuple[1]] = list.add

                if(stateString){    //添加第一个处理程序
                    list.add(function(){
                        state = stateString
                    })
                }

                //给deferred扩展resolve,reject,notify属性
                // deferred.notify = function() { deferred.notifyWith(...) }
                // deferred.resolve = function() { deferred.resolveWith(...) }
                // deferred.reject = function() { deferred.rejectWith(...) }
                deferred[tuple[0]] = function(){
                    deferred[tuple[0] + "With"](this === deferred ? promise : this , arguments)
                    return this
                }
                // deferred.notifyWith = list.fireWith
                // deferred.resolveWith = list.fireWith
                // deferred.rejectWith = list.fireWith
                // 执行队列，并且传参
                deferred[tuple[0] + "With"] = list.fireWith
            })

            //扩展deferred属性，相当于合并promise跟deferred,
            //基本数据类型传参是按值传递，不会改变原对象。引用数据类型按对象传递、按对象共享传递，该方法会改变实参deferred
            // deferred对象上面有 resolve | reject | notify | state | then | promise | done | fail | progress | notifyWith | rejectWith | resolveWith
            promise.promise(deferred)

            return deferred
        },
        //接受一个或多个延迟对象的回调函数
        when(subordinate){
            return subordinate.promise()
        }
    })

    jQuery.fn.extend({
        on(types, fn){
            var type;
            if(typeof types === "object"){
                for(type in types){
                    this.on(type[type], fn)
                }
            }
            return this.each(()=>{
                jQuery.event.add(this, types, fn)
            })
        }
    })

    jQuery.event = {
        //elem当前dom元素
        add(elem, type, handler){
            var eventHandle, event, handlers;
            var elemData = data_priv.get(elem)

        }
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