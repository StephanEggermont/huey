
class AttributeUi {
  
  #id = undefined;
  #queryModel = undefined;
  
  static aggregators = {
    'count': {
      isNumeric: true,
      isInteger: true,
      expressionTemplate: 'COUNT( ${columnName} )',
      columnType: 'HUGEINT'
    },
    'distinct count': {
      isNumeric: true,
      isInteger: true,
      expressionTemplate: 'COUNT( DISTINCT ${columnName} )',
      columnType: 'HUGEINT'
    },
    'min': {
      preservesColumnType: true,
      expressionTemplate: 'MIN( ${columnName} )'
    },
    'max': {
      preservesColumnType: true,
      expressionTemplate: 'MAX( ${columnName} )'
    },
    'list': {
      expressionTemplate: 'LIST( ${columnName} )',
      isArray: true
    },
    'distinct list': {
      expressionTemplate: 'LIST( DISTINCT ${columnName} )',
      isArray: true      
    },
    'histogram': {
      expressionTemplate: 'HISTOGRAM( ${columnName} )',
      isStruct: true,
    },
    'sum': {
      isNumeric: true,
      forNumeric: true,
      expressionTemplate: 'SUM( ${columnName} )',
      createFormatter: function(axisItem){
        var columnType = axisItem.columnType;
        var dataTypeInfo = dataTypes[columnType];
        var formatter = createNumberFormatter(dataTypeInfo.isInteger !== true);
        return function(value, field){
          return formatter.format(value);
        };
      }
    },
    'avg': {
      isNumeric: true,
      isInteger: false,
      forNumeric: true,
      expressionTemplate: 'AVG( ${columnName} )',
      createFormatter: function(axisItem){
        var formatter = createNumberFormatter(true);
        return function(value, field){
          return formatter.format(value);
        };
      }
    },
    'median': {
      expressionTemplate: 'MEDIAN( ${columnName} )',
      createFormatter: function(axisItem){
        var columnType = axisItem.columnType;
        var dataTypeInfo = dataTypes[columnType];
        var formatter;
        if (dataTypeInfo.isNumeric) {
          formatter = createNumberFormatter(dataTypeInfo.isInteger !== true);
          return function(value, field){
            return formatter.format(value);
          };
        }
        else {
          return function(value, field){
            return fallbackFormatter(value);
          };
        }
      }
    },
    'mode': {
      preservesColumnType: true,
      expressionTemplate: 'MODE( ${columnName} )'
    },
    'stdev': {
      isNumeric: true,
      isInteger: false,
      forNumeric: true,
      expressionTemplate: 'STDDEV_SAMP( ${columnName} )',
      columnType: 'DOUBLE'
    },
    'variance': {
      isNumeric: true,
      isInteger: false,
      forNumeric: true,
      expressionTemplate: 'VAR_SAMP( ${columnName} )',
      columnType: 'DOUBLE'
    },
    'entropy': {
      isNumeric: true,
      isInteger: false,
      expressionTemplate: 'ENTROPY( ${columnName} )',
      columnType: 'DOUBLE'
    },
    'kurtosis': {
      isNumeric: true,
      isInteger: false,
      forNumeric: true,
      expressionTemplate: 'KURTOSIS( ${columnName} )',
      columnType: 'DOUBLE'
    },
    'skewness': {
      isNumeric: true,
      isInteger: false,
      forNumeric: true,
      expressionTemplate: 'SKEWNESS( ${columnName} )',
      columnType: 'DOUBLE'
    }
  };

  static dateFields = {
    'iso-date': {
      // %x is isodate,
      // see: https://duckdb.org/docs/sql/functions/dateformat.html
      expressionTemplate: "strftime( ${columnName}, '%x' )",
      columnType: 'VARCHAR'
    },
    'year': {
      expressionTemplate: "CAST( YEAR( ${columnName} ) AS INT)",
      columnType: 'INT', 
      formats: {
        'yyyy': {
        },
        'yy': {
        }
      }
    },
    'quarter': {
      expressionTemplate: "'Q' || QUARTER( ${columnName} )",
      columnType: 'VARCHAR'    
    },    
    'month num': {
      expressionTemplate: "CAST( MONTH( ${columnName} ) AS UTINYINT)",
      columnType: 'UTINYINT',
      formats: {
        'long': {
        },
        'short': {
        },
        'narrow': {
        }
      }
    },
    'week num': {
      expressionTemplate: "CAST( WEEK( ${columnName} ) AS UTINYINT)",
      columnType: 'UTINYINT'
    },
    'day of year': {
      expressionTemplate: "CAST( DAYOFYEAR( ${columnName} ) as USMALLINT)",
      columnType: 'USMALLINT'
    },
    'day of month': {
      expressionTemplate: "CAST( DAYOFMONTH( ${columnName} ) AS UTINYINT)",
      columnType: 'UTINYINT'
    },
    'day of week': {
      expressionTemplate: "CAST( DAYOFWEEK( ${columnName} ) as UTINYINT)",
      columnType: 'UTINYINT',
      formats: {
        'long': {
        },
        'short': {
        },
        'narrow': {
        }
      }
    }
  };

