const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const multer = require("multer");
const {CloudinaryStorage} = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;


const app = express();


app.use(express.json());
app.use(cors());




// CLOUDINARY


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






// MONGODB


mongoose.connect(process.env.MONGO_URI)

.then(()=>console.log("✅ MongoDB conectado"))

.catch(error=>console.log(error));







// MODELO


const MultimediaSchema = new mongoose.Schema({


titulo:String,


descripcion:String,


imagenUrl:String,


audioUrl:String,


fechaCreacion:{


type:Date,

default:Date.now


}


});



const Multimedia = mongoose.model(
"Multimedia",
MultimediaSchema
);








// MOSTRAR TODOS


app.get("/multimedia",async(req,res)=>{


try{


const datos = await Multimedia.find();


res.json(datos);



}catch(error){


res.status(500).json({

error:error.message

});


}


});







// OBTENER UNO PARA EDITAR


app.get("/multimedia/:id",async(req,res)=>{


try{


const dato =
await Multimedia.findById(req.params.id);


res.json(dato);



}catch(error){


res.status(500).json({

error:error.message

});


}


});








// CREAR


app.post(

"/multimedia",

upload.fields([

{name:"imagen",maxCount:1},

{name:"audio",maxCount:1}

]),


async(req,res)=>{


try{



const nuevo = new Multimedia({



titulo:req.body.titulo,


descripcion:req.body.descripcion,


imagenUrl:

req.files.imagen ?

req.files.imagen[0].path

:"",



audioUrl:

req.files.audio ?

req.files.audio[0].path

:""



});




await nuevo.save();



res.json(nuevo);



}catch(error){


res.status(500).json({

error:error.message

});


}



}

);








// ACTUALIZAR


app.put(

"/multimedia/:id",


async(req,res)=>{


try{


const actualizado =

await Multimedia.findByIdAndUpdate(


req.params.id,


req.body,


{new:true}



);



res.json(actualizado);



}catch(error){


res.status(500).json({

error:error.message

});


}


});









// ELIMINAR


app.delete(

"/multimedia/:id",

async(req,res)=>{


try{


await Multimedia.findByIdAndDelete(

req.params.id

);



res.json({

mensaje:"Eliminado"

});



}catch(error){


res.status(500).json({

error:error.message

});


}


});








const PORT =
process.env.PORT || 3000;



app.listen(PORT,()=>{


console.log(

`🚀 Servidor activo en ${PORT}`

);


});