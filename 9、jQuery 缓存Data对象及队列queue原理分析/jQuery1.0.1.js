(function(root){
    var core_version = "1.0.1";
    var rejectExp = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
    
	function returnTrue() {
		return true;
	}

	function returnFalse() {
		return false;
    }
    
	//activeElement 属性返回文档中当前获得焦点的元素。
	function safeActiveElement() {
		try {
			return document.activeElement;
		} catch (err) {}
    }
    
    function isArrayLike( obj ){
        var length = obj.length
        if( obj.nodeType === 1 && length ){
            return true
        }

        return toString.call(obj) === "[object Array]" || typeof obj !== "function" &&
            ( length === 0 || typeof length === "number" && length > 0 && ( length - 1 ) in obj )
    }
    
    var jQuery = function(selector, context){
        return new jQuery.prototype.init(selector, context)  //返回的是init实例对象,该原型对象跟jQuery原型对象相等
    }
    jQuery.fn = jQuery.prototype = {
        length: 0,
		jquery: core_version,
		selector: "",
		init: function(selector, context) {
			context = context || document;
			var match, elem, index = 0;
			//$()  $(undefined)  $(null) $(false)  
			if (!selector) {
				return this;
			}
			if (typeof selector === "string") {
				if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
					match = [selector]
				}
				//创建DOM
				if (match) {
                    //this  
					jQuery.merge(this, jQuery.parseHTML(selector, context));
					//查询DOM节点
				} else {
					elem = document.querySelectorAll(selector);
					var elems = Array.prototype.slice.call(elem);
					this.length = elems.length;
					for (; index < elems.length; index++) {
						this[index] = elems[index];
					}
					this.context = context;
					this.selector = selector;
				}
			} else if (selector.nodeType) {
				this.context = this[0] = selector;
				this.length = 1;
				return this;
			}

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
        //随机数,/\D/g  去掉非数字
        expando: "jQuery" + (core_version + Math.random()).replace(/\D/g, ""),
        guid: 1, //计数器
        now: Date.now, //返回当前时间距离时间零点(1970年1月1日 00:00:00 UTC)的毫秒数
        //类型检测     
		isPlainObject: function(obj) {
			// return typeof obj === "object";
			return toString.call(obj) === "[object object]";
		},
		isArray: function(obj) {
			return toString.call(obj) === "[object Array]";
		},
		isFunction: function(fn) {
			return toString.call(fn) === "[object Function]";
		},
		//类数组转化成正真的数组  
		markArray: function(arr, results) {
            var ret = results || [];
            if(isArrayLike(arr)){
                if (arr != null) {
                    jQuery.merge(ret, typeof arr === "string" ? [arr] : arr);
                }
            } else {
                ret.push(arr)
            }
   
			return ret;
		},
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
        },
		//合并数组
		merge: function(first, second) {
			var l = second.length,
				i = first.length,
				j = 0;

			if (typeof l === "number") {
				for (; j < l; j++) {
					first[i++] = second[j];
				}
			} else {
				while (second[j] !== undefined) {
					first[i++] = second[j++];
				}
			}

			first.length = i;

			return first;
		},
		parseHTML: function(data, context) {
			if (!data || typeof data !== "string") {
				return null;
			}
            //过滤掉<a>   <a>   => a 
			var parse = rejectExp.exec(data);
			return [context.createElement(parse[1])];
		},
        /*
            object   目标源
            callback  回调函数
            args     自定义回调函数参数
		*/
        each(object, callbacks, args){
            var length = object.length
            var name, i = 0
            if(args){
                if(length === undefined){
                    //说明是对象
                    for(obj in object){
                        callbacks.apply(object, args)
                    }
                } else {
                    //说明是数组
                    for(; i < length ;){
                        callbacks.apply(object[i++], args)
                    }
                }
            } else {
                if(length === undefined){
                    //说明是对象
                    for(obj in object){
                        callbacks.call(object, obj, object[obj])
                    }
                } else {
                    //说明是数组
                    for(; i < length ;){
                        callbacks.call(object[i], i , object[i++])
                    }
                }
            }
        },
        //arg: this, function(){}, key, value
        //会产生变化的有key,value
        access: function(elems, func, key, value){
            var len = elems.length
            var testting = key === null //专门为text方法定制
            var chain, cache
            if(jQuery.isPlainObject(key)){
                chain = true
                for(let name in key){
                    jQuery.access(elems, func, name, key[name])
                }
            }

            if(value !== undefined){
                chain = true
                //说明value有值，则做set操作
                if(testting){
                    //百分百调用text方法
                    cache = func
                    func = function(key, value){
                        cache.call(this, key, value)
                    }
                }
                for(var i = 0; i < len; i++){
                    func.call(elems[i], key, value)
                }
            }
            return chain ? elems : func.call(elems[0], key, value)
        },
        text(elem){
            var nodeType = elem.nodeType
            if(nodeType === 1 || nodeType === 9 || nodeType === 11){
                return elem.textContent
            }
        },
        content(elem, value){
            var nodeType = elem.nodeType
            if(nodeType === 1 || nodeType === 9 || nodeType === 11){
                elem.textContent = value
            }
        },
        getAttr(elem, attr){
            var nodeType = elem.nodeType
            if(nodeType === 1 || nodeType === 9 || nodeType === 11){    
                return window.getComputedStyle(elem).getPropertyValue(attr)
            }
        },
        style(elem, key, value){
            if(!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style){    
                return
            } else {
                elem.style[key] = value
            }
        },
        htmlContent(elem){
            var nodeType = elem.nodeType
            if(nodeType === 1 || nodeType === 9 || nodeType === 11){
                
                return elem.innerHTML
            }
        },
        htmlSet(elem, value){
            var nodeType = elem.nodeType
            if(nodeType === 1 || nodeType === 9 || nodeType === 11){
                elem.innerHTML = value
            }
        },
        queue(elem, type, data){
            var queue
            if(elem){
                type = (type || "fx") + "queue";    //firstqueue
                queue = data_user.get(elem, type)
                if(data){
                    if(!queue){
                        data_user.access(elem, type, jQuery.markArray(data))
                    } else {
                        queue.push(data)
                    }
                }
                return queue
            }
        },
        dequeue(elem, type){
            type = type || "fx"
            var queue = jQuery.queue(elem, type),
                next = function(){
                    jQuery.dequeue(elem, type)
                },
                fn = queue.shift()
                fn.call(elem, next)
        }
    })
    
    //接受参数，支持多个参数传递，将其保存到optionsCache缓存里面
    function createOptions(options){
        var object = optionsCache[options] = {}
        options.split(/\s+/).forEach(value => {
            object[value] = true
        })
        return object
    }

    function Data(){
        this.expando = jQuery.expando + Math.random()
        this.cache = {}
    }

    Data.uid = 1

    //创建缓存及返回
    Data.prototype = {
        //key方法，就是获取查询uid，如果elem里面没有uid，则创建一个uid, this.expando: uid
        //同时在this.cache里面建立一个 uid: {}
        //this.expando 钥匙
        key(elem){
            var descriptor = {},
                unlock = elem[this.expando]
            
            if(!unlock){
                unlock = Data.uid++
                descriptor[this.expando] = {
                    value: unlock
                }
                Object.defineProperties(elem, descriptor)
                /*
                Dom扩展属性，相当于
                    elem = {
                        this.expando: unlock
                    }
                */
            }

            if(!this.cache[unlock]){
                this.cache[unlock] = {}
            }

            return unlock
        },
        get(elem, key){
            //找到或者创建缓存
            var cache = this.cache[this.key(elem)]
            //key 有值直接在缓存中读取
            return key === undefined ? cache : cache[key]
        },
        set(owner, key, value){
            var unlock = this.key(owner),
                cache = this.cache[unlock],
                prop
            if(typeof key === 'string'){
                cache[key] = value
            }
            if(jQuery.isPlainObject(key)){
                for( prop in key ){
                    cache[prop] = key[prop]
                }
            }
        },
        access(owner, key, value){
            this.set(owner, key, value)
            return value !== undefined ? value : key
        }
    }

    //缓存私有对象
    var data_priv = new Data();
    //缓存内部数据
    var data_user = new Data();

    //jQuery 事件模块
    jQuery.event = {
        //1、利用 data_priv 数据缓存，分离事件与数据
        //2、元素与缓存中建立guid的映射关系用于查找
        add(elem, type, handler){
            var eventHandle, events, handlers;

            //返回缓存的数据
            var elemData = data_priv.get(elem)
            
            //handler也就是传进来的回调函数,检测handler是否存在ID(guid)，如果没有传给他一个ID
            //添加ID的目的是用来寻找或者删除对应的时间
            if(!handler.guid){
                handler.guid = jQuery.guid++   //guid == 1
            }

            /*
                给缓存增加事件处理句柄
                elemData = {
                    events: {
                        type: [
                            {
                                type: type,
                                handler: handler,
                                guid: handler.guid
                            }
                            delegateCount: 0
                        ]
                    }
                    handle: function(){
                        
                    }
                }
            */
           //没有改变elemData的指向，只是添加元素，所以会改变data_priv中的元素
            if(!(events = elemData.events)){
                events = elemData.events = {}
            }
            if(!(eventHandle = elemData.handle)){
                eventHandle = elemData.handle = function(){
                    return jQuery.event.dispatch.apply(eventHandle.elem, arguments)
                }
            }
            eventHandle.elem = elem

            if(!(handlers = events[type])){
                handlers = events[type] = []
                handlers.delegateCount = 0  //有多少事件代理默认0
            }
            handlers.push({
                type: type,
                handler: handler,   //回调函数
                guid: handler.guid
            })
            //添加事件
			if (elem.addEventListener) {
				elem.addEventListener(type, eventHandle, false);
            }
        },
        dispatch(event){
            var handlers = (data_priv.get(this, "events") || {})[event.type] || [];
            event.delegateTarge = this

			let args = [].slice.call(arguments);
            jQuery.event.handlers.call( this, handlers, args)
        },

        //执行事件处理函数
		handlers: function( handlers, args) {
			handlers[0].handler.apply(this, args);
        },
        
		special: {
			load: {
				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			focus: {
				// 执行默认focus方法
				trigger: function() {
					if (this !== safeActiveElement() && this.focus) {
						//console.log( this.focus)
						this.focus();
						return false;
					}
				},
				delegateType: "focusin"
			},
			blur: {
				trigger: function() {
					if (this === safeActiveElement() && this.blur) {
						this.blur();
						return false;
					}
				},
				delegateType: "focusout"
			},
			click: {
				// For checkbox, fire native event so checked state will be right
				trigger: function() {
					if (this.type === "checkbox" && this.click && jQuery.nodeName(this, "input")) {
						this.click();
						return false;
					}
				},

				// For cross-browser consistency, don't fire native .click() on links
				_default: function(event) {
					return jQuery.nodeName(event.target, "a");
				}
			},

			beforeunload: {
				postDispatch: function(event) {

					// Support: Firefox 20+
					// Firefox doesn't alert if the returnValue field is not set.
					if (event.result !== undefined) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		},

        //event:  规定指定元素上要触发的事件,可以是自定义事件,或者任何标准事件。
		//data:  传递到事件处理程序的额外参数。
		//elem:  Element对象
        trigger(event, data, elem){
            var i, cur, tmp, handle,
                i = 0,
                eventPath = [elem || document]  //规划冒泡路线
                type = event.type || event,
                cur = tmp = elem = elem || ducument
                //证明是ontype绑定时间
                ontype = /^\w+$/.test(type) && "on" + type

            //模拟事件对象  如果有jQuery.pxpando说明event已经是模拟的时间对象
            event = event[jQuery.expando] ? 
                event: new jQuery.Event(type, typeof event === "object" && event)

            //定义event.target 属性
            if(!event.target){
                event.target = elem
            }
            
            /*
                event = {
                    jQuery101010471700108148818: true,
                    timeStamp: 1562743561074,
                    type: "createEvent",
                    target = elem
                }
            */
            data = data == null ? [event] : jQuery.markArray(data, [event])
            //事件类型是否需要进行特殊化处理    focus
            special = jQuery.event.special[type] || {}

            //如果事件类型已经存在trigger方法，就调用它
            if(special.trigger && special.trigger.apply(elem, data) === false){
                return
            }
            //自己已经在冒泡路线中 不重复添加
            cur = cur.parentNode
            //查找当前元素的父元素，添加到eventPath (规划冒泡路线)数组中
            for(; cur; cur = cur.parentNode){
                eventPath.push(cur)
                tmp = cur
            }

            if(tmp === (elem.ownerDocument || document)){   //当tmp为document时，cur为空， 就退出循环
                eventPath.push(tmp.defaultView || tmp.parentWindow || window)   //模拟冒泡到window对象,defaultView为了兼容Firefox浏览器
            }
            
            while((cur = eventPath[i++])){
                handle = (data_priv.get(cur,"events") || {})[event.type] && data_priv.get(cur, "handle")

                if(handle){
                    handle.apply(cur, data)
                }
            }
        }
    }

    jQuery.Event = function(src, props){
        //创建一个jQuery.Event实例对象
        if(!(this instanceof jQuery.Event)){
            return new jQuery.Event(src, props)
        }
        this.type = src
        this.timeStamp = src && src.timeStamp || jQuery.now()
        this[jQuery.expando] = true
    }

	jQuery.Event.prototype = {
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,
		//取消事件的默认动作
		preventDefault: function() {
			var e = this.originalEvent;

			this.isDefaultPrevented = returnTrue;

			if (e && e.preventDefault) {
				e.preventDefault();
			}
		},
		// 方法阻止事件冒泡到父元素,阻止任何父事件处理程序被执行。
		stopPropagation: function() {
			var e = this.originalEvent;

			this.isPropagationStopped = returnTrue;

			if (e && e.stopPropagation) {
				e.stopPropagation();
			}
		},
		stopImmediatePropagation: function() {
			this.isImmediatePropagationStopped = returnTrue;
			this.stopPropagation();
		}
	};

    jQuery.fn.extend({
        //缓存数据
        data(key, value){
            var _this = this
            return jQuery.access(this, function(key, value){
                if(value === undefined){
                    //get
                    var data = data_user.get(this, key)
                    if (data!==undefined) {
                        return data
                    }
                }

                _this.each(function(){
                    data_user.set(this, key, value)
                })
            }, key, value)
        },
        text(value){//value有值,用set操作，如果没有值，则做get操作
            return jQuery.access(this, function(key, value){
                return value === undefined ? jQuery.text(this) : jQuery.content(this,value)
            }, null, value)//value === undefind || value === String
        },
        css(key, value){//value有值,用set操作，如果没有值，则做get操作
            //key 有可能是string，object，Array
            return jQuery.access(this, function(key, value){
                if(jQuery.isArray(key)){    //获取当前元素所有css样式表
                    return key.map((attr)=>{
                        return jQuery.getAttr(this, attr)
                    })
                }
                return value !== undefined ? jQuery.style(this, key, value) : jQuery.getAttr(this, key)
            }, key, value) //value === undefind || value === String
        },
        html(value){    //value有值,用set操作，如果没有值，则做get操作
            return jQuery.access(this, function(key, value){
                return value === undefined ? jQuery.htmlContent(this) : jQuery.htmlSet(this,value)
            }, null, value) //value === undefind || value === String
        },
        each(callbacks, args){
            return jQuery.each(this, callbacks, args)
        },
        on(types, fn){
            var type;
            if(typeof type === "object"){
                for(type in types){
                    this.on(type, fn)
                }
            }
            return this.each(function(){
                //this指定的是element元素
                jQuery.event.add(this, types, fn)
            })
        },
        trigger(type, data){
            return this.each(function(){
                jQuery.event.trigger(type, data, this)
            })
        },
        addClass(value){
            var len = this.length, cur, j, i = 0
            var proceed = typeof value === "string" && value
            var classes, clazz
            if(proceed){
                classes = value.match(/\S+/g)
                for(; i < len; i++){
                    elem = this[i]
                    cur = elem.nodeType === 1 && elem.className ? `${elem.className} ` : ""
                    if(cur){
                        j = 0
                        while((clazz = classes[j++])){
                            if(cur.indexOf(`${clazz} `) === -1){
                                cur += `${clazz} `
                            }
                        }
                        elem.className = cur
                    }
                }
            }
        }
    })

    //共享原型对象
    jQuery.prototype.init.prototype = jQuery.fn
    root.$ = root.jQuery = jQuery
})(this)