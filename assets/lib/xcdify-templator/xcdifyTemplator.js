(function (angular) {
    'use strict';

    return angular.module("xcdify-templator", [])

    .constant("templatorConfig", {
        columns: 12,
        pushing: true,
        floating: true,
        swapping: false,
        width: "auto",
        colWidth: "auto",
        rowHeight: "match",
        margins: [30, 30],
        isMobile: false, 
		mobileBreakPoint: 600, 
		mobileModeEnabled: true,
        outerMargin: true,
        minColumns: true,
        minRows: true,
        maxRows: 100,
        defaultSizeX: 2,
        defaultSizeY: 1,
        minSizeX: 1,
        maxSizeX: null,
        minSizeY: 1,
        maxSizeY: null,
        saveGridItemCalculatedHeightInMobile: false
    })

    .controller('templatorCtrl', ['templatorConfig', '$timeout',
		function(templatorConfig, $timeout) {

			var templator = this;

			angular.extend(this, templatorConfig);

			var flag = false;
			this.layoutChanged = function() {
				if (flag) {
					return;
				}
				flag = true;
				$timeout(function() {
					flag = false;
					if (templator.loaded) {
						templator.floatItemsUp();
					}
					templator.updateHeight(templator.movingItem ? templator.movingItem.sizeY : 0);
				}, 30);
			};

			this.grid = [];

			this.destroy = function() {
				if (this.grid) {
					this.grid = [];
				}
				this.$element = null;
			};

			this.setOptions = function(options) {
				if (!options) {
					return;
				}

				options = angular.extend({}, options);

				angular.extend(this, options);

				if (!this.margins || this.margins.length !== 2) {
					this.margins = [0, 0];
				} else {
					for (var x = 0, l = this.margins.length; x < l; ++x) {
						this.margins[x] = parseInt(this.margins[x], 10);
						if (isNaN(this.margins[x])) {
							this.margins[x] = 0;
						}
					}
				}
			};

			this.canItemOccupy = function(item, row, column) {
				return row > -1 && column > -1 && item.sizeX + column <= this.columns && item.sizeY + row <= this.maxRows;
			};

			this.autoSetItemPosition = function(item) {
				// walk through each row and column looking for a place it will fit
				for (var rowIndex = 0; rowIndex < this.maxRows; ++rowIndex) {
					for (var colIndex = 0; colIndex < this.columns; ++colIndex) {
						// only insert if position is not already taken and it can fit
						var items = this.getItems(rowIndex, colIndex, item.sizeX, item.sizeY, item);
						if (items.length === 0 && this.canItemOccupy(item, rowIndex, colIndex)) {
							this.putItem(item, rowIndex, colIndex);
							return;
						}
					}
				}
				throw new Error('Unable to place item!');
			};

			this.getItems = function(row, column, sizeX, sizeY, excludeItems) {
				var items = [];
				if (!sizeX || !sizeY) {
					sizeX = sizeY = 1;
				}
				if (excludeItems && !(excludeItems instanceof Array)) {
					excludeItems = [excludeItems];
				}
				for (var h = 0; h < sizeY; ++h) {
					for (var w = 0; w < sizeX; ++w) {
						var item = this.getItem(row + h, column + w, excludeItems);
						if (item && (!excludeItems || excludeItems.indexOf(item) === -1) && items.indexOf(item) === -1) {
							items.push(item);
						}
					}
				}
				this.itemData = items;
				return items;
			};

			this.getComponents = function() {
				console.log(this.itemData)
				var components = [];
				return components;
			};

			this.getBoundingBox = function(items) {

				if (items.length === 0) {
					return null;
				}
				if (items.length === 1) {
					return {
						row: items[0].row,
						col: items[0].col,
						sizeY: items[0].sizeY,
						sizeX: items[0].sizeX
					};
				}

				var maxRow = 0;
				var maxCol = 0;
				var minRow = 9999;
				var minCol = 9999;

				for (var i = 0, l = items.length; i < l; ++i) {
					var item = items[i];
					minRow = Math.min(item.row, minRow);
					minCol = Math.min(item.col, minCol);
					maxRow = Math.max(item.row + item.sizeY, maxRow);
					maxCol = Math.max(item.col + item.sizeX, maxCol);
				}

				return {
					row: minRow,
					col: minCol,
					sizeY: maxRow - minRow,
					sizeX: maxCol - minCol
				};
			};

			this.removeItem = function(item) {
				for (var rowIndex = 0, l = this.grid.length; rowIndex < l; ++rowIndex) {
					var columns = this.grid[rowIndex];
					if (!columns) {
						continue;
					}
					var index = columns.indexOf(item);
					if (index !== -1) {
						columns[index] = null;
						break;
					}
				}
				this.layoutChanged();
			};

			this.getItem = function(row, column, excludeItems) {
				if (excludeItems && !(excludeItems instanceof Array)) {
					excludeItems = [excludeItems];
				}
				var sizeY = 1;
				while (row > -1) {
					var sizeX = 1,
						col = column;
					while (col > -1) {
						var items = this.grid[row];
						if (items) {
							var item = items[col];
							if (item && (!excludeItems || excludeItems.indexOf(item) === -1) && item.sizeX >= sizeX && item.sizeY >= sizeY) {
								return item;
							}
						}
						++sizeX;
						--col;
					}
					--row;
					++sizeY;
				}
				return null;
			};

			this.putItems = function(items) {
				for (var i = 0, l = items.length; i < l; ++i) {
					this.putItem(items[i]);
				}
			};

			this.putItem = function(item, row, column, ignoreItems) {
				// auto place item if no row specified
				if (typeof row === 'undefined' || row === null) {
					row = item.row;
					column = item.col;
					if (typeof row === 'undefined' || row === null) {
						this.autoSetItemPosition(item);
						return;
					}
				}

				// keep item within allowed bounds
				if (!this.canItemOccupy(item, row, column)) {
					column = Math.min(this.columns - item.sizeX, Math.max(0, column));
					row = Math.min(this.maxRows - item.sizeY, Math.max(0, row));
				}

				// check if item is already in grid
				if (item.oldRow !== null && typeof item.oldRow !== 'undefined') {
					var samePosition = item.oldRow === row && item.oldColumn === column;
					var inGrid = this.grid[row] && this.grid[row][column] === item;
					if (samePosition && inGrid) {
						item.row = row;
						item.col = column;
						return;
					} else {
						// remove from old position
						var oldRow = this.grid[item.oldRow];
						if (oldRow && oldRow[item.oldColumn] === item) {
							delete oldRow[item.oldColumn];
						}
					}
				}

				item.oldRow = item.row = row;
				item.oldColumn = item.col = column;

				this.moveOverlappingItems(item, ignoreItems);

				if (!this.grid[row]) {
					this.grid[row] = [];
				}
				this.grid[row][column] = item;

				if (this.movingItem === item) {
					this.floatItemUp(item);
				}
				this.layoutChanged();
			};

			this.swapItems = function(item1, item2) {
				this.grid[item1.row][item1.col] = item2;
				this.grid[item2.row][item2.col] = item1;

				var item1Row = item1.row;
				var item1Col = item1.col;
				item1.row = item2.row;
				item1.col = item2.col;
				item2.row = item1Row;
				item2.col = item1Col;
			};

			this.moveOverlappingItems = function(item, ignoreItems) {
				// don't move item, so ignore it
				if (!ignoreItems) {
					ignoreItems = [item];
				} else if (ignoreItems.indexOf(item) === -1) {
					ignoreItems = ignoreItems.slice(0);
					ignoreItems.push(item);
				}

				// get the items in the space occupied by the item's coordinates
				var overlappingItems = this.getItems(
					item.row,
					item.col,
					item.sizeX,
					item.sizeY,
					ignoreItems
				);
				this.moveItemsDown(overlappingItems, item.row + item.sizeY, ignoreItems);
			};

			this.moveItemsDown = function(items, newRow, ignoreItems) {
				if (!items || items.length === 0) {
					return;
				}
				items.sort(function(a, b) {
					return a.row - b.row;
				});

				ignoreItems = ignoreItems ? ignoreItems.slice(0) : [];
				var topRows = {},
					item, i, l;

				// calculate the top rows in each column
				for (i = 0, l = items.length; i < l; ++i) {
					item = items[i];
					var topRow = topRows[item.col];
					if (typeof topRow === 'undefined' || item.row < topRow) {
						topRows[item.col] = item.row;
					}
				}

				// move each item down from the top row in its column to the row
				for (i = 0, l = items.length; i < l; ++i) {
					item = items[i];
					var rowsToMove = newRow - topRows[item.col];
					this.moveItemDown(item, item.row + rowsToMove, ignoreItems);
					ignoreItems.push(item);
				}
			};

			this.moveItemDown = function(item, newRow, ignoreItems) {
				if (item.row >= newRow) {
					return;
				}
				while (item.row < newRow) {
					++item.row;
					this.moveOverlappingItems(item, ignoreItems);
				}
				this.putItem(item, item.row, item.col, ignoreItems);
			};

			this.floatItemsUp = function() {
				if (this.floating === false) {
					return;
				}
				for (var rowIndex = 0, l = this.grid.length; rowIndex < l; ++rowIndex) {
					var columns = this.grid[rowIndex];
					if (!columns) {
						continue;
					}
					for (var colIndex = 0, len = columns.length; colIndex < len; ++colIndex) {
						var item = columns[colIndex];
						if (item) {
							this.floatItemUp(item);
						}
					}
				}
			};

			this.floatItemUp = function(item) {
				if (this.floating === false) {
					return;
				}
				var colIndex = item.col,
					sizeY = item.sizeY,
					sizeX = item.sizeX,
					bestRow = null,
					bestColumn = null,
					rowIndex = item.row - 1;

				while (rowIndex > -1) {
					var items = this.getItems(rowIndex, colIndex, sizeX, sizeY, item);
					if (items.length !== 0) {
						break;
					}
					bestRow = rowIndex;
					bestColumn = colIndex;
					--rowIndex;
				}
				if (bestRow !== null) {
					this.putItem(item, bestRow, bestColumn);
				}
			};

			this.updateHeight = function(plus) {
				var maxHeight = this.minRows;
				plus = plus || 0;
				for (var rowIndex = this.grid.length; rowIndex >= 0; --rowIndex) {
					var columns = this.grid[rowIndex];
					if (!columns) {
						continue;
					}
					for (var colIndex = 0, len = columns.length; colIndex < len; ++colIndex) {
						if (columns[colIndex]) {
							maxHeight = Math.max(maxHeight, rowIndex + plus + columns[colIndex].sizeY);
						}
					}
				}
				this.gridHeight = this.maxRows - maxHeight > 0 ? Math.min(this.maxRows, maxHeight) : Math.max(this.maxRows, maxHeight);
			};

			this.pixelsToRows = function(pixels, ceilOrFloor) {
				if (!this.outerMargin) {
					pixels += this.margins[0] / 2;
				}

				if (ceilOrFloor === true) {
					return Math.ceil(pixels / this.curRowHeight);
				} else if (ceilOrFloor === false) {
					return Math.floor(pixels / this.curRowHeight);
				}

				return Math.round(pixels / this.curRowHeight);
			};

			this.pixelsToColumns = function(pixels, ceilOrFloor) {
				if (!this.outerMargin) {
					pixels += this.margins[1] / 2;
				}

				if (ceilOrFloor === true) {
					return Math.ceil(pixels / this.curColWidth);
				} else if (ceilOrFloor === false) {
					return Math.floor(pixels / this.curColWidth);
				}

				return Math.round(pixels / this.curColWidth);
			};
		}
	])

	.directive('templatorPreview', function() {
		return {
			replace: true,
			scope: true,
			require: '^templator',
			template: '<div ng-style="previewStyle()" class="templator-item templator-preview-holder"></div>',
			link: function(scope, $el, attrs, templator) {

				scope.previewStyle = function() {
					if (!templator.movingItem) {
						return {
							display: 'none'
						};
					}

					return {
						display: 'block',
						height: (templator.movingItem.sizeY * templator.curRowHeight - templator.margins[0]) + 'px',
						width: (templator.movingItem.sizeX * templator.curColWidth - templator.margins[1]) + 'px',
						top: (templator.movingItem.row * templator.curRowHeight + (templator.outerMargin ? templator.margins[0] : 0)) + 'px',
						left: (templator.movingItem.col * templator.curColWidth + (templator.outerMargin ? templator.margins[1] : 0)) + 'px'
					};
				};
			}
		};
	})

	.directive('templator', ['$timeout', '$window', '$rootScope', 'templatorDebounce',
		function($timeout, $window, $rootScope, templatorDebounce) {
			return {
				scope: true,
				restrict: 'EAC',
				controller: 'templatorCtrl',
				controllerAs: 'templator',
				compile: function($tplElem) {

					$tplElem.prepend('<div ng-if="templator.movingItem" templator-preview></div>');

					return function(scope, $elem, attrs, templator) {

						templator.loaded = false;

						templator.parent = scope.$parent.$adm;

						templator.$element = $elem;

						scope.templator = templator;

						$elem.addClass('templator');

						var isVisible = function(ele) {
							return ele.style.visibility !== 'hidden' && ele.style.display !== 'none';
						};

						function refresh(config) {

							templator.setOptions(config);

							if (!isVisible($elem[0])) {
								return;
							}

							// resolve "auto" & "match" values
							if (templator.width === 'auto') {
								templator.curWidth = $elem[0].offsetWidth || parseInt($elem.css('width'), 10);
							} else {
								templator.curWidth = templator.width;
							}

							if (templator.colWidth === 'auto') {
								templator.curColWidth = (templator.curWidth + (templator.outerMargin ? -templator.margins[1] : templator.margins[1])) / templator.columns;
							} else {
								templator.curColWidth = templator.colWidth;
							}

							templator.curRowHeight = templator.rowHeight;
							if (typeof templator.rowHeight === 'string') {
								if (templator.rowHeight === 'match') {
									templator.curRowHeight = Math.round(templator.curColWidth);
								} else if (templator.rowHeight.indexOf('*') !== -1) {
									templator.curRowHeight = Math.round(templator.curColWidth * templator.rowHeight.replace('*', '').replace(' ', ''));
								} else if (templator.rowHeight.indexOf('/') !== -1) {
									templator.curRowHeight = Math.round(templator.curColWidth / templator.rowHeight.replace('/', '').replace(' ', ''));
								}
							}

							templator.isMobile = templator.mobileModeEnabled && templator.curWidth <= templator.mobileBreakPoint;

							// loop through all items and reset their CSS
							for (var rowIndex = 0, l = templator.grid.length; rowIndex < l; ++rowIndex) {
								var columns = templator.grid[rowIndex];
								if (!columns) {
									continue;
								}

								for (var colIndex = 0, len = columns.length; colIndex < len; ++colIndex) {
									if (columns[colIndex]) {
										var item = columns[colIndex];
										item.setElementPosition();
										item.setElementSizeY();
										item.setElementSizeX();
									}
								}
							}

							updateHeight();
						}

						var optionsKey = attrs.templator;
						if (optionsKey) {
							scope.$parent.$watch(optionsKey, function(newConfig) {
								refresh(newConfig);
							}, true);
						} else {
							refresh({});
						}

						scope.$watch(function() {
							return templator.loaded;
						}, function() {
							if (templator.loaded) {
								$elem.addClass('templator-loaded');
							} else {
								$elem.removeClass('templator-loaded');
							}
						});

						scope.$watch(function() {
							return templator.isMobile;
						}, function() {
							if (templator.isMobile) {
								$elem.addClass('templator-mobile').removeClass('templator-desktop');
							} else {
								$elem.removeClass('templator-mobile').addClass('templator-desktop');
							}
							$rootScope.$broadcast('templator-mobile-changed', templator);
						});

						function updateHeight() {
							$elem.css('height', (templator.gridHeight * templator.curRowHeight) + (templator.outerMargin ? templator.margins[0] : -templator.margins[0]) + 'px');
						}

						scope.$watch(function() {
							return templator.gridHeight;
						}, updateHeight);

						scope.$watch(function() {
							return templator.movingItem;
						}, function() {
							templator.updateHeight(templator.movingItem ? templator.movingItem.sizeY : 0);
						});

						var prevWidth = $elem[0].offsetWidth || parseInt($elem.css('width'), 10);

						var resize = function() {
			
							var width = $elem[0].offsetWidth || parseInt($elem.css('width'), 10);

							if (!width || width === prevWidth || templator.movingItem) {
								return;
							}
							prevWidth = width;

							if (templator.loaded) {
								$elem.removeClass('templator-loaded');
							}

							refresh();

							if (templator.loaded) {
								$elem.addClass('templator-loaded');
							}

							$rootScope.$broadcast('templator-resized', [width, $elem[0].offsetHeight], templator);
						};

						// track element width changes any way we can
						var onResize = templatorDebounce(function onResize() {
							resize();
							$timeout(function() {
								scope.$apply();
							});
						}, 100);

						scope.$watch(function() {
							return isVisible($elem[0]);
						}, onResize);

						// see https://github.com/sdecima/javascript-detect-element-resize
						if (typeof window.addResizeListener === 'function') {
							window.addResizeListener($elem[0], onResize);
						} else {
							scope.$watch(function() {
								return $elem[0].offsetWidth || parseInt($elem.css('width'), 10);
							}, resize);
						}
						var $win = angular.element($window);
						$win.on('resize', onResize);

						// be sure to cleanup
						scope.$on('$destroy', function() {
							gridster.destroy();
							$win.off('resize', onResize);
							if (typeof window.removeResizeListener === 'function') {
								window.removeResizeListener($elem[0], onResize);
							}
						});

						// allow a little time to place items before floating up
						$timeout(function() {
							scope.$watch('templator.floating', function() {
								templator.floatItemsUp();
							});
							templator.loaded = true;
						}, 100);
					};
				}
			};
		}
	])

	.factory('templatorTouch', [function() {
		return function templatorTouch(target, startEvent, moveEvent, endEvent) {
			var lastXYById = {};

			//  Opera doesn't have Object.keys so we use this wrapper
			var numberOfKeys = function(theObject) {
				if (Object.keys) {
					return Object.keys(theObject).length;
				}

				var n = 0,
					key;
				for (key in theObject) {
					++n;
				}

				return n;
			};

			//  this calculates the delta needed to convert pageX/Y to offsetX/Y because offsetX/Y don't exist in the TouchEvent object or in Firefox's MouseEvent object
			var computeDocumentToElementDelta = function(theElement) {
				var elementLeft = 0;
				var elementTop = 0;
				var oldIEUserAgent = navigator.userAgent.match(/\bMSIE\b/);

				for (var offsetElement = theElement; offsetElement != null; offsetElement = offsetElement.offsetParent) {
					//  the following is a major hack for versions of IE less than 8 to avoid an apparent problem on the IEBlog with double-counting the offsets
					//  this may not be a general solution to IE7's problem with offsetLeft/offsetParent
					if (oldIEUserAgent &&
						(!document.documentMode || document.documentMode < 8) &&
						offsetElement.currentStyle.position === 'relative' && offsetElement.offsetParent && offsetElement.offsetParent.currentStyle.position === 'relative' && offsetElement.offsetLeft === offsetElement.offsetParent.offsetLeft) {
						// add only the top
						elementTop += offsetElement.offsetTop;
					} else {
						elementLeft += offsetElement.offsetLeft;
						elementTop += offsetElement.offsetTop;
					}
				}

				return {
					x: elementLeft,
					y: elementTop
				};
			};

			//  cache the delta from the document to our event target (reinitialized each mousedown/MSPointerDown/touchstart)
			var documentToTargetDelta = computeDocumentToElementDelta(target);

			//  common event handler for the mouse/pointer/touch models and their down/start, move, up/end, and cancel events
			var doEvent = function(theEvtObj) {

				if (theEvtObj.type === 'mousemove' && numberOfKeys(lastXYById) === 0) {
					return;
				}

				var prevent = true;

				var pointerList = theEvtObj.changedTouches ? theEvtObj.changedTouches : [theEvtObj];
				for (var i = 0; i < pointerList.length; ++i) {
					var pointerObj = pointerList[i];
					var pointerId = (typeof pointerObj.identifier !== 'undefined') ? pointerObj.identifier : (typeof pointerObj.pointerId !== 'undefined') ? pointerObj.pointerId : 1;

					//  use the pageX/Y coordinates to compute target-relative coordinates when we have them (in ie < 9, we need to do a little work to put them there)
					if (typeof pointerObj.pageX === 'undefined') {
						//  initialize assuming our source element is our target
						pointerObj.pageX = pointerObj.offsetX + documentToTargetDelta.x;
						pointerObj.pageY = pointerObj.offsetY + documentToTargetDelta.y;

						if (pointerObj.srcElement.offsetParent === target && document.documentMode && document.documentMode === 8 && pointerObj.type === 'mousedown') {
							//  source element is a child piece of VML, we're in IE8, and we've not called setCapture yet - add the origin of the source element
							pointerObj.pageX += pointerObj.srcElement.offsetLeft;
							pointerObj.pageY += pointerObj.srcElement.offsetTop;
						} else if (pointerObj.srcElement !== target && !document.documentMode || document.documentMode < 8) {
							//  source element isn't the target (most likely it's a child piece of VML) and we're in a version of IE before IE8 -
							//  the offsetX/Y values are unpredictable so use the clientX/Y values and adjust by the scroll offsets of its parents
							//  to get the document-relative coordinates (the same as pageX/Y)
							var sx = -2,
								sy = -2; // adjust for old IE's 2-pixel border
							for (var scrollElement = pointerObj.srcElement; scrollElement !== null; scrollElement = scrollElement.parentNode) {
								sx += scrollElement.scrollLeft ? scrollElement.scrollLeft : 0;
								sy += scrollElement.scrollTop ? scrollElement.scrollTop : 0;
							}

							pointerObj.pageX = pointerObj.clientX + sx;
							pointerObj.pageY = pointerObj.clientY + sy;
						}
					}


					var pageX = pointerObj.pageX;
					var pageY = pointerObj.pageY;

					if (theEvtObj.type.match(/(start|down)$/i)) {
						//  clause for processing MSPointerDown, touchstart, and mousedown

						//  refresh the document-to-target delta on start in case the target has moved relative to document
						documentToTargetDelta = computeDocumentToElementDelta(target);

						//  protect against failing to get an up or end on this pointerId
						if (lastXYById[pointerId]) {
							if (endEvent) {
								endEvent({
									target: theEvtObj.target,
									which: theEvtObj.which,
									pointerId: pointerId,
									pageX: pageX,
									pageY: pageY
								});
							}

							delete lastXYById[pointerId];
						}

						if (startEvent) {
							if (prevent) {
								prevent = startEvent({
									target: theEvtObj.target,
									which: theEvtObj.which,
									pointerId: pointerId,
									pageX: pageX,
									pageY: pageY
								});
							}
						}

						//  init last page positions for this pointer
						lastXYById[pointerId] = {
							x: pageX,
							y: pageY
						};

						// IE pointer model
						if (target.msSetPointerCapture) {
							target.msSetPointerCapture(pointerId);
						} else if (theEvtObj.type === 'mousedown' && numberOfKeys(lastXYById) === 1) {
							if (useSetReleaseCapture) {
								target.setCapture(true);
							} else {
								document.addEventListener('mousemove', doEvent, false);
								document.addEventListener('mouseup', doEvent, false);
							}
						}
					} else if (theEvtObj.type.match(/move$/i)) {
						//  clause handles mousemove, MSPointerMove, and touchmove

						if (lastXYById[pointerId] && !(lastXYById[pointerId].x === pageX && lastXYById[pointerId].y === pageY)) {
							//  only extend if the pointer is down and it's not the same as the last point

							if (moveEvent && prevent) {
								prevent = moveEvent({
									target: theEvtObj.target,
									which: theEvtObj.which,
									pointerId: pointerId,
									pageX: pageX,
									pageY: pageY
								});
							}

							//  update last page positions for this pointer
							lastXYById[pointerId].x = pageX;
							lastXYById[pointerId].y = pageY;
						}
					} else if (lastXYById[pointerId] && theEvtObj.type.match(/(up|end|cancel)$/i)) {
						//  clause handles up/end/cancel

						if (endEvent && prevent) {
							prevent = endEvent({
								target: theEvtObj.target,
								which: theEvtObj.which,
								pointerId: pointerId,
								pageX: pageX,
								pageY: pageY
							});
						}

						//  delete last page positions for this pointer
						delete lastXYById[pointerId];

						//  in the Microsoft pointer model, release the capture for this pointer
						//  in the mouse model, release the capture or remove document-level event handlers if there are no down points
						//  nothing is required for the iOS touch model because capture is implied on touchstart
						if (target.msReleasePointerCapture) {
							target.msReleasePointerCapture(pointerId);
						} else if (theEvtObj.type === 'mouseup' && numberOfKeys(lastXYById) === 0) {
							if (useSetReleaseCapture) {
								target.releaseCapture();
							} else {
								document.removeEventListener('mousemove', doEvent, false);
								document.removeEventListener('mouseup', doEvent, false);
							}
						}
					}
				}

				if (prevent) {
					if (theEvtObj.preventDefault) {
						theEvtObj.preventDefault();
					}

					if (theEvtObj.preventManipulation) {
						theEvtObj.preventManipulation();
					}

					if (theEvtObj.preventMouseEvent) {
						theEvtObj.preventMouseEvent();
					}
				}
			};

			var useSetReleaseCapture = false;
			// saving the settings for contentZooming and touchaction before activation
			var contentZooming, msTouchAction;

			this.enable = function() {

				if (window.navigator.msPointerEnabled) {
					//  Microsoft pointer model
					target.addEventListener('MSPointerDown', doEvent, false);
					target.addEventListener('MSPointerMove', doEvent, false);
					target.addEventListener('MSPointerUp', doEvent, false);
					target.addEventListener('MSPointerCancel', doEvent, false);

					//  css way to prevent panning in our target area
					if (typeof target.style.msContentZooming !== 'undefined') {
						contentZooming = target.style.msContentZooming;
						target.style.msContentZooming = 'none';
					}

					//  new in Windows Consumer Preview: css way to prevent all built-in touch actions on our target
					//  without this, you cannot touch draw on the element because IE will intercept the touch events
					if (typeof target.style.msTouchAction !== 'undefined') {
						msTouchAction = target.style.msTouchAction;
						target.style.msTouchAction = 'none';
					}
				} else if (target.addEventListener) {
					//  iOS touch model
					target.addEventListener('touchstart', doEvent, false);
					target.addEventListener('touchmove', doEvent, false);
					target.addEventListener('touchend', doEvent, false);
					target.addEventListener('touchcancel', doEvent, false);

					//  mouse model
					target.addEventListener('mousedown', doEvent, false);

					//  mouse model with capture
					//  rejecting gecko because, unlike ie, firefox does not send events to target when the mouse is outside target
					if (target.setCapture && !window.navigator.userAgent.match(/\bGecko\b/)) {
						useSetReleaseCapture = true;

						target.addEventListener('mousemove', doEvent, false);
						target.addEventListener('mouseup', doEvent, false);
					}
				} else if (target.attachEvent && target.setCapture) {
					//  legacy IE mode - mouse with capture
					useSetReleaseCapture = true;
					target.attachEvent('onmousedown', function() {
						doEvent(window.event);
						window.event.returnValue = false;
						return false;
					});
					target.attachEvent('onmousemove', function() {
						doEvent(window.event);
						window.event.returnValue = false;
						return false;
					});
					target.attachEvent('onmouseup', function() {
						doEvent(window.event);
						window.event.returnValue = false;
						return false;
					});
				}
			};

			this.disable = function() {
				if (window.navigator.msPointerEnabled) {
					//  Microsoft pointer model
					target.removeEventListener('MSPointerDown', doEvent, false);
					target.removeEventListener('MSPointerMove', doEvent, false);
					target.removeEventListener('MSPointerUp', doEvent, false);
					target.removeEventListener('MSPointerCancel', doEvent, false);

					//  reset zooming to saved value
					if (contentZooming) {
						target.style.msContentZooming = contentZooming;
					}

					// reset touch action setting
					if (msTouchAction) {
						target.style.msTouchAction = msTouchAction;
					}
				} else if (target.removeEventListener) {
					//  iOS touch model
					target.removeEventListener('touchstart', doEvent, false);
					target.removeEventListener('touchmove', doEvent, false);
					target.removeEventListener('touchend', doEvent, false);
					target.removeEventListener('touchcancel', doEvent, false);

					//  mouse model
					target.removeEventListener('mousedown', doEvent, false);

					//  mouse model with capture
					//  rejecting gecko because, unlike ie, firefox does not send events to target when the mouse is outside target
					if (target.setCapture && !window.navigator.userAgent.match(/\bGecko\b/)) {
						useSetReleaseCapture = true;

						target.removeEventListener('mousemove', doEvent, false);
						target.removeEventListener('mouseup', doEvent, false);
					}
				} else if (target.detachEvent && target.setCapture) {
					//  legacy IE mode - mouse with capture
					useSetReleaseCapture = true;
					target.detachEvent('onmousedown');
					target.detachEvent('onmousemove');
					target.detachEvent('onmouseup');
				}
			};

			return this;
		};
	}])

	.factory('templatorDebounce', function() {
		return function templatorDebounce(func, wait, immediate) {
			var timeout;
			return function() {
				var context = this,
					args = arguments;
				var later = function() {
					timeout = null;
					if (!immediate) {
						func.apply(context, args);
					}
				};
				var callNow = immediate && !timeout;
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
				if (callNow) {
					func.apply(context, args);
				}
			};
		};
	})

	.directive('templatorItem', ['$parse', 'templatorDebounce',
		function($parse, templatorDebounce) {
			return {
				scope: true,
				restrict: 'EA',
				controller: 'templatorItemCtrl',
				controllerAs: 'templatorItem',
				require: ['^templator', 'templatorItem'],
				link: function(scope, $el, attrs, controllers) {

					var optionsKey = attrs.templatorItem,
						options;

					var templator = controllers[0],
						item = controllers[1];

					scope.templator = templator;

					if (optionsKey) {
						var $optionsGetter = $parse(optionsKey);
						options = $optionsGetter(scope) || {};
						if (!options && $optionsGetter.assign) {
							options = {
								row: item.row,
								col: item.col,
								sizeX: item.sizeX,
								sizeY: item.sizeY,
								minSizeX: 0,
								minSizeY: 0,
								maxSizeX: null,
								maxSizeY: null
							};
							$optionsGetter.assign(scope, options);
						}
					} else {
						options = attrs;
					}

					item.init($el, templator);
					$el.addClass('templator-item');

					var aspects = ['minSizeX', 'maxSizeX', 'minSizeY', 'maxSizeY', 'sizeX', 'sizeY', 'row', 'col'],
						$getters = {};

					var expressions = [];
					var aspectFn = function(aspect) {
						var expression;
						if (typeof options[aspect] === 'string') {
							// watch the expression in the scope
							expression = options[aspect];
						} else if (typeof options[aspect.toLowerCase()] === 'string') {
							// watch the expression in the scope
							expression = options[aspect.toLowerCase()];
						} else if (optionsKey) {
							// watch the expression on the options object in the scope
							expression = optionsKey + '.' + aspect;
						} else {
							return;
						}
						expressions.push('"' + aspect + '":' + expression);

						$getters[aspect] = $parse(expression);

						// initial set
						var val = $getters[aspect](scope);
						if (typeof val === 'number') {
							item[aspect] = val;
						}
					};

					for (var i = 0, l = aspects.length; i < l; ++i) {
						aspectFn(aspects[i]);
					}

					var watchExpressions = '{' + expressions.join(',') + '}';

					scope.$watchCollection(watchExpressions, function(newVals, oldVals) {
						for (var aspect in newVals) {
							var newVal = newVals[aspect];
							var oldVal = oldVals[aspect];
							if (oldVal === newVal) {
								continue;
							}
							newVal = parseInt(newVal, 10);
							if (!isNaN(newVal)) {
								item[aspect] = newVal;
							}
						}
					});

					function positionChanged() {
						// call setPosition so the element and gridster controller are updated
						item.setPosition(item.row, item.col);

						// when internal item position changes, update externally bound values
						if ($getters.row && $getters.row.assign) {
							$getters.row.assign(scope, item.row);
						}
						if ($getters.col && $getters.col.assign) {
							$getters.col.assign(scope, item.col);
						}
					}
					scope.$watch(function() {
						return item.row + ',' + item.col;
					}, positionChanged);

					function sizeChanged() {
						var changedX = item.setSizeX(item.sizeX, true);
						if (changedX && $getters.sizeX && $getters.sizeX.assign) {
							$getters.sizeX.assign(scope, item.sizeX);
						}
						var changedY = item.setSizeY(item.sizeY, true);
						if (changedY && $getters.sizeY && $getters.sizeY.assign) {
							$getters.sizeY.assign(scope, item.sizeY);
						}

						if (changedX || changedY) {
							item.templator.moveOverlappingItems(item);
							templator.layoutChanged();
							scope.$broadcast('templator-item-resized', item);
						}
					}

					scope.$watch(function() {
						return item.sizeY + ',' + item.sizeX + ',' + item.minSizeX + ',' + item.maxSizeX + ',' + item.minSizeY + ',' + item.maxSizeY;
					}, sizeChanged);

					function whichTransitionEvent() {
						var el = document.createElement('div');
						var transitions = {
							'transition': 'transitionend',
							'OTransition': 'oTransitionEnd',
							'MozTransition': 'transitionend',
							'WebkitTransition': 'webkitTransitionEnd'
						};
						for (var t in transitions) {
							if (el.style[t] !== undefined) {
								return transitions[t];
							}
						}
					}

					var debouncedTransitionEndPublisher = templatorDebounce(function() {
						scope.$apply(function() {
							scope.$broadcast('templator-item-transition-end', item);
						});
					}, 50);

					$el.on(whichTransitionEvent(), debouncedTransitionEndPublisher);

					scope.$broadcast('templator-item-initialized', item);

					return scope.$on('$destroy', function() {

						try {
							templator.removeItem(item);
						} catch (e) {}

						try {
							item.destroy();
						} catch (e) {}
					});
				}
			};
		}
	])

	.controller('templatorItemCtrl', function() {
		this.$element = null;
		this.templator = null;
		this.row = null;
		this.col = null;
		this.sizeX = null;
		this.sizeY = null;
		this.minSizeX = 0;
		this.minSizeY = 0;
		this.maxSizeX = null;
		this.maxSizeY = null;

		this.init = function($element, templator) {
			this.$element = $element;
			this.templator = templator;
			this.sizeX = templator.defaultSizeX;
			this.sizeY = templator.defaultSizeY;
		};

		this.destroy = function() {
			// set these to null to avoid the possibility of circular references
			this.templator = null;
			this.$element = null;
		};

		/**
		 * Returns the items most important attributes
		 */
		this.toJSON = function() {
			return {
				row: this.row,
				col: this.col,
				sizeY: this.sizeY,
				sizeX: this.sizeX
			};
		};

		this.isMoving = function() {
			return this.templator.movingItem === this;
		};

		/**
		 * Set the items position
		 *
		 * @param {Number} row
		 * @param {Number} column
		 */
		this.setPosition = function(row, column) {
			this.templator.putItem(this, row, column);

			if (!this.isMoving()) {
				this.setElementPosition();
			}
		};

		/**
		 * Sets a specified size property
		 *
		 * @param {String} key Can be either "x" or "y"
		 * @param {Number} value The size amount
		 * @param {Boolean} preventMove
		 */
		this.setSize = function(key, value, preventMove) {
			key = key.toUpperCase();
			var camelCase = 'size' + key,
				titleCase = 'Size' + key;
			if (value === '') {
				return;
			}
			value = parseInt(value, 10);
			if (isNaN(value) || value === 0) {
				value = this.templator['default' + titleCase];
			}
			var max = key === 'X' ? this.templator.columns : this.templator.maxRows;
			if (this['max' + titleCase]) {
				max = Math.min(this['max' + titleCase], max);
			}
			if (this.templator['max' + titleCase]) {
				max = Math.min(this.templator['max' + titleCase], max);
			}
			if (key === 'X' && this.cols) {
				max -= this.cols;
			} else if (key === 'Y' && this.rows) {
				max -= this.rows;
			}

			var min = 0;
			if (this['min' + titleCase]) {
				min = Math.max(this['min' + titleCase], min);
			}
			if (this.templator['min' + titleCase]) {
				min = Math.max(this.templator['min' + titleCase], min);
			}

			value = Math.max(Math.min(value, max), min);

			var changed = (this[camelCase] !== value || (this['old' + titleCase] && this['old' + titleCase] !== value));
			this['old' + titleCase] = this[camelCase] = value;

			if (!this.isMoving()) {
				this['setElement' + titleCase]();
			}
			if (!preventMove && changed) {
				this.templator.moveOverlappingItems(this);
				this.templator.layoutChanged();
			}

			return changed;
		};

		/**
		 * Sets the items sizeY property
		 *
		 * @param {Number} rows
		 * @param {Boolean} preventMove
		 */
		this.setSizeY = function(rows, preventMove) {
			return this.setSize('Y', rows, preventMove);
		};

		/**
		 * Sets the items sizeX property
		 *
		 * @param {Number} columns
		 * @param {Boolean} preventMove
		 */
		this.setSizeX = function(columns, preventMove) {
			return this.setSize('X', columns, preventMove);
		};

		/**
		 * Sets an elements position on the page
		 */
		this.setElementPosition = function() {
			if (this.templator.isMobile) {
				this.$element.css({
					marginLeft: this.templator.margins[0] + 'px',
					marginRight: this.templator.margins[0] + 'px',
					marginTop: this.templator.margins[1] + 'px',
					marginBottom: this.templator.margins[1] + 'px',
					top: '10',
					left: ''
				});
			} else {
				this.$element.css({
					margin: 0,
					top: (this.row * this.templator.curRowHeight + (this.templator.outerMargin ? this.templator.margins[0] : 0)) + 'px',
					left: (this.col * this.templator.curColWidth + (this.templator.outerMargin ? this.templator.margins[1] : 0)) + 'px'
				});
			}
		};

		/**
		 * Sets an elements height
		 */
		this.setElementSizeY = function() {
			if (this.templator.isMobile && !this.templator.saveGridItemCalculatedHeightInMobile) {
				this.$element.css('height', '');
			} else {
				this.$element.css('height', (this.sizeY * this.templator.curRowHeight - this.templator.margins[0]) + 'px');
			}
		};

		/**
		 * Sets an elements width
		 */
		this.setElementSizeX = function() {
			if (this.templator.isMobile) {
				this.$element.css('width', '');
			} else {
				this.$element.css('width', (this.sizeX * this.templator.curColWidth - this.templator.margins[1]) + 'px');
			}
		};

		/**
		 * Gets an element's width
		 */
		this.getElementSizeX = function() {
			return (this.sizeX * this.templator.curColWidth - this.templator.margins[1]);
		};

		/**
		 * Gets an element's height
		 */
		this.getElementSizeY = function() {
			return (this.sizeY * this.templator.curRowHeight - this.templator.margins[0]);
		};
	})

	.directive('templatorComponent', ['$parse', 'templatorDebounce',
		function($parse, templatorDebounce) {
			return {
				scope: true,
				restrict: 'EA',
				controller: 'templatorComponentCtrl',
				controllerAs: 'templatorComponent',
				templateUrl: 'assets/lib/xcdify-templator/templates/table.html',
				require: ['^templator', 'templatorComponent'],
				link: function(scope, $el, attrs, controllers) {

					var optionsKey = attrs.templatorComponent,
						options;

					var templator = controllers[0],
						component = controllers[1];

					scope.templator = templator;

					if (optionsKey) {
						var $optionsGetter = $parse(optionsKey);
						options = $optionsGetter(scope) || {};
						if (!options && $optionsGetter.assign) {
							options = {
								name: component.name,
								type: component.type,
								properties: JSON.stringify(JSON.parse(component.properties))
							};
							$optionsGetter.assign(scope, options);
						}
					} else {
						options = attrs;
					}

					component.init($el, templator);

					$el.addClass('templator-component');

					var aspects = ['name', 'type', 'properties'],
						$getters = {};

					var expressions = [];
					var aspectFn = function(aspect) {
						var expression;
						var expression1;
						if(aspect != 'properties'){
							if (typeof options[aspect] === 'string') {
								// watch the expression in the scope
								expression = options[aspect];
							} else if (typeof options[aspect.toLowerCase()] === 'string') {
								// watch the expression in the scope
								expression = options[aspect.toLowerCase()];
							} else if (optionsKey) {
								// watch the expression on the options object in the scope
								expression = optionsKey + '.' + aspect;
							} else {
								return;
							}
							expressions.push('"' + aspect + '":"' + expression + '"');
						}else{
							expression1 = JSON.stringify(options[aspect]);
							expressions.push('"properties":' + expression1 );				
						}	
						
						$getters[aspect] = $parse(expression);
						// initial set
						var val = $getters[aspect](scope);
						if (typeof val === 'number') {
							component[aspect] = val;
						}
					};

					for (var i = 0, l = aspects.length; i < l; ++i) {
						aspectFn(aspects[i]);
					}

					var watchExpressions = '{' + expressions.join(',') + '}';

					scope.data = JSON.parse(watchExpressions);
					
					scope.$watchCollection(watchExpressions, function(newVals, oldVals) {
						for (var aspect in newVals) {
							var newVal = newVals[aspect];
							var oldVal = oldVals[aspect];
							if (oldVal === newVal) {
								continue;
							}
							newVal = parseInt(newVal, 10);
							if (!isNaN(newVal)) {
								component[aspect] = newVal;
							}
						}

					});

					scope.removeComponent = function(data){
						scope.templator.parent.componentRemove(data);
					};

					function whichTransitionEvent() {
						var el = document.createElement('div');
						var transitions = {
							'transition': 'transitionend',
							'OTransition': 'oTransitionEnd',
							'MozTransition': 'transitionend',
							'WebkitTransition': 'webkitTransitionEnd'
						};
						for (var t in transitions) {
							if (el.style[t] !== undefined) {
								return transitions[t];
							}
						}
					}

					var debouncedTransitionEndPublisher = templatorDebounce(function() {
						scope.$apply(function() {
							scope.$broadcast('templator-component-transition-end', component);
						});
					}, 50);

					$el.on(whichTransitionEvent(), debouncedTransitionEndPublisher);

					scope.$broadcast('templator-component-initialized', component);

					return scope.$on('$destroy', function() {

						try {
							templator.removeComponent(component);
						} catch (e) {}

						try {
							component.destroy();
						} catch (e) {}
					});
				}
			};
		}
	])

	.controller('templatorComponentCtrl', ['$scope', '$uibModal', function($scope, $uibModal) {

		this.$element = null;
		this.templator = null;
		this.properties = null;
		this.name = null;
		this.type = null;

		this.init = function($element, templator) {
			this.$element = $element;
			this.templator = templator;
			this.properties = templator.properties;
			this.name = templator.name;
			this.type = templator.type;
		};

		this.openSettings = function(component){
			$uibModal.open({
				scope: $scope,
                templateUrl: 'assets/lib/xcdify-templator/templates/tablesettings.html',
                controller: 'tableSettingsCtrl as $tabsett',
                resolve: {
                    component: function() {
                        return component;
                    }
                }
            });
		}

		this.remove = function(component){
			removeComponent(component);
			console.log($scope.$parent)
			console.log(component)
		}

		this.destroy = function() {
			// set these to null to avoid the possibility of circular references
			this.templator = null;
			this.$element = null;
		};

		this.toJSON = function() {
			return {
				name: this.name,
				type: this.type,
				properties: this.properties,
			};
		};

		this.isMoving = function() {
			return this.templator.movingItem === this;
		};

	}])

	.controller('tableSettingsCtrl', ['$scope', '$uibModalInstance', 'component', 
		function($scope, $uibModalInstance, component) {
        
        var vm = this;
        vm.component = component;

        vm.dismiss = dismiss;
        vm.submit = submit;

        vm.form = {
            name: component.name,
            tablecolumn: component.properties.tablecolumn,
            columns: component.properties.columns
        };

        function dismiss() {
            $uibModalInstance.dismiss();
        };

        function submit(settingForm, data) {
            angular.extend(component, vm.form);
            $uibModalInstance.close(component);
        };

    }]);

})(window.angular);