class QueryAxisItemValueFormatter {
  
  #logicalType = undefined;
  #axisItem = undefined;
  #formatter = undefined;
  #decimalSeparator = undefined;
  
  constructor(axisItem) {
    this.#axisItem = axisItem;

    var isNumeric, isInteger;

    var columnType = axisItem.columnType;
    var columnTypeInfo = dataTypes[columnType];
    
    var aggregator = axisItem.aggregator;
    if (aggregator) {
      var aggregatorInfo = AttributeUi.aggregators[aggregator];
      
      var preservesColumnType = aggregatorInfo.preservesColumnType
      
      if (preservesColumnType) {
        this.#logicalType = columnType;
        isNumeric = columnTypeInfo.isNumeric;
        isInteger = columnTypeInfo.isInteger;
      }
      else {
        isNumeric = aggregatorInfo.isNumeric;
        isInteger = aggregatorInfo.isInteger;
      } 
      
      if (aggregator === 'sum' && columnTypeInfo.isInteger) {
        isInteger = true;
      }
      
    }
    
    var derivation = axisItem.derivation;
    if (derivation){
      var derivations = Object.assign({}, AttributeUi.dateFields, AttributeUi.timeFields);
      var derivationInfo = derivations[derivation];
      var dataType = derivationInfo.dataType;
      if (dataType) {
        this.#logicalType = dataType;
        var typeInfo = dataTypes[dataType];
        isNumeric = typeInfo.isNumeric;
        isInteger = typeInfo.isInteger;
      }
      isNumeric = derivation.isNumeric || isNumeric;
      isInteger = derivation.isInteger || isInteger;
    }
    
    var localeSettings = settings.getSettings('localeSettings');
    var locales = localeSettings.locale;
    
    var formatter;
    if (isNumeric){
      var options = {
        minimumIntegerDigits: localeSettings.minimumIntegerDigits
      };
      if (isInteger){
        options.minFractionalDigits = 0;
      }
      else {
        options.minimumFractionDigits = localeSettings.minimumFractionDigits,
        options.maximumFractionDigits = localeSettings.maximumFractionDigits        
      }
      
      this.#formatter = new Intl.NumberFormat(locales, options);
      this.#decimalSeparator = this.#formatter.formatToParts(123.456)['decimal'];
    }
  }
  
