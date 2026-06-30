import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

let pool = null;

function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return pool;
}

const NullishQueryFunction = () => {
  throw new Error(
    'No database connection string was provided. Perhaps process.env.DATABASE_URL has not been set'
  );
};

function sql(strings, ...values) {
  if (!getPool()) {
    return NullishQueryFunction();
  }

  const queryObj = {
    strings,
    values,
    _isSql: true,
    then(onfulfilled, onrejected) {
      return executeQuery(this).then(onfulfilled, onrejected);
    }
  };
  return queryObj;
}

sql.transaction = (cb) => {
  if (!getPool()) {
    return NullishQueryFunction();
  }
  return getPool().connect().then(async (client) => {
    try {
      await client.query('BEGIN');
      const res = await cb(client);
      await client.query('COMMIT');
      return res;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  });
};

async function executeQuery(queryObj) {
  const { queryText, params } = buildQuery(queryObj);
  const result = await getPool().query(queryText, params);
  return result.rows;
}

function buildQuery(queryObj) {
  let queryText = '';
  const params = [];

  function process(obj) {
    const { strings, values } = obj;
    for (let i = 0; i < strings.length; i++) {
      queryText += strings[i];
      if (i < values.length) {
        const val = values[i];
        if (val && typeof val === 'object' && val._isSql) {
          process(val);
        } else {
          params.push(val);
          queryText += `$${params.length}`;
        }
      }
    }
  }

  process(queryObj);
  return { queryText, params };
}

export default sql;