const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

const app = express();

app.use(cors());

// ❗ IMPORTANTE: NO afecta multer, solo JSON normales
app.use(express.json());


// ===============================
// CLOUDINARY CONFIG
// ===============================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// ===============================
// MULTER + CLOUDINARY STORAGE
// ===============================
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {

        console.log("ARCHIVO RECIBIDO:", file.originalname, file.mimetype);

        return {
            folder: "galeria_multimedia",

            // 🔥 CLAVE PARA AUDIO
            resource_type: file.mimetype.startsWith("audio")
                ? "video"
                : "image"
        };
    }
});

const upload = multer({ storage });


// ===============================
// MONGODB
// ===============================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB conectado"))
.catch(err => console.log("❌ Error MongoDB:", err));


// ===============================
// ESQUEMA
// ===============================
const ElementoMultimediaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descripcion: String,
    imagenUrl: String,
    audioUrl: String,

     tags: [String], // 👈 nuevo campo

    fechaCreacion: { type: Date, default: Date.now }
});

const ElementoMultimedia = mongoose.model("ElementoMultimedia", ElementoMultimediaSchema);


// ===============================
// RUTA BASE
// ===============================
app.get("/", (req, res) => {
    res.send("Servidor funcionando 🚀");
});


// ===============================
// OBTENER
// ===============================
app.get("/multimedia", async (req, res) => {
    try {
        const data = await ElementoMultimedia.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ===============================
// SUBIR (DEBUG COMPLETO)
// ===============================
app.post(
"/multimedia",
upload.fields([
    { name: "imagen", maxCount: 1 },
    { name: "audio", maxCount: 1 }
]),
async (req, res) => {

    try {

        console.log("===== BODY =====");
        console.log(req.body);

        console.log("===== FILES =====");
        console.log(req.files);

        if (!req.files) {
            return res.status(400).json({
                error: "No llegaron archivos (imagen/audio)"
            });
        }

        const nuevo = new ElementoMultimedia({
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            imagenUrl: req.files.imagen?.[0]?.path || "",
            audioUrl: req.files.audio?.[0]?.path || ""
        });

        await nuevo.save();

        res.json({
            mensaje: "Guardado correctamente 🚀",
            data: nuevo
        });

    } catch (error) {

        console.log("ERROR SERVER:", error);

        res.status(500).json({
            error: error.message
        });

    }

}
);


// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor activo en puerto ${PORT}`);
});