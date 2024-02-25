//=============================================================================
// Save File Extras
//=============================================================================

/*:
 * @plugindesc v1.07 Show extra information in the save screen,
 * including location, level, and gold.
 * Options to hide information you don't want to see (information is still saved in savegame.)
 * Configure colors and positions.
 * $Amuseum_SaveFileExtras
 * @author Amuseum
 *
 * @param Show Location
 * @desc Show location?
 * true | false
 * @default true
 *
 * @param Location Color
 * @desc Location text color
 * Use system colors 0 - 31
 * @default 0
 *
 * @param Location X
 * @desc Location X position
 * Default: this.width / 2
 * @default this.width / 2
 *
 * @param Location Y
 * @desc Location Y position
 * Default: rect.y + lineHeight
 * @default rect.y + lineHeight
 *
 * @param Show Level
 * @desc Show levels?
 * true | false
 * @default true
 *
 * @param Level Color
 * @desc Level text color
 * Use system colors 0 - 31
 * @default 0
 *
 * @param Level X
 * @desc Level X position
 * Default: this.width / 2
 * @default this.width / 2
 *
 * @param Level Y
 * @desc Level Y position
 * Default: rect.y + lineHeight * 2
 * @default rect.y + lineHeight * 2
 *
 * @param Show Gold
 * @desc Show gold?
 * true | false
 * @default true
 *
 * @param Gold Color
 * @desc Gold text color
 * Use system colors 0 - 31
 * @default 6
 *
 * @param Gold X
 * @desc Gold X position
 * Default: this.width * 0.66
 * @default this.width * 0.66
 *
 * @param Gold Y
 * @desc Gold Y position
 * Default: rect.y + lineHeight * 2
 * @default rect.y + lineHeight * 2
 *
 * @param Show Title
 * @desc Show title?
 * true | false
 * @default true
 *
 * @param Title Color
 * @desc Title text color
 * Use system colors 0 - 31
 * @default 0
 *
 * @param Title X
 * @desc Title X position
 * Default: this.width / 2
 * @default this.width / 2
 *
 * @param Title Y
 * @desc Title Y position
 * Default: rect.y
 * @default rect.y
 *
 * @param Show Playtime
 * @desc Show playtime?
 * true | false
 * @default true
 *
 * @param Playtime Color
 * @desc Playtime text color
 * Use system colors 0 - 31
 * @default 0
 *
 * @param Playtime X
 * @desc Playtime X position
 * Default: 0
 * @default 0
 *
 * @param Playtime Y
 * @desc Playtime Y position
 * Default: rect.y + lineHeight * 2
 * @default rect.y + lineHeight * 2
 *
 * @param Show Characters
 * @desc Show characters?
 * true | false
 * @default true
 *
 * @param Characters X
 * @desc Characters X position
 * Default: rect.x + 220
 * @default rect.x + 220
 *
 * @param Characters Y
 * @desc Characters Y position
 * Default: rect.y + rect.height - 4
 * @default rect.y + rect.height - 4
 *
 * @param Show Faces
 * @desc Show faces?
 * true | false  (true overrides Show Characters)
 * @default false
 *
 * @param Faces X
 * @desc Faces X position
 * Default: rect.x + 192
 * @default rect.x + 192
 *
 * @param Faces Y
 * @desc Faces Y position
 * Default: rect.y + faceHeight
 * @default rect.y + faceHeight
 *
 * @param Face Margin
 * @desc Distance between faces
 * Scaling factor (1.0 means show 100% of each face)
 * @default 0.66
 *
 * @param Show Reserve Members
 * @desc Show members not in main party?
 * true | false
 * @default false
 *
 * @param Show File Id
 * @desc Show save game id?
 * true | false
 * @default true
 *
 * @param File Id Color
 * @desc File Id text color
 * Use system colors 0 - 31
 * @default 0
 *
 * @param File Id X
 * @desc File Id X position
 * Default: rect.x
 * @default rect.x
 *
 * @param File Id Y
 * @desc File Id Y position
 * Default: rect.y
 * @default rect.y

 * @help
 * While playing the game, save the game.
 * At the title screen, load a game. You should see additional information for
 * the location, the first character's level, and the party's gold
 * at the time the game was saved.
 *
 * Options in the plugins manager:
 * Show specific information. true or false.
 * Configure text colors. Use system colors 0 - 31.
 * Position each element. Should be a number or expression that returns a number.
 *
 * This plugin does not provide plugin commands.
 */

