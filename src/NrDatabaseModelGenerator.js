import _ from "lodash";
import AssertUtils from "@norjs/utils/Assert";
import NrDatabaseTable from "@norjs/ui/models/NrDatabaseTable";
import NrDatabaseType from "@norjs/ui/models/NrDatabaseType";
import NrDatabaseJsType from "@norjs/ui/models/NrDatabaseJsType";
import PATH from "path";

/**
 *
 * @enum {string}
 * @readonly
 */
const JsTypeToAssert = {

    NULL        : "AssertUtils.isNull",
    TIMESTAMPTZ : "AssertUtils.isDateString",
    TEXT        : "AssertUtils.isString",
    INT         : "AssertUtils.isNumber",
    BIGINT      : "AssertUtils.isNumber",
    BOOLEAN     : "AssertUtils.isBoolean",
    UUID        : "AssertUtils.isUuidString"

};

/**
 * Generates data model class files from a NrDatabaseTable model.
 */
export class NrDatabaseModelGenerator {

    static get nrName () {
        return "NrDatabaseModelGenerator";
    }

    /**
     *
     *
     * @param className {string}
     * @param table {NrDatabaseTable}
     * @returns {string}
     */
    static generateDataModel (className, table) {

        AssertUtils.isString(className);
        AssertUtils.isInstanceOf(table, NrDatabaseTable);

        const columnNames       = _.map(table.columns, column => column.name);
        const columnTypes       = _.map(table.columns, column => column.type);
        const columnNullable    = _.map(table.columns, column => column.nullable);
        const columnIds         = _.map(columnNames, name => _.toUpper(name));
        const propertyNames     = _.map(columnNames, name => _.camelCase(name));
        const columnTypeIds     = _.map(columnTypes, type => this._getNrDatabaseTypeID(type));
        const columnTypeNames   = _.map(columnTypeIds, type => `NrDatabaseType.${type}`);

        const classPropertyEnum      = _.trimStart(_.map(columnIds, (id, index) => `    ${id} : '${ propertyNames[index] }'`).join(',\n'));
        const classColumnEnum        = _.trimStart(_.map(columnIds, (id, index) => `    ${id} : '${ columnNames[index]   }'`).join(',\n'));
        const classTypeEnum          = _.trimStart(_.map(columnIds, (id, index) => `    ${id} : ${  columnTypeNames[index]   }`).join(',\n'));

        const constructorJsdocParams = _.trimStart(_.map(
            columnIds,
            (id, index) => `     * @param ${ propertyNames[index] } {${ NrDatabaseJsType[columnTypeIds[index]] + ( columnNullable[index] ? '|undefined' : '') }}`
        ).join('\n'));

        const constructorParams      = _.trimStart(_.map(propertyNames, (name) => `        ${name}`).join(',\n'));

        const constructorAsserts     = _.trimStart(_.map(
            propertyNames,
            (param, index) => columnNullable[index]
                ? `        if ( ${param} !== undefined ) ${ JsTypeToAssert[columnTypeIds[index]] }(${param});`
                : `        ${ JsTypeToAssert[columnTypeIds[index]] }(${param});`
        ).join('\n'));

        const constructorAssigns = _.trimStart(_.map(columnIds, (id, index) => `        /**
         *
         * @member {${ NrDatabaseJsType[columnTypeIds[index]] + ( columnNullable[index] ? '|undefined' : '') }}
         * @private
         */
        this._${propertyNames[index]} = ${propertyNames[index]};
`).join('\n'));

        const classGetters = _.trimStart(_.map(columnIds, (id, index) => `    /**
     *
     * @returns {${ NrDatabaseJsType[columnTypeIds[index]] + ( columnNullable[index] ? '|undefined' : '') }}
     */
    get ${propertyNames[index]} () {
        return this._${propertyNames[index]};
    }
`).join('\n'));

        const classValueOf = _.trimStart(_.map(
            propertyNames,
            (name, index) => columnNullable[index]
                ? `            ${name} : this._${name} !== undefined ? this._${name} : null`
                : `            ${name} : this._${name}`
        ).join(',\n'));

        const classParseValueVariables = _.map(propertyNames, (name) => `${name}`).join(',\n            ');

        const classParseValueConstructorArgs = _.trimStart(_.map(
            propertyNames,
            (name, index) =>
                columnTypes[index] === NrDatabaseType.TIMESTAMPTZ
                ?
                    (
                        columnNullable[index]
                        ? `            ${name} : !_.isNil(${name}) ? DateUtils.parseToString(${name}) : undefined`
                        : `            ${name} : DateUtils.parseToString(${name})`
                    )
                :
                    (
                        columnNullable[index]
                        ? `            ${name} : !_.isNil(${name}) ? ${name} : undefined`
                        : `            ${name} : ${name}`
                    )
        ).join(',\n'));

        return `/**
 * NOTE! This file has been auto generated by norjs-db-model-generator and is not recommended to be edited directly.
 * 
 * If you need non-standard customizations, you should extend your own class from this and override 
 * your changes.
 *
 * @file
 */

import AssertUtils from "@norjs/utils/Assert";
import DateUtils from "@norjs/utils/Date";
import NrDatabaseType from "@norjs/ui/models/NrDatabaseType";
import _ from "lodash";

/**
 * Model class property names
 * 
 * @enum {string}
 * @readonly
 */
export const ${className}Property = {
    ${classPropertyEnum}
};

/**
 * Database table column names
 * 
 * @enum {string}
 * @readonly
 */
export const ${className}Column = {
    ${classColumnEnum}
};

/**
 * Database table types
 * 
 * @enum {NrDatabaseType}
 * @readonly
 */
export const ${className}Type = {
    ${classTypeEnum}
};

/**
 *
 * @implements {NrModel}
 */
export class ${className} {

    /**
     *
     * @returns {string}
     */
    static get nrName () {
        return "${className}";
    }
    
    /**
     * @returns {typeof ${className}Property}
     */
    static get Property () {
        return ${className}Property;
    }

    /**
     * @returns {typeof ${className}Type}
     */
    static get Type () {
        return ${className}Type;
    }

    /**
     * @returns {typeof ${className}Column}
     */
    static get Column () {
        return ${className}Column;
    }

    /**
     *
     ${constructorJsdocParams}
     */
    constructor ({
        ${constructorParams}
    }) {
    
        ${constructorAsserts}
        
        ${constructorAssigns}
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @returns {string}
     */
    get nrName () {
        return this.Class.nrName;
    }

    /**
     *
     * @returns {typeof ${className}}
     */
    get Class () {
        return ${className};
    }

    ${classGetters}
    /**
     *
     * @returns {Object}
     */
    valueOf () {
        return {
            type: this.nrName,
            ${classValueOf}
        };
    }

    /**
     *
     * @returns {Object}
     */
    toJSON () {
        return this.valueOf();
    }

    /**
     *
     * @param value {Object}
     * @returns {Object}
     * @protected
     */
    static _parseValue (value) {

        if ( !_.isObject(value) ) {
            throw new TypeError(\`\${ this.nrName }.parseValue(): value was not object: "\${ value.type }"\`);
        }

        if ( value.type !== this.nrName ) {
            throw new TypeError(\`\${ this.nrName }.parseValue(): value's type is not correct: "\${ value.type }"\`);
        }

        const {
            ${classParseValueVariables}
        } = value;

        return {
            ${classParseValueConstructorArgs}
        };

    }

    /**
     *
     * @param value {Object}
     * @returns {${className}}
     */
    static parseValue (value) {

        if ( !value ) {
            throw new TypeError(\`\${ this.nrName }.parseValue(): value was not defined: "\${ value }"\`);
        }

        if ( value instanceof ${className} ) {
            return value;
        }

        return new ${className}(this._parseValue(value));

    }
    
}

// noinspection JSUnusedGlobalSymbols
export default ${className};`;

    }

    /**
     *
     * @param typeValue {string}
     * @returns {string|undefined}
     * @private
     */
    static _getNrDatabaseTypeID (typeValue) {

        return _.find(_.keys(NrDatabaseType), key => NrDatabaseType[key] === typeValue);

    }

    /**
     *
     * @param args {Array.<string>}
     */
    static async main (args) {

        const sourceFileName = args.shift();

        if (!sourceFileName) throw new TypeError(`${this.nrName}.main(): first argument wasn't defined`);

        const sourceObject = require(PATH.resolve(process.cwd(), sourceFileName));

        const table = NrDatabaseTable.parseValue( sourceObject );

        const className = args.shift() || _.upperFirst(_.camelCase(table.name));

        console.log( this.generateDataModel(className, table) );

    }

}

export default NrDatabaseModelGenerator;
