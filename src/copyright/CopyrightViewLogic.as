/**
 * User: tamt
 * Date: 12-10-22
 * Time: 上午11:53
 */
package copyright {
import flash.display.DisplayObject;
import flash.display.Sprite;
import flash.events.ContextMenuEvent;
import flash.events.Event;
import flash.net.URLRequest;
import flash.net.navigateToURL;
import flash.ui.ContextMenu;
import flash.ui.ContextMenuItem;

/**
 * "著作權"視圖
 */
public class CopyrightViewLogic {
    var ctm:ContextMenu;
    var menuItem:ContextMenuItem;

    public function CopyrightViewLogic(root:DisplayObject) {

        menuItem = new ContextMenuItem("@tamt", true, true, true);
        menuItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, onSelectItem)

        if (root.stage) {
            (root.root as Sprite).contextMenu.customItems.push(menuItem);
        } else {
            root.addEventListener(Event.ADDED_TO_STAGE, onAdded);
        }
    }

    private function onAdded(event:Event):void {
        (event.target.root as Sprite).contextMenu.customItems.push(menuItem);
    }

    public function destroy():void {

    }

    private function onSelectItem(event:ContextMenuEvent):void {
        navigateToURL(new URLRequest("http://www.weibo.com/tamt"));
    }


}
}