(function() {
	var parameters = $plugins.filter(function(p) { return p.description.contains('$Amuseum_SaveFileExtras'); })[0].parameters;

	var showLocation = eval(parameters['Show Location']);
	var locationColor = Number(parameters['Location Color']);
	var locationX = String(parameters['Location X']);
	var locationY = String(parameters['Location Y']);

	var showLevel = eval(parameters['Show Level']);
	var levelColor = Number(parameters['Level Color']);
	var levelX = String(parameters['Level X']);
	var levelY = String(parameters['Level Y']);

	var showGold = eval(parameters['Show Gold']);
	var goldColor = Number(parameters['Gold Color']);
	var goldX = String(parameters['Gold X']);
	var goldY = String(parameters['Gold Y']);

	var showTitle = eval(parameters['Show Title']);
	var titleColor = Number(parameters['Title Color']);
	var titleX = String(parameters['Title X']);
	var titleY = String(parameters['Title Y']);

	var showPlaytime = eval(parameters['Show Playtime']);
	var playtimeColor = Number(parameters['Playtime Color']);
	var playtimeX = String(parameters['Playtime X']);
	var playtimeY = String(parameters['Playtime Y']);

	var showCharacters = eval(parameters['Show Characters']);
	var charactersX = String(parameters['Characters X']);
	var charactersY = String(parameters['Characters Y']);

	var showFaces = eval(parameters['Show Faces']);
	var facesX = String(parameters['Faces X']);
	var facesY = String(parameters['Faces Y']);
	var faceMargin = Number(parameters['Face Margin']);

	var showReserve = eval(parameters['Show Reserve Members']);

	var showFileId = eval(parameters['Show File Id']);
	var fileIdColor = Number(parameters['File Id Color']);
	var fileIdX = String(parameters['File Id X']);
	var fileIdY = String(parameters['File Id Y']);

	// Amuseum hook functions start
	var maxBattleMembers = Game_Party.prototype.maxBattleMembers;

	var oldMakeSavefileInfo = DataManager.makeSavefileInfo;
	DataManager.makeSavefileInfo = function() {
		var info = oldMakeSavefileInfo.call(this);
		info.location = $dataMap.displayName != "" ? $dataMap.displayName : $dataMapInfos[$gameMap.mapId()].name;
		info.level = $gameParty.members()[0].level;
		info.gold = $gameParty.gold();
		info.fileId = this._lastAccessedId;
		return info;
	};
	// Amuseum hook functions end

	// Amuseum replace functions start
	Window_SavefileList.prototype.drawContents = function(info, rect, valid) {
		// Amuseum edit start
		var lineHeight = this.lineHeight();
		var faceScale = this.itemHeight() / Window_Base._faceHeight;
		var faceHeight = this.itemHeight();
		var faceWidth = faceScale * Window_Base._faceWidth;
		if (valid) {
			if (showFaces) {
				this.drawPartyFaces(info, eval(facesX), eval(facesY), faceWidth, faceHeight);
			} else if (showCharacters) {
				this.drawPartyCharacters(info, eval(charactersX), eval(charactersY));
			}
		}
		if (showFileId) {
			this.changeTextColor(this.textColor(fileIdColor));
			this.drawFileId(info.fileId || '', eval(fileIdX), eval(fileIdY), rect.width);
			this.resetTextColor();
		}
		if (showTitle) {
			this.changeTextColor(this.textColor(titleColor));
			this.drawGameTitle(info, eval(titleX), eval(titleY), rect.width);
			this.resetTextColor();
		}
		if (showLocation) {
			this.changeTextColor(this.textColor(locationColor));
			this.drawLocation(info, eval(locationX), eval(locationY), rect.width);
			this.resetTextColor();
		}
		if (showLevel) {
			this.changeTextColor(this.textColor(levelColor));
			this.drawLevel(info, eval(levelX), eval(levelY), rect.width);
			this.resetTextColor();
		}
		if (showGold) {
			this.changeTextColor(this.textColor(goldColor));
			this.drawGold(info, eval(goldX), eval(goldY), rect.width);
			this.resetTextColor();
		}
		if (showPlaytime) {
			this.changeTextColor(this.textColor(playtimeColor));
			this.drawPlaytime(info, eval(playtimeX), eval(playtimeY), rect.width);
			this.resetTextColor();
		}
		// Amuseum edit end
	};

	Game_Party.prototype.charactersForSavefile = function() {
		return this.allMembers().map(function(actor) {
			return [actor.characterName(), actor.characterIndex()];
				});
	};

	Game_Party.prototype.facesForSavefile = function() {
		return this.allMembers().map(function(actor) {
			return [actor.faceName(), actor.faceIndex()];
				});
	};

	Window_SavefileList.prototype.drawPartyCharacters = function(info, x, y) {
		if (info.characters) {
		var numMembers = showReserve ? info.characters.length : maxBattleMembers();
		for (var i = 0, data; i < numMembers && (data=info.characters[i]); i++) {
			this.drawCharacter(data[0], data[1], x + i * 48, y);
			}
		}
	};

	Window_SavefileList.prototype.drawFileId = function(id, x, y, width) {
		if (showFileId) {
			this.drawText(TextManager.file + ' ' + id, x, y, width);
		}
	};
	// Amuseum replace functions end

	// Amuseum new functions start
	Window_SavefileList.prototype.drawLocation = function(info, x, y, width) {
		if (info.location) {
			this.drawText(info.location, x, y, width);
		}
	};

	Window_SavefileList.prototype.drawLevel = function(info, x, y, width) {
		if (info.level) {
			this.drawText(TextManager.levelA + " " + info.level, x, y, width);
		}
	};

	Window_SavefileList.prototype.drawGold = function(info, x, y, width) {
		if (info.gold) {
			this.drawText(info.gold + " " + TextManager.currencyUnit, x, y, width);
		}
	};

	Window_SavefileList.prototype.drawPartyFaces = function(info, x, y, width, height) {
		if (info.faces) {
			var numMembers = showReserve ? info.faces.length : maxBattleMembers();
			width = width || Window_Base._faceWidth;
			height = height || Window_Base._faceHeight;
			for (var i = 0, data; i < numMembers && (data=info.faces[i]); i++) {
				this.drawFace(data[0], data[1], x + i * width * faceMargin, y - height, width, height);
			}
		}
	};
	// Amuseum new functions end

})();
