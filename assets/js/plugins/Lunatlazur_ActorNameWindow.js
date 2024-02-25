//=============================================================================
// Lunatlazur_ActorNameWindow.js
// ----------------------------------------------------------------------------
// Copyright (c) 2018 Taku Aoi
// This plugin is released under the zlib License.
// https://zlib.net/zlib_license.html
// ----------------------------------------------------------------------------
// Version
// 1.1.0 2020-01-22
// ----------------------------------------------------------------------------
// [Web]    : https://lunatlazur.com
// [Twitter]: https://twitter.com/aoitaku
// [GitHub] : https://github.com/lunatlazur
//=============================================================================
/*:
 * @plugindesc Show actor name window
 * @author Taku Aoi
 * @help This plugin shows speaker's name window.
 *
 * Input the character name with \N<Character name> format
 * to display the speaker's name window.
 *
 * The same font as the message window is used for this window.
 *
 * Usage
 * =====
 *
 * This plugin has no plugin command.
 *
 *
 * Changelog
 * =========
 *
 * 1.1.0 2020-01-22
 * ----------------
 * - Added option to specify horizontal position of name window.
 * - Fixed the name not being displayed correctly on the backlog
 *   when using the backlog plugin.
 *
 * 1.0.1 2019-09-09
 * ----------------
 * - Fixed that the name window was not displayed correctly when
 *   the display position of the message window was not at the bottom.
 *
 * 1.0.0 2018-04-01
 * ----------------
 * - Published.
 *
 *
 * @param textColor
 * @desc Text color index for actor name window.
 * @type number
 * @default 1
 *
 * @param horizontalPosition
 * @desc Horizontal position for actor name window.
 * @type number
 * @default 0
 */
/*:ja
 * @plugindesc 会話キャラクター名表示ウィンドウプラグイン
 * @author あおいたく
 * @help このプラグインは名前ウィンドウを表示できるようにします。
 *
 * `\N<キャラクター名>` 形式でメッセージ内にキャラクターの名前を記述することで
 * メッセージウィンドウの上部に名前ウィンドウを表示するようになります。
 *
 * 名前ウィンドウのフォントはメッセージウィンドウのものが使われます。
 *
 * 使い方
 * ======
 *
 * このプラグインにプラグインコマンドはありません。
 *
 *
 * 変更履歴
 * ========
 *
 * 1.1.0 2020-01-22
 * ----------------
 * - 名前ウインドウの水平位置を指定するオプションを追加
 * - バックログプラグイン利用時、バックログ上で名前が正しく表示されないのを修正
 *
 * 1.0.1 2019-09-09
 * ----------------
 * - メッセージウインドウの表示位置が下以外のときに、名前ウィンドウが正しく表示
 *   されないのを修正
 *
 * 1.0.0 2018-04-01
 * ----------------
 * - 公開
 *
 *
 * @param テキストカラー
 * @desc 名前を表示するテキストの色番号を指定します。
 * @type number
 * @default 1
 *
 * @param 水平位置
 * @desc 名前を表示するウインドウの水平位置を画面左端からのpx単位で指定します。
 * @type number
 * @default 0
 */
(function () {
    'use strict';

    const pluginName = 'Lunatlazur_ActorNameWindow';
    function getValue(params, ...names) {
        let found = null;
        names.forEach((name) => {
            if (!!params[name]) {
                found = params[name];
            }
        });
        return found;
    }
    function asNumber(params, ...names) {
        return parseInt(getValue(params, ...names), 10);
    }
    const parameters = PluginManager.parameters(pluginName);
    const params = {
        textColor: asNumber(parameters, 'テキストカラー', 'textColor'),
        horizontalPosition: asNumber(parameters, '水平位置', 'horizontalPosition'),
    };
    class Window_ActorName extends Window_Base {
        constructor(_) {
            super();
            this.initialize.apply(this, arguments);
        }
        initialize(parentWindow) {
            this._parentWindow = parentWindow;
            const x = params.horizontalPosition || 0;
            super.initialize(x, 0, 240, this.windowHeight());
            this._padding = 4;
            this._text = '';
            this._openness = 0;
            this.deactivate();
            this.hide();
        }
        standardFontFace() {
            if (this._parentWindow) {
                return this._parentWindow.standardFontFace();
            }
            else {
                return super.standardFontFace();
            }
        }
        windowWidth() {
            this.resetFontSettings();
            return Math.ceil(this.textWidth(this._text) + this.padding * 2 + this.standardPadding() * 4);
        }
        windowHeight() {
            return this.lineHeight() + this.padding * 2;
        }
        contentsWidth() {
            return this.width - this.padding * 2;
        }
        contentsHeight() {
            return this.lineHeight();
        }
        update() {
            super.update();
            if (this.active || this.isClosed() || this.isClosing()) {
                return;
            }
            if (this._parentWindow.isClosing()) {
                this._openness = this._parentWindow.openness;
            }
            this.close();
        }
        setText(text) {
            this._text = text;
            this.refresh();
        }
        refresh() {
            this.width = this.windowWidth();
            this.createContents();
            this.contents.clear();
            this.resetFontSettings();
            this.changeTextColor(this.textColor(params.textColor));
            this.drawText(this._text, this.standardPadding() * 2, 0, this.contents.width);
        }
        updatePlacement() {
            if (this._parentWindow.y === 0) {
                this.y = this._parentWindow.y + this._parentWindow.windowHeight();
            }
            else {
                this.y = this._parentWindow.y - this.windowHeight();
            }
        }
        updateBackground() {
            this.setBackgroundType(this._parentWindow._background);
        }
        processActorName(text) {
            this.setText('');
            return text.replace(/\x1bN\<(.*?)\>/gi, (whole, ...args) => {
                this.setText(args[0]);
                this.show();
                this.open();
                this.activate();
                return '';
            });
        }
    }
    const Window_Message_createSubWindows = Window_Message.prototype.createSubWindows;
    Window_Message.prototype.createSubWindows = function () {
        Window_Message_createSubWindows.call(this);
        this._nameWindow = new Window_ActorName(this);
    };
    const Window_Message_subWindows = Window_Message.prototype.subWindows;
    Window_Message.prototype.subWindows = function () {
        return [...Window_Message_subWindows.call(this), this._nameWindow];
    };
    const Window_Message_startMessage = Window_Message.prototype.startMessage;
    Window_Message.prototype.startMessage = function () {
        this._nameWindow.deactivate();
        Window_Message_startMessage.call(this);
    };
    const Window_Message_terminateMessage = Window_Message.prototype.terminateMessage;
    Window_Message.prototype.terminateMessage = function () {
        this._nameWindow.deactivate();
        Window_Message_terminateMessage.call(this);
    };
    Window_Message.prototype.convertEscapeCharacters = function (text) {
        text = Window_Base.prototype.convertEscapeCharacters.call(this, text);
        text = this._nameWindow.processActorName(text);
        return text;
    };
    const Window_Message_updatePlacement = Window_Message.prototype.updatePlacement;
    Window_Message.prototype.updatePlacement = function () {
        Window_Message_updatePlacement.call(this);
        if (this._nameWindow.active) {
            this._nameWindow.updatePlacement();
        }
    };
    const Window_Message_updateBackground = Window_Message.prototype.updateBackground;
    Window_Message.prototype.updateBackground = function () {
        Window_Message_updateBackground.call(this);
        if (this._nameWindow.active) {
            this._nameWindow.updateBackground();
        }
    };

}());
