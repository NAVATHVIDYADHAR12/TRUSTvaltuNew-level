import { Pool, neonConfig } from '@neondatabase/serverless';

neonConfig.fetchConnectionCache = true;

const sql = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export default sql;
