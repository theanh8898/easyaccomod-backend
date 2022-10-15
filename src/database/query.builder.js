const moment = require('moment');
const getConnection = require('./connect');

function table(tableName, connection = null) {
  let __join = '';
  let __as = '';
  let __order = '';
  let __limit = '';

  if (!tableName) {
    throw new Error('Empty table name');
  }

  async function __getConnection() {
    if (connection) {
      return connection;
    }
    connection = await getConnection();
    return connection;
  }

  function __compileWhere(where, params = [], connection) {
    if (typeof where === 'string') {
      return ` WHERE ${where}`;
    }
    if (typeof where !== 'object') {
      return '';
    }
    const arr = [];
    Object.keys(where).forEach(function (key) {
      const value = where[key];
      if (Array.isArray(value)) {
        arr.push(`${key} IN (?)`);
        params.push(value);
      } else if (typeof value === 'object') {
        if (value.op === '!=') {
          arr.push(`${key} != ?`);
          params.push(value.value);
        }
        if (value.op === 'LIKE') {
          arr.push(`${connection.escapeId(key)} LIKE ${connection.escape(`%${value.value}%`)}`);
        }
        if (value.op === '!NULL') {
          arr.push(`${key} IS NOT NULL`);
        }
        if (value.op === '<=') {
          arr.push(`${key} <= ?`);
          params.push(value.value);
        }
        if (value.op === '>=') {
          arr.push(`${key} >= ?`);
          params.push(value.value);
        }
        if (value.op === '<>') {
          arr.push(`${key} BETWEEN ? AND ?`);
          value.value.forEach(function (v) {
            params.push(v);
          });
        }
      } else {
        arr.push(`${key} = ?`);
        params.push(value);
      }
    });
    if (!arr.length) {
      return '';
    }
    return ` WHERE ${arr.join(' AND ')}`;
  }

  function __compileUpdateParams(data, params) {
    if (typeof data !== 'object') {
      return '';
    }
    const arr = [];
    Object.keys(data).forEach(function (key) {
      arr.push(`${key} = ?`);
      params.push(data[key]);
    });
    if (!arr.length) {
      return '';
    }
    return arr.join(', ');
  }

  async function __getUpsertData(connection, data) {
    const result = {};
    if (!data) {
      return result;
    }
    const [rows] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\``);
    if (!rows || !rows.length) {
      return result;
    }
    rows.forEach(function (row) {
      const field = row.Field;
      if (data[field] !== undefined) {
        result[field] = data[field];
      }
    });
    return result;
  }

  async function create(data) {
    const connection = await __getConnection();
    let insertData = {...data};
    insertData.created_at = moment().format('YYYY-MM-DD HH:mm:ss');
    insertData = await __getUpsertData(connection, insertData);
    const [results] = await connection.query(`INSERT INTO \`${tableName}\` SET ?`, insertData);
    return {
      id: results.insertId,
      ...insertData,
    };
  }

  async function update(data, where) {
    const connection = await __getConnection();
    let updateData = {...data};
    updateData.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
    updateData = await __getUpsertData(connection, updateData);
    delete updateData.created_at; // protect sensitive data
    delete updateData.id; // protect sensitive data
    const params = [];
    const updateStr = __compileUpdateParams(updateData, params);
    const whereStr = __compileWhere(where, params);
    if (!updateStr) {
      return false;
    }
    await connection.query(`UPDATE \`${tableName}\` SET ${updateStr} ${whereStr}`, params);
    return {
      ...updateData,
    };
  }

  async function destroy(where) {
    const connection = await __getConnection();
    const params = [];
    const whereStr = __compileWhere(where, params);
    const [results] = await connection.query(`DELETE FROM \`${tableName}\` ${__join} ${whereStr}`, params);
    return !!results;
  }

  async function findAll(where, select = '*') {
    try {
      const connection = await __getConnection();
      const params = [];
      const whereStr = __compileWhere(where, params, connection);
      const sql = `SELECT ${select} FROM \`${tableName}\` ${__as} ${__join} ${whereStr} ${__order} ${__limit}`;
      resetQuery();
      const [rows] = await connection.query(sql, params);
      resetQuery();
      return rows;
    } catch (error) {
      resetQuery();
      throw error;
    }
  }

  async function findOne(where, select = '*') {
    const rows = await findAll(where, select);
    if (rows.length) {
      return rows[0];
    }
    return null;
  }

  async function count(where) {
    const connection = await __getConnection();
    const params = [];
    const whereStr = __compileWhere(where, params, connection);
    const sql = `SELECT COUNT(1) AS total FROM \`${tableName}\` ${__as} ${__join} ${whereStr}`;
    resetQuery();
    const [rows] = await connection.query(sql, params);
    if (rows.length) {
      return rows[0].total;
    }
    return 0;
  }

  function order(field, direction = 'ASC') {
    if (field.includes('.')) {
      const arr = field.split('.');
      __order = `ORDER BY \`${arr[0]}\`.\`${arr[1]}\` ${direction}`;
    } else {
      __order = `ORDER BY \`${field}\` ${direction}`;
    }
    return this;
  }

  function as(alias) {
    __as = `AS \`${alias}\``;
    return this;
  }

  function join(table, as, on, type = 'INNER') {
    __join = `${type} JOIN \`${table}\` AS ${as} ON ${on}`;
    return this;
  }

  function paging(params) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    __limit = `LIMIT ${start}, ${pageSize}`;
    return this;
  }

  function resetQuery() {
    __join = '';
    __as = '';
    __order = '';
    __limit = '';
    return this;
  }

  return {
    create,
    update,
    destroy,
    findAll,
    findOne,
    count,
    as,
    join,
    order,
    paging,
    resetQuery,
  };
}

module.exports = table;
