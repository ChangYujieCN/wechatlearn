const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ticketSchema = new Schema({
  name: String,
  ticket: String,
  expires_in: Number,
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
});
ticketSchema.pre("save", function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now();
  } else {
    this.meta.updatedAt = Date.now();
  }
  next();
});
ticketSchema.statics = {
  async getTicket() {
    return await this.findOne({
      name: "ticket"
    });
  },
  async saveTicket(data) {
    const Ticket = mongoose.model("Ticket");
    let ticket = await this.findOne({
      name: "ticket"
    });
    if (ticket && ticket.ticket) {
      ticket.ticket = data.ticket;
      ticket.expires_in = data.expires_in;
    } else {
      ticket = new Ticket({
        name: "ticket",
        ticket: data.ticket,
        expires_in: data.expires_in
      })
    }
    await ticket.save();
    return data;
  },
};
mongoose.model("Ticket", ticketSchema);