  static timeFields = {
    'iso-time': {
      expressionTemplate: "strftime( ${columnName}, '%H:%M:%S' )",
      columnType: 'VARCHAR'
    },
    'hour': {
      expressionTemplate: "CAST( HOUR( ${columnName} ) as UTINYINT)",
      columnType: 'UTINYINT',
      formats: {
        'short': {
        },
        'long': {
        }
      }
    },
    'minute': {
      expressionTemplate: "CAST( MINUTE( ${columnName} ) as UTINYINT)",
      columnType: 'UTINYINT'
    },
    'second': {
      expressionTemplate: "CAST( SECOND( ${columnName} ) as UTINYINT)",
      columnType: 'UTINYINT'
    }
  };
  
  static getApplicableDerivations(typeName){
    var typeInfo = dataTypes[typeName];
    
    var hasTimeFields = Boolean(typeInfo.hasTimeFields);
    var hasDateFields = Boolean(typeInfo.hasDateFields);
    
    var applicableDerivations = Object.assign({}, 
      hasDateFields ? AttributeUi.dateFields : undefined, 
      hasTimeFields ? AttributeUi.timeFields : undefined
    );
    return applicableDerivations;
  }

  static getDerivationInfo(derivationName){
    var derivations = Object.assign({}, 
      AttributeUi.dateFields, 
      AttributeUi.timeFields
    );
    var derivationInfo = derivations[derivationName];
    return derivationInfo;
  }

  static getAggregatorInfo(aggregatorName){
    var aggregatorInfo = AttributeUi.aggregators[aggregatorName];
    return aggregatorInfo;
  }
  
  static getApplicableAggregators(typeName) {
    var typeInfo = dataTypes[typeName];
    
    var isNumeric = Boolean(typeInfo.isNumeric);
    var isInteger = Boolean(typeInfo.isInteger);
    var hasTimeFields = Boolean(typeInfo.hasTimeFields);
    var hasDateFields = Boolean(typeInfo.hasDateFields);
            
    var applicableAggregators = {};
    for (var aggregationName in AttributeUi.aggregators) {
      var aggregator = AttributeUi.aggregators[aggregationName];
      if (aggregator.forNumeric && !isNumeric) {
        continue;
      }
      applicableAggregators[aggregationName] = aggregator;
    }
    return applicableAggregators;
  }
  
