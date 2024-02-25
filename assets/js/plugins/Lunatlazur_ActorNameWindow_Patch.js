//=============================================================================
// Lunatlazur_ActorNameWindow_Patch.js
//
// ----------------------------------------------------------------------------
// by ecf5DTTzl6h6lJj02
// 2022/11/07
// ----------------------------------------------------------------------------
// Copyright (C) 202X ecf5DTTzl6h6lJj02
//	This software is released under the MIT lisence.
//	http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 用語辞典と会話キャラ名表示ウィンドウを併用した時の不具合修正
 * @author ecf5DTTzl6h6lJj02
 *
 *
 * @help
 * あおいたく様作の会話キャラクター名表示ウィンドウプラグインと
 * トリアコンタン様作のゲーム内用語辞典を併用した際に、
 * 会話キャラクター名表示ウィンドウに名前が表示されなくなる不具合の
 * 修正用パッチです。
 */

(() => {
    'use strict'

    const Window_Message_startMessage = Window_Message.prototype.startMessage;
    Window_Message.prototype.startMessage = function () {
        this._nameWindow.deactivate();
        Window_Message_startMessage.call(this);
        this._textState.text = this._nameWindow.processActorName(this._textState.text);
        if (this._nameWindow.active) {
            this._nameWindow.updatePlacement();
        }
    };

    Window_Message.prototype.convertEscapeCharacters = function(text) {
        text = Window_Base.prototype.convertEscapeCharacters.call(this, text);
        return text;
    };
})();