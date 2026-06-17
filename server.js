const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const {CloudinaryStorage} = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();


const app = express();


app.use(cors());

app.use(express.json());





cloudinary.config({

cloud_name:process.env.CLOUDINARY_CLOUD_NAME,

api_key:process.env.CLOUDINARY_API_KEY,

api_secret:process.env.CLOUDINARY_API_SECRET

});





const storage = new CloudinaryStorage({

cloudinary:cloudinary,

params:{

folder:"galeria_multimedia",

resource_type:"auto"

}

});



const upload = multer({storage});







mongoose.connect(process.env.MONGO_URI)

.then(()=>console.log("MongoDB conectado"))

.catch(e=>console.log(e));








const MultimediaSchema =
new mongoose.Schema({

titulo:String,

descripcion:String,

imagenUrl:String,

audioUrl:String


});



const Multimedia =
mongoose.model(
"Multimedia",
MultimediaSchema
);








// MOSTRAR


app.get("/multimedia",async(req,res)=>{


const datos =
await Multimedia.find();


res.json(datos);


});







// CREAR


app.post(

"/multimedia",

upload.fields([

{name:"imagen",maxCount:1},

{name:"audio",maxCount:1}

]),


async(req,res)=>{


const nuevo = new Multimedia({


titulo:req.body.titulo,


descripcion:req.body.descripcion,


imagenUrl:
req.files.imagen
?
req.files.imagen[0].path
:"",


audioUrl:
req.files.audio
?
req.files.audio[0].path
:""



});


await nuevo.save();


res.json(nuevo);



});









// OBTENER UNO


app.get("/multimedia/:id",async(req,res)=>{


const dato =
await Multimedia.findById(req.params.id);


res.json(dato);


});








// ACTUALIZAR TEXTO

app.put(

"/multimedia/:id",

upload.fields([

{name:"imagen",maxCount:1},

{name:"audio",maxCount:1}

]),


async(req,res)=>{


try{


const datos = {

titulo:req.body.titulo,

descripcion:req.body.descripcion

};




// si mandas nueva imagen

if(req.files.imagen){


datos.imagenUrl =
req.files.imagen[0].path;


}





// si mandas nuevo audio

if(req.files.audio){


datos.audioUrl =
req.files.audio[0].path;


}





const actualizado =

await Multimedia.findByIdAndUpdate(


req.params.id,


datos,


{
new:true
}


);




res.json(actualizado);



}catch(error){



res.status(500).json({

error:error.message

});



}



}

);




// ELIMINAR


app.delete("/multimedia/:id",async(req,res)=>{


await Multimedia.findByIdAndDelete(

req.params.id

);



res.json({

mensaje:"Eliminado"

});


});








app.listen(3000,()=>{

console.log("Servidor activo");

});