package com.lbynet.util {
import flash.net.SharedObject;
import flash.utils.Proxy;
import flash.utils.flash_proxy;

/**
 * Cookie
 * @author Kinglong(kinglong@gmail.com)
 * @since:2010-10-7
 */

public class Cookie extends Proxy {
    public static const PREFIX:String = "_";
    public var _timeout:uint;
    public var _name:String;
    public static var _so:SharedObject;
    private static var instance:Cookie;

    public function Cookie(name:String = null) {
        _name = name ? name : 'firstedLogin';
        _timeout = 60 * 60 * 12;
        _so = SharedObject.getLocal('firstedLogin', "/");
        removeTimeout();
    }

    public static function getInstance():Cookie {
        if (instance == null) {
            new Cookie();
        }
        return instance;
    }

    /**
     * 超时
     */
    public function get timeout():uint {
        return _timeout;
    }

    /**
     * 名称
     */
    public function get name():String {
        return _name;
    }

    /**
     * 等同于get方法
     */
    override flash_proxy function getProperty(name:*):* {
        return get(getLocalName(name));
    }

    /**
     * 等同于put方法
     */
    override flash_proxy function setProperty(name:*, value:*):void {
        var key:String = getLocalName(name);
        put(key, value);
    }

    /**
     * 清除所有内容
     */
    public static function removeAll():void {
        _so.clear();
    }

    /**
     * 清除Cookie值
     */
    public static function remove(key:String):* {
        var result:Object = get(key);
        if (result != null) {
            delete _so.data["cookie"][PREFIX + key];
            _so.flush();
        }
        return result;
    }

    /**
     * 添加Cookie值
     */
    public static function put(key:String, value:*):* {
        var today:Date = new Date();
        var cookie:Object = isNullOrUndefined(_so.data["cookie"]) ? new Object() : _so.data["cookie"];
        var result:Object = get(key);
        cookie[PREFIX + key] = {time:today.getTime(), value:value};
        _so.data["cookie"] = cookie;
        _so.flush();
        return result;
    }

    /**
     * 获取Cookie值
     */
    public static function get(key:String):* {
        return contains(key) ? _so.data["cookie"][PREFIX + key]["value"] : null;
    }

    /**
     * Cookie是否存在
     */
    public static function contains(key:String):Boolean {
        return !(isNullOrUndefined(_so.data["cookie"]) || isNullOrUndefined(_so.data["cookie"][PREFIX + key]) || _so.data["cookie"][PREFIX + key]["value"] == undefined);
    }

    private function getLocalName(name:*):String {
        if (name is QName) {
            return QName(name).localName;
        }
        return String(name);
    }

    /**
     * 是否为空值或未定义值
     */
    private static function isNullOrUndefined(data:*):Boolean {
        return data == undefined || data == null;
    }

    /**
     * 是否超时
     */
    private function isTimeout(time:Number):Boolean {
        var today:Date = new Date();
        return time + _timeout * 1000 < today.getTime();
    }

    /**
     * 清除超时内容
     */
    private function removeTimeout():void {
        var cookie:Object = _so.data["cookie"];
        if (isNullOrUndefined(cookie)) {
            return;
        }
        for (var key:String in cookie) {
            if (isNullOrUndefined(cookie[key]) || isNullOrUndefined(cookie[key]["time"]) || isTimeout(cookie[key]["time"])) {
                delete cookie[key];
            }
        }
        _so.data["cookie"] = cookie;
        _so.flush();
    }
}
}