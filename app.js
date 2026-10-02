const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

// ✅ Token simple
const SECRET_TOKEN = "token";

// ===== LOGIN (SIN AUTH) =====
app.post("/setex/services/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "secret-password") {
    return res.json({ mensaje: "Credenciales correctas.", token: SECRET_TOKEN });
  }

  res.status(401).json({ error: "Credenciales inválidas" });
});

// ✅ Middleware de autenticación
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Token no enviado" });
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (token !== SECRET_TOKEN) {
    return res.status(401).json({ error: "Token inválido" });
  }

  next();
}

// ✅ Proteger todo lo de debajo
app.use(authMiddleware);

// ===== Archivos =====
const TICKETS = "tickets.json";
const CREATE_TICKET = "create_tickets.json";
const EXTEND_TICKET = "extend_tickets.json";
const PULLOUT_TICKET = "pullout_tickets.json";
const CHECK_CAR_PLATE = "check_car_plate.json";
const CHECK_HAS_ANNULABLE_COMPLAINTS = "check_has_annulable_complaints.json";
const CONFIRM_ANNUL_COMPLAINT = "confirm_annul_complaint.json";
const INSERT_MET_COLLECTION = "insert_met_collection.json";

if (!fs.existsSync(TICKETS)) fs.writeFileSync(TICKETS, "[]");
if (!fs.existsSync(CREATE_TICKET)) fs.writeFileSync(CREATE_TICKET, "[]");
if (!fs.existsSync(EXTEND_TICKET)) fs.writeFileSync(EXTEND_TICKET, "[]");
if (!fs.existsSync(PULLOUT_TICKET)) fs.writeFileSync(PULLOUT_TICKET, "[]");
if (!fs.existsSync(CHECK_CAR_PLATE)) fs.writeFileSync(CHECK_CAR_PLATE, "[]");
if (!fs.existsSync(CHECK_HAS_ANNULABLE_COMPLAINTS)) fs.writeFileSync(CHECK_HAS_ANNULABLE_COMPLAINTS, "[]");
if (!fs.existsSync(CONFIRM_ANNUL_COMPLAINT)) fs.writeFileSync(CONFIRM_ANNUL_COMPLAINT, "[]");
if (!fs.existsSync(INSERT_MET_COLLECTION)) fs.writeFileSync(INSERT_MET_COLLECTION, "[]");

const isEmpty = (val) => {
  // Si es null o undefined
  if (val == null) return true;
  // Si es un string vacío (quitando espacios)
  if (typeof val === 'string') return val.trim() === '';
  // Si es un array vacío
  if (Array.isArray(val)) return val.length === 0;
  // Si es un objeto, comprobamos si no tiene llaves
  if (typeof val === 'object') return Object.keys(val).length === 0;
  return false;
};

const hasEmptyValues = (obj) => {
  for (let key in obj) {
    const content = obj[key];
    
    // Si el contenido es un objeto (como "registrationNumber"), bajamos un nivel
    if (typeof content === 'object' && !Array.isArray(content) && content !== null) {
      if (hasEmptyValues(content)) return true;
    } else {
      // Si llegamos al valor final o es un array
      if (isEmpty(content)) return true;
    }
  }
  return false;
};

// ===== RUTAS TICKETS =====
app.get("/setex/services/ngsi-ld/v1/entities/tickets", (req, res) => {
  res.json(JSON.parse(fs.readFileSync(TICKETS)));
});

app.post("/setex/services/ngsi-ld/v1/entities/ticket/create", (req, res) => {
  const data = JSON.parse(fs.readFileSync(CREATE_TICKET));
  if (hasEmptyValues(req.body)) {
    return res.status(401).json({
    "code": "002",
    "errors": [{
      "code": "PARAMETER_ERROR",
      "message": "All attributes must be provided and non-empty."
    }],
    "status": "error"
    });
  }
  data.push(req.body);
  fs.writeFileSync(CREATE_TICKET, JSON.stringify(data, null, 2));
  fs.writeFileSync(TICKETS, JSON.stringify(data, null, 2));
  res.status(200).json({
    "code": "000",
    "status": "ok"
    }
  );
});

