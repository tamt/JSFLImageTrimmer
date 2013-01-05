/**
 * User: itamt@qq.com
 * Date: 12-10-12
 * Time: 下午12:10
 */

/**
 * 裁切當前選中圖片
 * @returns	{Object}						Description
 */
function trimCurrSelectedBitmap(){
    if (fl.getDocumentDOM().selection &&
        fl.getDocumentDOM().selection.length &&
        fl.getDocumentDOM().selection[0].instanceType == "bitmap") {
        var bmp = fl.getDocumentDOM().selection[0];
        var bmpItem = bmp.libraryItem;
        var doc = fl.getDocumentDOM();
        
        var exportPath;
        if(doc.pathURI){
            exportPath = doc.pathURI.slice(0, doc.pathURI.lastIndexOf("/")) + "/tmp.png";
        }else{
            exportPath = fl.scriptURI.slice(0, fl.scriptURI.lastIndexOf("/")) + "/tmp.png";
        }
        
        var isExported = bmpItem.exportToFile(exportPath);
        if (isExported) {
            callSWF("onGetImageBits", exportPath);
        } else {
            alert("导出图片失败");
        }
    } else {
        alert("请先在舞台上选择一张图片");
    }
    
}

/**
 * 自動選擇舞臺當前的圖片, 並裁切圖片
 * @returns	{Object}						Description 
 */
function autoTrimBitmap(){
    fl.getDocumentDOM().selectNone();
    
    var currentLayer = fl.getDocumentDOM().getTimeline().currentLayer;
    var currentFrame = fl.getDocumentDOM().getTimeline().currentFrame;
    var frame = fl.getDocumentDOM().getTimeline().layers[currentLayer].frames[currentFrame];
    var elements = frame.elements;
    
    for(var i=0; i<elements.length; i++){
        var element = elements[i];
        if(element.elementType == "instance" && element.instanceType == "bitmap"){
            element.selected = true;
            trimCurrSelectedBitmap();
            break;
        }
    }
    
    if(i == elements.length){
        fl.trace("第" + frame + "幀中沒有找到圖片.");
    }
}

/**
 * 定位到下一幀
 * @returns	{Object}						Description
 */
function nextFrame(){
    fl.getDocumentDOM().getTimeline().currentFrame += 1;
}

/**
 * 定位到上一幀
 * @returns	{Object}						Description
 */
function prevFrame(){
    fl.getDocumentDOM().getTimeline().currentFrame -= 1;
}

var timer;
var action;

/**
 * 自動裁切當前時間軸內每一幀的圖片
 * @returns	{Object}						Description
 */
function trimeTimelineBitmap(){
    //如果運行中...直接返回.
    if(timer)return;
    
    //開始:每1秒進行一次裁切操作.
    action = 0;
    timer = addTimerListener(function(){
        if(action%2 == 0){
            var currentLayer = fl.getDocumentDOM().getTimeline().currentLayer;
            var currentFrame = fl.getDocumentDOM().getTimeline().currentFrame;
            var frame = fl.getDocumentDOM().getTimeline().layers[currentLayer].frames[currentFrame];
            if(frame.startFrame == currentFrame){
                autoTrimBitmap();
            }
            
            var timeline = fl.getDocumentDOM().getTimeline();
            if(timeline.currentFrame>=timeline.frameCount-1){
                stopTrimTimeline();
            }
        }else{
            fl.getDocumentDOM().getTimeline().currentFrame += 1;
        }
        
        action++;
    }, 1000)
}

/**
 * 停止自動裁切當前時間軸
 * @returns	{Object}						Description 
 */
function stopTrimTimeline(){
    clearTimerListener(timer);
    timer = 0;
}

/**
 * 调用swf面板的方法
 * @param arg
 */
function callSWF(method, param) {
    if (fl.swfPanels.length > 0) {
        for (x = 0; x < fl.swfPanels.length; x++) {
            if (fl.swfPanels[x].name == "JSFLImageTrimmer") {
                fl.swfPanels[x].call(method, param);
                break;
            }
        }
    }
    else {
        fl.trace("no panels");
    }
}

