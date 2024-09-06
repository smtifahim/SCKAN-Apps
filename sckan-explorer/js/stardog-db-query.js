
// From my local host
// const conn = new stardogjs.Connection({
//                   username: 'admin',
//                   password: 'admin',
//                   endpoint: 'http://localhost:5820',
//             });

// USE this one
const conn = new stardogjs.Connection({
    username: 'SPARC',
    password: 'RCvp9tKzTdxg42py',
    endpoint: 'https://sd-c1e74c63.stardog.cloud:5820',
   

 });




async function executeDBQuery(conn, databaseName, queryString)
{
    return await stardogjs.query.execute(
       conn,
       databaseName,
       queryString,
       'application/sparql-results+json',
       {
          // limit: 10,
          reasoning: false,
          offset: 0,
       }
    ).then(({ body }) => {
       console.info('Stardog DB Query Results: ');
       var resultingData = body.results.bindings;
       console.log(resultingData);
       return resultingData;
    });
}

// async function getDBQueryResults(databaseName, query) 
// {
//    try
//    {
//       var queryResults = await executeDBQuery(conn, databaseName, query);
//       return queryResults;
//    } 
//    catch (error)
//    {
//      console.error(error);
//      alert("Satrdog is not responding with query results.");
//    }
//  }