  // this has the job of converting the resultset value to a value that our formatter can format
  // value as it is extracted from the resultset
  // field as it is extracted from the resultset.
  convertValue(value, field){
    if (value === null || value === undefined) {
      return value;
    }
    
    var valueType = typeof value;
    var fieldTypeId = field.typeId;
    var fieldTypeName = field.type.toString();
    
    var convertedValue = value;
    var stringValue;
    // see all type Ids: https://github.com/apache/arrow/blob/740889f413af9b1ae1d81eb1e5a4a9fb4ce9cf97/js/src/enum.ts#L158
    switch (fieldTypeId){
      /** NONE - The default placeholder type */
      case 0: 
        console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId}, this is not explicitly handled.`);
        break;
      /** A NULL type having no physical storage */
      case 1:  
        console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId}, this is not explicitly handled.`);
        break;
      /** Int - Signed or unsigned 8, 16, 32, or 64-bit little-endian integer */
      case 2:
        switch (valueType){
          case 'number':
          case 'bigint':
            break;
          default:
            console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId} and value type ${valueType}. Don't know how to convert`);
        }
        break;
      /** Float 2, 4, or 8-byte floating point value */
      case 3: 
        switch (valueType){
          case 'number':
            break;
          default:
            console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId} and value type ${valueType}. Don't know how to convert`);
        }
        break;
      /** Binary Variable-length bytes (no guarantee of UTF8-ness) */
      case 4:
        console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId}, this is not explicitly handled.`);
        break;
      /** UTF8 variable-length string as List<Char> */
      case 5:
        console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId}, this is not explicitly handled.`);
        break;
      /** Boolean as 1 bit, LSB bit-packed ordering */
      case 6: 
        console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId}, this is not explicitly handled.`);
        break;
      /** Precision-and-scale-based decimal type. Storage type depends on the parameters. */
      case 7:
        switch (valueType) {
          case 'number':
          case 'bigint':
            break;
          default:
            stringValue = String(value);
            if (field.type.scale === 0) {
              convertedValue = BigInt(stringValue);
            }
            else
            if (this.#formatter) {
              var parts = stringValue.split('.');
              var integerPart = this.#formatter.formatToParts(BigInt(parts[0]))['integer'];
              var fractionPart = part[1];
              convertedValue = `${integerPart}${this.#decimalSeparator}${fractionPart}`;
            }
            else {
              convertedValue = stringValue;
            }
        }
        break;
      /** Date int32_t days or int64_t milliseconds since the UNIX epoch */
      case 8: 
        console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId}, this is not explicitly handled.`);
        break;
      /** Time as signed 32 or 64-bit integer, representing either seconds, milliseconds, microseconds, or nanoseconds since midnight since midnight */
      case 9:
        console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId}, this is not explicitly handled.`);
        break;
      /** Timestamp =  Exact timestamp encoded with int64 since UNIX epoch (Default unit millisecond) */
      case 10: 
        console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId}, this is not explicitly handled.`);
        break;
      /** Interval YEAR_MONTH or DAY_TIME interval in SQL style */
      case 11: 
        console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId}, this is not explicitly handled.`);
        break;
      /** List A list of some logical data type */
      case 12: 
        console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId}, this is not explicitly handled.`);
        break;
      /** Struct of logical types */
      case 13:
        console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId}, this is not explicitly handled.`);
        break;
      /** Union of logical types */      
      case 14:
        console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId}, this is not explicitly handled.`);
        break;
      /** Fixed-size binary. Each value occupies the same number of bytes */
      case 15: 
        console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId}, this is not explicitly handled.`);
        break;
      /** Fixed-size list. Each value occupies the same number of bytes */      
      case 16: 
        console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId}, this is not explicitly handled.`);
        break;
      /** Map of named logical types */
      case 17: 
        console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId}, this is not explicitly handled.`);
        break;
      /** Measure of elapsed time in either seconds, miliseconds, microseconds or nanoseconds. */ 
      case 18: 
        console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId}, this is not explicitly handled.`);
        break;
      default:
        console.warn(`Encountered field ${field.name} with type ${fieldTypeName} and typeId ${fieldTypeId}, this is not explicitly handled.`);
    }
    
    return convertedValue;
  }
  
  // value as it is extracted from the resultset
  // field as it is extracted from the resultset.
  // we need the field because the data type in the resultset may not always be simply aligned with the logical data type
  // for example, 
  // - Timestamp values may be returned as JavaScript Number values representing the milliseconds since epoch
  // - HugeInt values may be return as Uint32 arrays
  format(value, field) {
    if (value === null || value === undefined) {
      // TODO: there might be a requirement to display NULL values explicitly
      return '';
    }
    var convertedValue = this.convertValue(value, field);
    var formattedValue;
    if (typeof convertedValue === 'string'){
      // in this case, the converter already decided it was going to be impossible for the formatter to do it correctly
      // this happens for example for Decimal type
      formattedValue = convertedValue;
    }
    else {
      if (this.#formatter) {
        formattedValue = this.#formatter.format(convertedValue);
      }
      else {
        formattedValue = String(convertedValue);
      }
    }
    return formattedValue;
  }
}

class QueryAxisItem {

  static createFormatter(axisItem){
    var formatter = new QueryAxisItemValueFormatter(axisItem);
    return formatter;
  }

  static getCaptionForQueryAxisItem(axisItem){
    var caption = axisItem.columnName;
    var postfix;
    if (axisItem.derivation) {
      postfix = axisItem.derivation;
    }
    else 
    if (axisItem.aggregator){
      postfix = axisItem.aggregator;
    }
    
    if (postfix) {
      caption += ` ${postfix}`;
    }
    return caption;
  }
  
  static getIdForQueryAxisItem(axisItem){
    var id = QueryAxisItem.getSqlForQueryAxisItem(axisItem);
    return id;
  }
  
  static getSqlForAggregatedQueryAxisItem(item, alias){
    var columnName = item.columnName;
    
    if (columnName === '*') {
      if (alias) {
        columnName = `${getQuotedIdentifier(alias)}.*`;
      }
    }
    else 
    if (alias){
      columnName = getQualifiedIdentifier(alias, columnName);
    }
    else {
      columnName = getQuotedIdentifier(columnName);
    }
    
    var aggregator = item.aggregator;
    var aggregatorInfo = AttributeUi.aggregators[aggregator];
    var expressionTemplate = aggregatorInfo.expressionTemplate;
    var expression = expressionTemplate.replace(/\$\{columnName\}/g, columnName);
    return expression;
  }

  static getSqlForDerivedQueryAxisItem(item, alias){
    var columnName = item.columnName;
    if (alias){
      columnName = getQualifiedIdentifier(alias, columnName);
    }
    else {
      columnName = getQuotedIdentifier(columnName);
    }
    var derivation = item.derivation;
    var derivationInfo;
    derivationInfo = AttributeUi.dateFields[derivation] || AttributeUi.timeFields[derivation];
    var expressionTemplate = derivationInfo.expressionTemplate;
    var expression = expressionTemplate.replace(/\$\{columnName\}/g, columnName);
    return expression;
  }

  static getSqlForQueryAxisItem(item, alias){
    var sqlExpression;
    if (item.aggregator) {
      sqlExpression = QueryAxisItem.getSqlForAggregatedQueryAxisItem(item, alias);
    }
    else
    if (item.derivation) {
      sqlExpression = QueryAxisItem.getSqlForDerivedQueryAxisItem(item, alias);
    }
    else {
      if (alias){
        sqlExpression = getQualifiedIdentifier(alias, item.columnName);
      }
      else {
        sqlExpression = getQuotedIdentifier(item.columnName);
      }
    }    
    return sqlExpression;
  }
}

class QueryAxis {
  
  #items = [];

  findItem(config){
    var columnName = config.columnName;
    var derivation = config.derivation;
    var aggregator = config.aggregator;
    
    var items = this.#items;
    var itemIndex = items.findIndex(function(item){
      if (item.columnName !== columnName){
        return false;
      }
      
      if (derivation) {
        return item.derivation === derivation;
      }
      else
      if (item.derivation){
        return false;
      }
      
      else
      if (aggregator) {
        return item.aggregator === aggregator;
      }
      else 
      if (item.aggregator){
        return false;
      }
      return true;
    });
    
    if (itemIndex === -1) {
      return undefined;
    }
    var item = items[itemIndex];
    var copyOfItem = Object.assign({}, item);
    copyOfItem.index = itemIndex;
    return copyOfItem;
  }
  
  addItem(config){
    var copyOfConfig = Object.assign({}, config);
    if (copyOfConfig.index === undefined) {
      copyOfConfig.index = this.#items.length;
    }
    else {
      if (copyOfConfig.index < 0) {
        copyOfConfig.index = 0;
      }
      else
      if (copyOfConfig.index > this.#items.length){
        copyOfConfig.index = this.#items.length;
      }
    }
    delete copyOfConfig['axis'];
    this.#items.splice(copyOfConfig.index, 0, copyOfConfig);
    return copyOfConfig;
  }
  
  removeItem(config){
    var item = this.findItem(config);
    this.#items.splice(item.index, 1);
    return item;
  }
  
  clear(){
    this.#items = [];
  }
  
  getItems() {
    return [].concat(this.#items);
  }
  
  setItems(items) {
    this.#items = items;
  }
}

class QueryModel extends EventEmitter {
  
  static AXIS_ROWS = 'rows';
  static AXIS_COLUMNS = 'columns';
  static AXIS_CELLS = 'cells';
  
  #axes = {
    columns: new QueryAxis(),
    rows: new QueryAxis(),
    cells: new QueryAxis()
  };
  
  #cellheadersaxis = QueryModel.AXIS_COLUMNS;
  
  #datasource = undefined;
  
  setCellHeadersAxis(cellheadersaxis) {
    var oldCellHeadersAxis = this.#cellheadersaxis;
    this.#cellheadersaxis = cellheadersaxis;
    this.fireEvent('change', {
      propertiesChanged: {
        cellHeadersAxis: {
          previousValue: oldCellHeadersAxis,
          newValue: cellheadersaxis
        }
      }
    });
  }
  
  getCellHeadersAxis(){
    return this.#cellheadersaxis;
  }
  
  getQueryAxis(axisId){
    return this.#axes[axisId];
  }
  
  getColumnsAxis(){
    return this.getQueryAxis(QueryModel.AXIS_COLUMNS);
  }
  
  getRowsAxis(){
    return this.getQueryAxis(QueryModel.AXIS_ROWS);
  }

  getCellsAxis(){
    return this.getQueryAxis(QueryModel.AXIS_CELLS);
  }
  
  setDatasource(datasource){
    if (datasource === this.#datasource) {
      return;
    }
    
    this.#clear(true);
    var oldDatasource = this.#datasource;
    this.#datasource = datasource;

    this.fireEvent('change', {
      propertiesChanged: {
        datasource: {
          previousValue: oldDatasource,
          newValue: datasource
        }
      }
    });
  }
  
  getDatasource(){
    return this.#datasource;
  }
  
  findItem(config){
    var columnName = config.columnName;
    var derivation = config.derivation;
    var aggregator = config.aggregator;
    
    var axisIds, axisId = config.axis;
    if (axisId) {
      axisIds = [axisId];
    }
    else 
    if (aggregator){
      axisIds = ['cells'];
    }
    else {
      axisIds = Object.keys(this.#axes);
    }

    var findConfig = {
      columnName: config.columnName,
      derivation: config.derivation,
      aggregator: config.aggregator
    };
    var axis, item;
    for (var i = 0; i < axisIds.length; i++){
      axisId = axisIds[i];
      axis = this.getQueryAxis(axisId);
      item = axis.findItem(findConfig);
      if (item) {
        item.axis = axisId;
        break;
      }
    }
    return item;
  }
  
  #addItem(config){
    var axisId = config.axis;
    var axis = this.getQueryAxis(config.axis);
    var addedItem = axis.addItem(config);
    addedItem.axis = axisId;
    return addedItem;
  }

  #removeItem(config) {
    var axisId = config.axis;
    var axis = this.getQueryAxis(config.axis);
    var removedItem = axis.removeItem(config);
    removedItem.axis = axisId;
    return removedItem;
  }
  
  addItem(config){
    var axis = config.axis;
    
    if (!axis) {
      if (config.aggregator) {
        axis = QueryModel.AXIS_CELLS;
      }
      else {
        // todo: find some way to figure out the most appropriate default axis.
        throw new Error(`Can't add item: No axis specified!`);
      }
    }
    
    // make an axis-less version of the item so we can locate it in case it's already added to the model. 
    var copyOfConfig = Object.assign({}, config);
    delete copyOfConfig['axis'];
    var item = this.findItem(copyOfConfig);
    
    var removedItem;
    if (item) {
      // if the item already exits in this model, we first remove it.
      removedItem = this.#removeItem(item);
    }
    var addedItem = this.#addItem(config);

    var axesChangeInfo = {};
    axesChangeInfo[addedItem.axis] = {
      added: [addedItem]
    };
    if (removedItem){
      axesChangeInfo[removedItem.axis] = {
        removed: [removedItem]
      };
    }
    
    this.fireEvent('change', {
      axesChanged: axesChangeInfo
    });

    return addedItem;
  }
  
  removeItem(config){
    var copyOfConfig = Object.assign({}, config);
    delete copyOfConfig['axis'];
    var item = this.findItem(copyOfConfig);
    if (!item){
      return undefined;
    }
    var axisId = item.axis;
    var axis = this.getQueryAxis(axisId);
    var removedItem = axis.removeItem(item);
    removedItem.axis = axisId;
    
    var axesChangeInfo = {};
    axesChangeInfo[axisId] = {
      removed: [removedItem]
    };
    
    this.fireEvent('change', {
      axesChanged: axesChangeInfo
    });

    return removedItem;
  }
  
  #clear(suppressFireEvent, axisId){
    var axisIds;
    if (axisId) {
      axisIds = [axisId];
    }
    else {
      axisIds = Object.keys(this.#axes);
    }

    var axesChangeInfo = {};
    for (var i = 0; i < axisIds.length; i++) {
      var axisId = axisIds[i];
      var axis = this.getQueryAxis(axisId);
      var items = axis.getItems();
      
      if (!items.length) {
        continue;
      }
      
      axesChangeInfo[axisId] = {
        removed: items
      };
      axis.clear();
    }
    
    if (!Object.keys(axesChangeInfo).length){
      // no change, don't fire event.
      return;
    }
    
    if (suppressFireEvent) {
      return;
    }
    
    this.fireEvent('change', {
      axesChanged: axesChangeInfo
    });
  }
  
  clear(axisId) {
    // clear and send event;
    this.#clear(false, axisId);
  }
  
  flipAxes(axisId1, axisId2) {
    var axesChangeInfo = {};

    var axis1 = this.getQueryAxis(axisId1);
    var axis1Items = axis1.getItems();
        
    var axis2 = this.getQueryAxis(axisId2);
    var axis2Items = axis2.getItems();

    axis1.setItems(axis2Items);
    axis2.setItems(axis1Items);

    if (axis1Items.length) {
      axesChangeInfo[axis1] = {
        removed: axis1Items
      }
      axesChangeInfo[axis2] = {
        added: axis1Items
      };
    }
    if (axis2Items.length) {
      axesChangeInfo[axis2] = {
        removed: axis2Items
      };
      axesChangeInfo[axis1] = {
        added: axis2Items
      };
    }
    
    this.fireEvent('change', {
      axesChanged: axesChangeInfo
    });
  }
  
}

var queryModel;
function initQueryModel(){
  queryModel = new QueryModel();
}