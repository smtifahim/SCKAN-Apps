
// From my local host
// const conn = new stardogjs.Connection({
//                   username: 'admin',
//                   password: 'admin',
//                   endpoint: 'http://localhost:5820',
//             });

const conn = new stardogjs.Connection({
    username: 'SPARC',
    password: 'RCvp9tKzTdxg42py',
    //endpoint: 'https://stardog.scicrunch.io:5821',
    endpoint: 'https://sd-63f05fc2.stardog.cloud:5820',
    // endpoint: 'https://sckan-stardog.scicrunch.io',



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