const express = require('express');
const app = express();
const cors = require('cors');
const odbc = require('odbc');
const port = 10123;

// Den DSN String für ODBC entsprechend anpassen
const connectionString =
  'DSN=IBMIDEV;Driver=IBM i Access ODBC Driver;Password=********;UserID=GUENEY;CCSID=1208';

app.use(express.json());
app.use(cors());

app.get('/hello', (req, res) => {
  res.json({ message: 'Hallo Welt!' });
});

app.get('/db', async (req, res) => {
  try {
    const connection = await odbc.connect(connectionString);
    const result = await connection.query(
      `select * from TABLE(QSYS2.ACTIVE_JOB_INFO(DETAILED_INFO=>'ALL')) WHERE JOB_TYPE<>'SYS'`
    );

    // JSON.stringify kann mit BigInt nicht umgehen, daher müssen wir hier
    // die BigInts in Strings umwandeln
    const json = JSON.stringify(result, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(json);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Beispielanwendung horcht auf http://localhost:${port}`);
});