  static #getUiNodeCaption(config){
    switch (config.type){
      case 'column':
        return config.profile.column_name;
      case 'derived':
        return config.derivation;
      case 'aggregate':
        return config.aggregator;
    }
  }
  
  constructor(id, queryModel){
    this.#id = id;
    this.#queryModel = queryModel;

    var dom = this.getDom();
    dom.addEventListener('click', this.#clickHandler.bind(this));
    this.#queryModel.addEventListener('change', this.#queryModelChangeHandler.bind(this));
  }
    
  #renderAttributeUiNodeAxisButton(config, head, axisId){
    var name = `${config.type}_${config.profile.column_name}`;
    var id = `${name}`;
    
    var createInput;
    switch (config.type) {
      case 'column':
      case 'derived':
        switch (axisId){
          case QueryModel.AXIS_FILTERS:
          case QueryModel.AXIS_COLUMNS:
          case QueryModel.AXIS_ROWS:
            if (config.type === 'derived') {
              var derivation = config.derivation;
              id += `_${derivation}`;
            }
            id += `_${axisId}`;
            createInput = 'radio';
            break;
          default:
        }
        break;
      case 'aggregate':
        switch (axisId){
          case QueryModel.AXIS_CELLS:
            id += `_${config.aggregator}`;
            createInput = 'checkbox';
            break;
          default:
        }
        break;
      default:
    }

    var axisButton = createEl(createInput ? 'label' : 'span', {
      'data-axis': axisId,
      "class": 'attributeUiAxisButton'
    });
    
    if (!createInput){
      return axisButton;
    }

    axisButton.setAttribute('title', `Toggle to add or remove this attribute on the ${axisId} axis.`);
    
    axisButton.setAttribute('for', id);
    var axisButtonInput = createEl('input', {
      type: 'checkbox',
      id: id,
      'data-nodetype': config.type,
      'data-column_name': config.profile.column_name,
      'data-axis': axisId
    });
    if (config.aggregator) {
      axisButtonInput.setAttribute('data-aggregator', config.aggregator);
    }
    if (config.derivation){      
      axisButtonInput.setAttribute('data-derivation', config.derivation);
    }
    
    axisButton.appendChild(axisButtonInput);
    
    return axisButton;
  }

  #renderAttributeUiNodeAxisButtons(config, head){
    var filterButton = this.#renderAttributeUiNodeAxisButton(config, head, 'filters');
    head.appendChild(filterButton);

    var cellsButton = this.#renderAttributeUiNodeAxisButton(config, head, 'cells');
    head.appendChild(cellsButton);

    var columnButton = this.#renderAttributeUiNodeAxisButton(config, head, 'columns');
    head.appendChild(columnButton);

    var rowButton = this.#renderAttributeUiNodeAxisButton(config, head, 'rows');
    head.appendChild(rowButton);
  }

  #renderAttributeUiNodeHead(config) {
    var head = createEl('summary', {
    });
    
    var icon = createEl('span', {
      'class': 'icon',
      'role': 'img'
    });
    switch (config.type) {
      case 'column':
        icon.setAttribute('title', config.title || config.profile.column_type);
        break;
      case 'aggregate':
      case 'derived':
        icon.setAttribute('title', config.title || config.expressionTemplate);
        break;
    }
    head.appendChild(icon);
    
    var caption = AttributeUi.#getUiNodeCaption(config);
    var label = createEl('span', {
      "class": 'label'
    }, caption);
    head.appendChild(label);
    
    this.#renderAttributeUiNodeAxisButtons(config, head);
    return head;
  }

  #renderAttributeUiNode(config){
    var node = createEl('details', {
      role: 'treeitem',      
      "class": ['attributeUiNode', config.type],
      'data-nodetype': config.type
    });
    node.setAttribute('data-column_name', config.profile.column_name);
    node.setAttribute('data-column_type', config.profile.column_type);   
    switch (config.type){
      case 'column':
        node.setAttribute('data-state', 'collapsed');
        node.addEventListener('toggle', this.#toggleNodeState.bind(this) );
        break;
      case 'aggregate':
        node.setAttribute('data-aggregator', config.aggregator);
        break;
      case 'derived':
        var derivation = config.derivation;
        node.setAttribute('data-derivation', config.derivation);
        if (derivation.formats) {
          node.addEventListener('toggle', this.#toggleNodeState.bind(this) );
        }
        break;
    }
    
    var head = this.#renderAttributeUiNodeHead(config);
    node.appendChild(head);

    return node;
  }
    
  clear(showBusy){
    var attributesUi = this.getDom();
    var content;
    if (showBusy) {
      content = '<div class="loader loader-medium"></div>';
    }
    else {
      content = '';
    }
    attributesUi.innerHTML = content;
  }
  
  render(columnSummary){
    this.clear();
    var attributesUi = this.getDom();
    
    var node = this.#renderAttributeUiNode({
      type: 'aggregate',
      aggregator: 'count',
      title: 'Generic rowcount',
      profile: {
        column_name: '*',
        column_type: 'INTEGER'
      }
    });
    attributesUi.appendChild(node);
    
    
    for (var i = 0; i < columnSummary.numRows; i++){
      var row = columnSummary.get(i);
      node = this.#renderAttributeUiNode({
        type: 'column',
        profile: row.toJSON()
      });
      attributesUi.appendChild(node);
    }
  }
  
  #loadChildNodesForColumnNode(node){    
    var columnName = node.getAttribute('data-column_name');
    var columnType = node.getAttribute('data-column_type');
    var profile = {
      column_name: columnName,
      column_type: columnType 
    };
    var typeName = /^[^\(]+/.exec(columnType)[0];
    
    var derived = [];
    var aggregates = [];

    var typeInfo = dataTypes[columnType];
    
    var isNumeric = Boolean(typeInfo.isNumeric);
    var isInteger = Boolean(typeInfo.isInteger);
    var hasTimeFields = Boolean(typeInfo.hasTimeFields);
    var hasDateFields = Boolean(typeInfo.hasDateFields);
        
    var childNode, config;
    
    var applicableDerivations = AttributeUi.getApplicableDerivations(typeName);
    for (var derivationName in applicableDerivations) {
      var derivation = applicableDerivations[derivationName];
      config = {
        type: 'derived',
        derivation: derivationName,
        title: derivation.title,
        expressionTemplate: derivation.expressionTemplate,
        profile: profile
      };
      childNode = this.#renderAttributeUiNode(config);
      node.appendChild(childNode);
    }
    
    var applicableAggregators = AttributeUi.getApplicableAggregators(typeName);
    for (var aggregationName in applicableAggregators) {
      var aggregator = applicableAggregators[aggregationName];
      config = {
        type: 'aggregate',
        aggregator: aggregationName,
        title: aggregator.title,
        expressionTemplate: aggregator.expressionTemplate,
        profile: profile
      };
      childNode = this.#renderAttributeUiNode(config);
      node.appendChild(childNode);    
    }    
  }
  
  #loadChildNodes(node){
    var nodeType = node.getAttribute('data-nodetype');
    switch (nodeType){
      case 'column':
        this.#loadChildNodesForColumnNode(node);
        break;
      case 'derived':
        // TODO
        break;
      default:
        throw new Error(`Unrecognized nodetype ${nodeType}`);
    }
  }  
  
  #toggleNodeState(event){
    var node = event.target;
    if (event.newState === 'open'){ 
      if (node.childNodes.length === 1){
        this.#loadChildNodes(node);
      }
    }
  }
  
  async #axisButtonClicked(node, axis, checked){
    var head = node.childNodes.item(0);
    var inputs = head.getElementsByTagName('input');
    switch (axis){
      case QueryModel.AXIS_ROWS:
      case QueryModel.AXIS_COLUMNS:
        // implement mutual exclusive axes (either rows or columns, not both)
        for (var i = 0; i < inputs.length; i++){
          var input = inputs.item(i);
          if (input.checked && input.parentNode.getAttribute('data-axis') !== axis) {
            input.checked = false;
          }
        }
        break;
    }
    var columnName = node.getAttribute('data-column_name');
    var columnType = node.getAttribute('data-column_type');
    var derivation = node.getAttribute('data-derivation');
    var aggregator = node.getAttribute('data-aggregator');

    
    var itemConfig = {
      axis: axis,
      columnName: columnName,
      columnType: columnType,
      derivation: derivation,
      aggregator: aggregator,
    };
    
    var formatter = QueryAxisItem.createFormatter(itemConfig);
    if (formatter){
      itemConfig.formatter = formatter;
    }

    if (itemConfig.aggregator) {
      //noop
    }
    else {
      var literalWriter = QueryAxisItem.createLiteralWriter(itemConfig);
      if (literalWriter){
        itemConfig.literalWriter = literalWriter;
      }
    }
    
    if (checked) {
      await this.#queryModel.addItem(itemConfig);
      
      if (axis === QueryModel.AXIS_FILTERS) {
        queryUi.openFilterDialogForQueryModelItem(itemConfig);
      }
    }
    else {
      this.#queryModel.removeItem(itemConfig);
    }
  }
  
  
  #clickHandler(event) {
    var target = event.target;
    var classNames = getClassNames(target);
    event.stopPropagation();
    
    var node = getAncestorWithClassName(target, 'attributeUiNode');
    if (!node) {
      return;
    }
    
    if (classNames.indexOf('attributeUiAxisButton') !== -1){
      var input = target.getElementsByTagName('input').item(0);
      var axisId = target.getAttribute('data-axis');
      setTimeout(function(){
        this.#axisButtonClicked(node, axisId, input.checked);
      }.bind(this), 0);
    }    
  }
  
  async #queryModelChangeHandler(event){
    var eventData = event.eventData;
    if (eventData.propertiesChanged) {
      if (eventData.propertiesChanged.datasource) {
        var searchAttributeUiDisplay;
        if (eventData.propertiesChanged.datasource.newValue) {
          this.clear(true);          
          var datasource = eventData.propertiesChanged.datasource.newValue;
          var columnMetadata = await datasource.getColumnMetadata();
          this.render(columnMetadata);
          searchAttributeUiDisplay = '';
        }
        else {
          this.clear(false);
          searchAttributeUiDisplay = 'none';
        }
        byId('searchAttributeUi').style.display = searchAttributeUiDisplay;
      }
    }
    else {
      var inputs = this.getDom().getElementsByTagName('input');
      for (var i = 0; i < inputs.length; i++){
        var input = inputs.item(i);
        var columnName = input.getAttribute('data-column_name');
        var axis = input.getAttribute('data-axis');
        var aggregator = input.getAttribute('data-aggregator');
        var derivation = input.getAttribute('data-derivation');
        
        var item = queryModel.findItem({
          columnName: columnName,
          axis: axis,
          aggregator: aggregator,
          derivation: derivation
        });
        
        input.checked = Boolean(item);
      }
    }
  }
  
  getDom(){
    return byId(this.#id);
  }
  
}

var attributeUi;
function initAttributeUi(){
  attributeUi = new AttributeUi('attributeUi', queryModel); 
}