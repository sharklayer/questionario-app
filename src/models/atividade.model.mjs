import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const atividadeSchema = new Schema({
  titulo: {
    type: String,
    required: true,
  },
  descricao: {
    type: String,
  },
  dataInicio: {
    type: Date,
    required: true,
  },
  dataFim: {
    type: Date,
    required: true,
  },
  questoes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Questao",
      required: true,
    }
  ],
  ativa: {
    type: Boolean,
    default: true,
    required: true,
  }
}, {
  collection: 'atividades'
});

export default models.Atividade || model('Atividade', atividadeSchema);