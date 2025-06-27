import { Schema, model, models } from "mongoose";

const respostaSchema = new Schema({
  aluno: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true
  },
  respostas: [
    {
      questaoId: {
        type: Schema.Types.ObjectId,
        ref: "Questao",
        required: true
      },
      resposta: [Number] // Índices das opções escolhidas
    }
  ],
  acertos: Number,
  total: Number,
  criadoEm: {
    type: Date,
    default: Date.now
  }
});

export default models.Resposta || model("Resposta", respostaSchema);