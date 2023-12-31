function duckDbRowToJSON(object){
  var pojo;
  if (typeof object.toJSON === 'function'){
    pojo = object.toJSON();
  }
  else {
    pojo = object;
  }
  return JSON.stringify(pojo, function(key, value){
    if (value && value.constructor === BigInt){
      return parseFloat(value.toString());
    }
    else {
      return value;
    }
  }, 2);
}

function initDuckdbVersion(){
  if (!window.hueyDb) {
    return;
  }
  var connection = window.hueyDb.connection;
  connection.query('SELECT version() as version')
  .then(function(resultset){
    var duckdbVersionLabel = byId('duckdbVersionLabel');
    duckdbVersionLabel.innerText = `DuckDB ${resultset.get(0)['version']}`;

    var spinner = byId('spinner');
    if (spinner){
      spinner.style.display = 'none';
    }
    var layout = byId('layout');
    layout.style.display = '';
  })
  .catch(function(){
    console.error(`Error fetching duckdb version info.`);
  })
}

function initUploader(){
  byId("uploader").addEventListener("change", handleUpload, false);
}

function initRegisteredFiles(){
  byId("registeredFiles").addEventListener("input", handleFileSelected, false);
}

async function registerFile(file){
  var hueyDb = window.hueyDb;
  var datasource = new DuckDbDataSource(hueyDb.duckdb, hueyDb.instance, {
    type: DuckDbDataSource.types.FILE,
    file: file
  });
  await datasource.registerFile();
  
  var option = document.createElement('option');
  option.label = option.value = datasource.getFileName();
  var registeredFiles = byId('registeredFiles');
  registeredFiles.appendChild(option);
  registeredFiles.selectedIndex = registeredFiles.options.length - 1;
  handleFileSelected(datasource);
}

function handleUpload(event){
  var files = event.target.files;
  for (var i = 0; i < files.length; i++){ 
    var file = files[i];
    registerFile(file);
  }
}

async function handleFileSelected(event){
  var registeredFiles = byId('registeredFiles');
  var fileName = registeredFiles.value;
  if (fileName === ''){
    return;
  }
  
  if (registeredFiles.value === 'new'){
    byId("uploader").click();
    return;
  }
    
  var datasource;
  if (event instanceof DuckDbDataSource) {
    datasource = event;
  }
  else {
    var hueyDb = window.hueyDb;
    datasource = new DuckDbDataSource(hueyDb.duckdb, hueyDb.instance,  {
      type: DuckDbDataSource.types.FILE,
      fileName: fileName
    });
  }
  
  clearAttributeUi(true);
  clearSearch();
  
  try {
    var profileResultSet = await datasource.getProfileData(100);
    queryModel.clear();
    queryModel.setDatasource(datasource);
    renderAttributeUi(profileResultSet);
  }
  catch (error) {
    console.error(`Error reading file ${fileName}`);
    console.error(err);
  }
}

function initAbout(){
  var aboutDialog = byId('aboutDialog');

  byId('aboutButton').addEventListener('click', function(){
    aboutDialog.showModal();
  });

  byId('aboutDialogOkButton').addEventListener('click', function(event){
    event.cancelBubble = true;
    aboutDialog.close();
  });
}

function initApplication(){
  initDuckdbVersion();
  initAbout();
  initUploader();
  initRegisteredFiles();
  initQueryModel();
  initAttributeUi();
  initSearch();
  initQueryUi();
  initPivotTableUi();
}