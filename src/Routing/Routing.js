
class Routing {
  
  static serializeQueryModel(queryModel){
    var datasource = queryModel.getDatasource();
    if (!datasource) {
      return null;
    }
    var datasourceId = datasource.getId();
    
    var queryModelObject = {
      datasourceId: datasourceId,
      cellsHeaders: queryModel.getCellHeadersAxis(),
      axes: {}
    };
    
    var axisIds = queryModel.getAxisIds().sort();
    var hasItems = false;
    axisIds.forEach(function(axisId){
      var axis = queryModel.getQueryAxis(axisId);
      var items = axis.getItems();
      if (items.length === 0) {
        return '';
      }
      hasItems = true;
      queryModelObject.axes[axisId] = items.map(function(axisItem){
        var strippedItem = {column: axisItem.columnName};
        
        strippedItem.columnType = axisItem.columnType;
        strippedItem.derivation = axisItem.derivation;
        strippedItem.aggregator = axisItem.aggregator;
        if (axisItem.includeTotals === true) {
          strippedItem.includeTotals = true;
        }
        
        if (axisId === QueryModel.AXIS_FILTERS && axisItem.filter){
          strippedItem.filter = axisItem.filter;
        }
        
        return strippedItem;
      });
    });
    if (!hasItems){
      return null;
    }
    return queryModelObject;
  }
 
  static getViewstateFromRoute(route){
    try {
      var base64 = route;
      var ascii = atob( base64 ); 
      var json = decodeURIComponent( ascii );
      var state = JSON.parse( json );
            
      return state;
    }
    catch(error){
      return null;
    }
  }
      
  static getRouteForView(view){
    var viewClass = view.constructor.name;
    
    var queryModel = view.getQueryModel();
    var queryModelObject = Routing.serializeQueryModel(queryModel);    
    
    if (queryModelObject === null) {
      return undefined;
    }
    
    var viewObject = {
      viewClass: viewClass,
      queryModel: queryModelObject
    };
    var json = JSON.stringify( viewObject );
    var ascii = encodeURIComponent( json );
    var base64 = btoa( ascii ); 
    var route = base64;
    return route;
  }

  static getCurrentRoute(){
    var hash = document.location.hash;

    if (hash.startsWith('#')){
      hash = hash.substring(1);
    }

    if (hash === ''){
      return undefined;
    }
    
    return hash;
  }
  
  static isSynced(view) {
    var viewRoute = Routing.getRouteForView(view);
    var currentRoute = Routing.getCurrentRoute();
    return viewRoute === currentRoute;
  }

  static updateRouteFromView(view){
    var currentRoute = Routing.getCurrentRoute();
    var newRoute = Routing.getRouteForView(view);
    if (currentRoute === newRoute && Boolean(newRoute)) {
      return;
    }
    var hash = newRoute ? `#${newRoute}` : '';
    document.location.hash = hash;
  }
}