app.post("/setex/services/ngsi-ld/v1/entities/ticket/extend", (req, res) => {
  const data = JSON.parse(fs.readFileSync(EXTEND_TICKET));
  if (hasEmptyValues(req.body)) {
    return res.status(401).json({
    "code": "002",
    "errors": [{
      "code": "PARAMETER_ERROR",
      "message": "All attributes must be provided and non-empty."
    }],
    "status": "error"
    });
  }
  data.push(req.body);
  fs.writeFileSync(EXTEND_TICKET, JSON.stringify(data, null, 2));
  fs.writeFileSync(TICKETS, JSON.stringify(data, null, 2));
  res.status(201).json({
    "code": "000",
    "status": "ok"
    });
});

app.post("/setex/services/ngsi-ld/v1/entities/ticket/pullOut", (req, res) => {
  const data = JSON.parse(fs.readFileSync(PULLOUT_TICKET));
  if (hasEmptyValues(req.body)) {
    return res.status(401).json({
    "code": "002",
    "errors": [{
      "code": "PARAMETER_ERROR",
      "message": "Please check some attributes are empty."
    }],
    "status": "error"
    });
  }
  data.push(req.body);
  fs.writeFileSync(PULLOUT_TICKET, JSON.stringify(data, null, 2));
  fs.writeFileSync(TICKETS, JSON.stringify(data, null, 2));
  res.status(201).json({
    "code": "000",
    "status": "ok"
    });
});

// ===== RUTAS CAR =====
app.post("/setex/services/ngsi-ld/v1/entities/car/checkCarPlate", (req, res) => {
  const data = JSON.parse(fs.readFileSync(CHECK_CAR_PLATE));
  if (hasEmptyValues(req.body)) {
    return res.status(401).json({
    "code": "error",
    "error": "unknown",
    });
  }
  data.push(req.body);
  fs.writeFileSync(CHECK_CAR_PLATE, JSON.stringify(data, null, 2));
  res.status(201).json({
    "code": "000",
    "status": "ok"
    });
});

// ===== RUTAS COMPLAINTS =====
app.post("/setex/services/ngsi-ld/v1/entities/complaints/checkHasAnnulableComplaints", (req, res) => {
  const data = JSON.parse(fs.readFileSync(CHECK_HAS_ANNULABLE_COMPLAINTS));
  if (hasEmptyValues(req.body)) {
    return res.status(401).json({
      "status":"error",
      "code": "003",
      "annulableComplaints": [],
      "errorForMet": 3
    });
  }
	
  const regNumber = req.body?.registrationNumber?.value;
	
	
  if (/[34]/.test(regNumber)) {
    return res.status(401).json({
      "status":"error",
      "code": "003",
      "annulableComplaints": [],
      "errorForMet": 3
    });
  }


  data.push(req.body);
  fs.writeFileSync(CHECK_HAS_ANNULABLE_COMPLAINTS, JSON.stringify(data, null, 2));
  res.status(201).json({
    "status":"ok",
    "code": "000",
    "annulableComplaints": [
    {
    "identifierComplaint": req.body.identifierComplaint,
    "creationDate": req.body.queryDate,
    "annulDate": req.body.queryDate,
    "annulAmount": 9000
    }
    ],
    "errorForMet": 0
    });
});

app.post("/setex/services/ngsi-ld/v1/entities/confirmAnnulComplaint", (req, res) => {
  const data = JSON.parse(fs.readFileSync(CONFIRM_ANNUL_COMPLAINT));
  if (hasEmptyValues(req.body)) {
    return res.status(401).json({
      "status":"error",
      "code": "001"
    });
  }
	
  const regNumber = req.body?.registrationNumber?.value;
	
	
  if (/[34]/.test(regNumber)) {
    return res.status(401).json({
      "status":"error",
      "code": "003",
      "annulableComplaints": [],
      "errorForMet": 3
    });
  }
	
  data.push(req.body);
  fs.writeFileSync(CONFIRM_ANNUL_COMPLAINT, JSON.stringify(data, null, 2));
  res.status(201).json({
    "code": "000",
    "status": "ok"
  });
});

// ===== RUTAS MET =====
app.post("/setex/services/ngsi-ld/v1/entities/insertMetCollection", (req, res) => {
  const data = JSON.parse(fs.readFileSync(INSERT_MET_COLLECTION));
  if (hasEmptyValues(req.body)) {
    return res.status(401).json({
      "status":"error",
      "code": "001"
    });
  }
  data.push(req.body);
  fs.writeFileSync(INSERT_MET_COLLECTION, JSON.stringify(data, null, 2));
  res.status(201).json({
      "status":"ok",
      "code": "000"
    });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("API escuchando en http://localhost:3000");
});
