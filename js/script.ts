// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

/// <reference path="../ts/bootstrap.d.ts" />
/// <reference path="../ts/jquery.d.ts" />
/// <reference path="../ts/lodash/index.d.ts" />
/// <reference path="../ts/showdown.d.ts" />

namespace SimpleWhiteboard {
    /**
     * A JSON result.
     */
    export interface JsonResult<TData = any> {
        /**
         * The code.
         */
        code?: number;
        /**
         * The data.
         */
        data?: TData;
    }

    /**
     * Describes an 'on loaded' callback.
     */
    export type OnLoadedCallback = () => void;

    /**
     * An app instance.
     */
    export class App {
        private _onLoaded: OnLoadedCallback[];

        /**
         * Stores the current app.
         */
        public static current: App;

        /**
         * Adds an 'on loaded' callback.
         * 
         * @param {OnLoadedCallback} callback The callback to add.
         * 
         * @return this
         * 
         * @chainable
         */
        public addOnLoaded(callback: OnLoadedCallback): this {
            this._onLoaded
                .push(callback);

            return this;
        }

        /**
         * Initializes the app.
         */
        public init() {
            this._onLoaded = [];
        }

        /**
         * Runs the app.
         */
        public run() {
            this._onLoaded.forEach(cb => {
                cb();
            });
        }
    }

    /**
     * Creates a new Markdown parser.
     * 
     * @return {showdown.Converter} The new parser.
     */
    export function createMarkdownParser() {
        return new showdown.Converter({
            ghCodeBlocks: true,
            ghCompatibleHeaderId: true,
            simplifiedAutoLink: true,
            strikethrough: true,
            tables: true
        });
    }
}

const $SWB = new SimpleWhiteboard.App();
$SWB.init();
