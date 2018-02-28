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
     * Options for adding an alert.
     */
    export interface AlertOptions {
        /** 
         * Can close or not.
         */
        canClose?: boolean;
        /** 
         * The custom target.
         */
        target?: JSelector;
        /** 
         * The type.
         */
        type?: AlertType;
    }

    /** 
     * List of alert types.
     */
    export type AlertType = 'success' | 'info' | 'warning' | 'danger';

    /**
     * A JQuery selector.
     */
    export type JSelector = JQuery | string;

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
     * Adds an alert message.
     * 
     * @param {any} msg The message.
     * @param {AlertOptions} [opts] Additional options.
     * 
     * @return {JQuery} The created object.
     */
    export function addAlert(msg: any, opts?: AlertOptions): JQuery {
        if (!opts) {
            opts = <any>{};
        }

        const CAN_CLOSE = toBooleanSafe(opts.canClose, true);

        let target = asJQuery(opts.target);
        if (_.isNil(target)) {
            target = jQuery('#sw-alerts');
        }

        let type = toStringSafe(opts.type).toLowerCase().trim();
        if ('' === type) {
            type = 'danger';
        }

        let newAlert: JQuery;
        if (CAN_CLOSE) {
            newAlert = jQuery('<div class="alert alert-dismissible" role="alert">' + 
                              '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + 
                              '<span class="sw-message"></span>' + 
                              '</div>');
        }
        else {
            newAlert = jQuery('<div class="alert" role="alert">' + 
                              '<span class="sw-message"></span>' + 
                              '</div>');
        }

        newAlert.addClass(`alert-${type}`);

        newAlert.find('span.sw-message')
                .text( toStringSafe(msg) );

        target.append( newAlert );

        return newAlert;
    }

    /**
     * Returns a value as jQuery object.
     * 
     * @param {any} val The input value.
     * 
     * @return {JQuery} The output value.
     */
    export function asJQuery(val: any): JQuery {
        if (_.isNil(val)) {
            return val;
        }

        if (val instanceof jQuery) {
            return val;
        }

        return jQuery( toStringSafe(val) );
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

    /**
     * Reads a blob as data URL.
     * 
     * @param {Blob} data The blob to read.
     * @param {Function} callback The callback with the data URL.
     */
    export function readBlob(data: Blob, callback: (dataUrl: string) => void) {
        if (!_.isNil(data)) {
            const READER = new FileReader();
            READER.onload = (e: any) => {
                let dataUrl: string;
                if (e.target && e.target.result) {
                    dataUrl = toStringSafe(e.target.result);
                }

                callback(dataUrl);
            };

            READER.readAsDataURL(data);
        }
        else {
            callback(<any>data);
        }
    }

    /**
     * Selects a tab.
     * 
     * @param {string} id The ID of the tab.
     * 
     * @return {JQuery} The selected tab.
     */
    export function selectTab(id: string): JQuery {
        const TAB = jQuery(`a[href="#${id}"]`);
        TAB.tab('show');

        return TAB;
    }

    /**
     * Returns a value as boolean.
     * 
     * @param {any} val The input value.
     * @param {any} [defaultValue] The value to return is 'val' is (null) or (undefined).
     * 
     * @return {boolean} 'val' as boolean.
     */
    export function toBooleanSafe(val: any, defaultValue: any = false): boolean {
        if (_.isBoolean(val)) {
            return val;
        }

        if (_.isNil(val)) {
            return !!defaultValue;
        }

        return !!val;
    }

    /**
     * Returns a value as string that is not (null) or (undefined).
     * 
     * @param {any} val The value to convert.
     * 
     * @return {string} 'val' as string.
     */
    export function toStringSafe(val: any): string {
        if (_.isString(val)) {
            return val;
        }

        if (_.isNil(val)) {
            return '';
        }

        return '' + val;
    }
}

const $SWB = new SimpleWhiteboard.App();
$SWB.init();
