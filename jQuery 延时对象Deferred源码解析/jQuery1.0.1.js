(function(root){
    var optionsCache = {}
    var _ = {
        callbacks: function(options){
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
    }

    //接受参数，支持多个参数传递，将其保存到optionsCache缓存里面
    function createOptions(options){
        var object = optionsCache[options] = {}
        options.split(/\s+/).forEach(value => {
            object[value] = true
        })
        return object
    }

    root._ = _
})(this)