var fixPosition = false;
/**
 * 设置是否对图片位置"取整"
 * @param	{Boolean}       fixed					Description
 * @returns	{Object}						Description
 */
function setFixPosition(fixed){
    fixPosition = fixed;
}


/**
 * 裁切当前舞台选中的图片
 * @param	{Rectangle}		rect			图片非透明区域(相对于图片坐标)
 */
function trim(rect) {
    var params = rect.split(",");
    var trim_x = Number(params[0]);
    var trim_y = Number(params[1]);
    var trim_w = Number(params[2]);
    var trim_h = Number(params[3]);

    if (fl.getDocumentDOM().selection &&
        fl.getDocumentDOM().selection.length &&
        fl.getDocumentDOM().selection[0].instanceType == "bitmap") {
        var bmp = fl.getDocumentDOM().selection[0];
        
        //處理偏移
        var offsetX = bmp.x - Math.ceil(bmp.x);
        var offsetY = bmp.y - Math.ceil(bmp.y);
        bmp.x = Math.ceil(bmp.x)
        bmp.y = Math.ceil(bmp.y)
        
        var doc = fl.getDocumentDOM();
        doc.group();
        doc.enterEditMode('inPlace');
        doc.selectAll();
        
        var selectionRect = doc.getSelectionRect();
        
        selectionRect.left += doc.viewMatrix.tx;
        selectionRect.top += doc.viewMatrix.ty;
        selectionRect.right += doc.viewMatrix.tx;
        selectionRect.bottom += doc.viewMatrix.ty;
        
        //drawRect(selectionRect);
        
        var trimRect = {
            left:   selectionRect.left + trim_x,
            top:    selectionRect.top + trim_y,
            right:  selectionRect.left + trim_x + trim_w,
            bottom: selectionRect.top + trim_y + trim_h
        }
        
        //drawRect(trimRect)
        
        doc.breakApart();
        doc.selectNone();
        doc.setSelectionRect(trimRect);
        doc.group();
        //转化为图片
        doc.convertSelectionToBitmap();

        //反选
        old_selection = doc.selection;
        doc.selectAll();
        for (n = 0; n < old_selection.length; n++)
            old_selection[n].selected = false;
        doc.deleteSelection();        
        
        //退出编辑模式
        doc.exitEditMode();
        doc.unGroup();
        
        //處理偏移
        bmp = fl.getDocumentDOM().selection[0];
        bmp.x += offsetX;
        bmp.y += offsetY;
        
        //是否取整位置
        if(fixPosition){
            bmp.x = Math.round(bmp.x);
            bmp.y = Math.round(bmp.y);
        }
    } else {
        alert("请先在舞台上选择一张图片");
    }
}

/**
 * 繪製一個矩形
 * @param	{Rectangle}		rect			矩形參數:left, top, 
 */
function drawRect(rect){
    fl.getDocumentDOM().addNewRectangle(rect, 0, true);
}


///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
////實現計時器/////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

var timerListeners = [];
var timerListenerNum = 0;

/**
 * 添加一個定時回調的方法
 * @param       {Function}              listener                        要定時回調的方法
 * @param       {Number}                delay                           時間(毫秒)
 * @returns	{Object}						Description 
 */
function addTimerListener(listener, delay){
    var id = new Date().getTime();
    timerListeners.push({
        id:id,
        callback:listener,
        delay:delay,
        _tickTime:0
    });
    return id;
}

/**
 * 刪除定時回調
 * @param	{Object}		id				addTimerListener時給的id
 * @returns	{Object}						Description 
 */
function clearTimerListener(id){
    for(var i=0; i<timerListeners.length; i++){
        var listener = timerListeners[i];
        if(listener.id == id){
            timerListeners.splice(i--, 1);
        }
    }
}

/**
 * AS3模擬計時器, 每隔1秒鐘調用tick方法.
 * @returns	{Object}						Description
 */
function tick(){
    var time = new Date().getTime();
        
    for(var i=0; i<timerListeners.length; i++){
        var listener = timerListeners[i];
        if(time - listener._tickTime >= listener.delay){
            listener._tickTime = time;
            listener.callback();
        }
    }
}