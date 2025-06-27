import { Schema, model, models } from "mongoose";

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
  isAdmin: {
    type: Boolean,
    default: false,
    required: true,
  },
});

//exporta o modelo e reutiliza se já existir
export default models.Usuario || model("Usuario", usuarioSchema);