import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const usuarioSchema = new Schema({
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  senha: {
    type: String,
    required: true,
  },
  rga: {
    type: String,        
    required: function () { return !this.isAdmin; }, //rga é obrigatório se não for admin
    unique: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
    required: true,
  },
});

export default models.Usuario || model("Usuario", usuarioSchema);