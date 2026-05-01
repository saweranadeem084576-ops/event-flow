const Ticket = require("../models/ticketModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

// ========== GET MY TICKETS ==========
exports.getMyTickets = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find({ user: req.user.id }).sort("-issueDate");

  res.status(200).json({
    status: "success",
    results: tickets.length,
    data: { data: tickets },
  });
});

// ========== GET ONE TICKET ==========
exports.getTicket = factory.getOne(Ticket);

// ========== ADMIN: GET ALL TICKETS ==========
exports.getAllTickets = factory.getAll(Ticket);
