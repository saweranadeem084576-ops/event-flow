const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/userModel");
const Event = require("./models/eventModel");
const Booking = require("./models/bookingModel");
const Payment = require("./models/paymentModel");
const Ticket = require("./models/ticketModel");
const Review = require("./models/reviewModel");
const Notification = require("./models/notificationModel");

const DB =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD)
    : process.env.DATABASE_LOCAL;

async function seed() {
  await connectDB(DB);
  console.log("Connected to DB. Seeding...");

  // 1) Find the organizer and admin users
  const organizer = await User.findOne({
    email: "ahsannadeem.dev@gmail.com",
  });
  const admin = await User.findOne({
    email: "developer.ahsannadeem@gmail.com",
  });

  if (!organizer) {
    console.error("Organizer user ahsannadeem.dev@gmail.com not found!");
    process.exit(1);
  }
  if (!admin) {
    console.error("Admin user developer.ahsannadeem@gmail.com not found!");
    process.exit(1);
  }

  console.log(`Organizer: ${organizer.name} (${organizer._id})`);
  console.log(`Admin: ${admin.name} (${admin._id})`);

  // 2) Remove old seeded events (optional — only removes events from these two users)
  await Event.deleteMany({
    organizer: { $in: [organizer._id, admin._id] },
  });
  console.log("Cleared old events from these organizers.");

  // 3) Create events
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  const eventsData = [
    // ---- Organizer events (ahsannadeem.dev@gmail.com) ----
    {
      title: "Tech Innovation Summit 2026",
      description:
        "A premier conference bringing together tech leaders, startups, and innovators to discuss the future of AI, blockchain, and emerging technologies. Keynote speakers from Google, Microsoft, and OpenAI.",
      date: new Date(now.getTime() + 15 * day),
      time: "09:00 AM",
      location: "Lahore Expo Center, Lahore",
      price: 5000,
      availableSeats: 500,
      category: "conference",
      organizer: organizer._id,
      status: "approved",
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
      ratingsAverage: 4.7,
      ratingsQuantity: 24,
    },
    {
      title: "Full Stack Development Workshop",
      description:
        "Hands-on workshop covering React, Node.js, MongoDB, and deployment. Build a complete project from scratch in two days. Lunch and certificates included.",
      date: new Date(now.getTime() + 7 * day),
      time: "10:00 AM",
      location: "FAST University, Islamabad",
      price: 3000,
      availableSeats: 60,
      category: "workshop",
      organizer: organizer._id,
      status: "approved",
      image:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop",
      ratingsAverage: 4.9,
      ratingsQuantity: 18,
    },
    {
      title: "Startup Networking Meetup",
      description:
        "Connect with fellow entrepreneurs, investors, and mentors. Pitch your ideas, find co-founders, and grow your network in a casual environment.",
      date: new Date(now.getTime() + 10 * day),
      time: "06:00 PM",
      location: "The Hive Coworking, Karachi",
      price: 0,
      availableSeats: 100,
      category: "meetup",
      organizer: organizer._id,
      status: "approved",
      image:
        "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop",
      ratingsAverage: 4.3,
      ratingsQuantity: 12,
    },
    {
      title: "UI/UX Design Masterclass",
      description:
        "Learn design thinking, prototyping in Figma, and user research methods from senior designers at Careem and Daraz. Perfect for beginners and intermediate designers.",
      date: new Date(now.getTime() + 20 * day),
      time: "11:00 AM",
      location: "Arfa Tower, Lahore",
      price: 2500,
      availableSeats: 40,
      category: "seminar",
      organizer: organizer._id,
      status: "approved",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop",
      ratingsAverage: 4.6,
      ratingsQuantity: 9,
    },
    {
      title: "Digital Art Exhibition",
      description:
        "Showcasing digital art and NFT collections from top Pakistani artists. Interactive installations and live digital painting sessions.",
      date: new Date(now.getTime() + 25 * day),
      time: "02:00 PM",
      location: "Alhamra Art Gallery, Lahore",
      price: 1000,
      availableSeats: 200,
      category: "exhibition",
      organizer: organizer._id,
      status: "approved",
      image:
        "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800&auto=format&fit=crop",
      ratingsAverage: 4.4,
      ratingsQuantity: 7,
    },
    {
      title: "Cloud Computing Bootcamp",
      description:
        "Intensive 3-day bootcamp on AWS, Azure, and GCP. Get hands-on with cloud architecture, serverless computing, and DevOps practices.",
      date: new Date(now.getTime() + 30 * day),
      time: "09:30 AM",
      location: "NUST, Islamabad",
      price: 8000,
      availableSeats: 35,
      category: "workshop",
      organizer: organizer._id,
      status: "pending",
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop",
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    },

    // ---- Admin events (developer.ahsannadeem@gmail.com) ----
    {
      title: "Annual Music Concert — Strings Live",
      description:
        "Experience the magic of live music with Pakistan's legendary band. An evening of nostalgia, great music, and unforgettable memories under the stars.",
      date: new Date(now.getTime() + 12 * day),
      time: "07:00 PM",
      location: "Minar-e-Pakistan Ground, Lahore",
      price: 3500,
      availableSeats: 2000,
      category: "concert",
      organizer: admin._id,
      status: "approved",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop",
      ratingsAverage: 4.8,
      ratingsQuantity: 45,
    },
    {
      title: "Machine Learning Seminar",
      description:
        "Deep dive into modern ML techniques — transformers, LLMs, computer vision, and practical applications. Featuring demos and Q&A sessions with industry experts.",
      date: new Date(now.getTime() + 18 * day),
      time: "10:00 AM",
      location: "LUMS, Lahore",
      price: 1500,
      availableSeats: 150,
      category: "seminar",
      organizer: admin._id,
      status: "approved",
      image:
        "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop",
      ratingsAverage: 4.5,
      ratingsQuantity: 15,
    },
    {
      title: "Wedding Expo 2026",
      description:
        "Pakistan's largest wedding showcase featuring top designers, decorators, caterers, and photographers. Everything you need to plan a dream wedding.",
      date: new Date(now.getTime() + 35 * day),
      time: "12:00 PM",
      location: "Pearl Continental, Karachi",
      price: 500,
      availableSeats: 800,
      category: "wedding",
      organizer: admin._id,
      status: "approved",
      image:
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
      ratingsAverage: 4.2,
      ratingsQuantity: 10,
    },
    {
      title: "Cybersecurity Conference 2026",
      description:
        "Learn about the latest threats, defense strategies, and ethical hacking techniques. Capture-the-flag competition with prizes worth PKR 100,000.",
      date: new Date(now.getTime() + 22 * day),
      time: "09:00 AM",
      location: "Convention Center, Islamabad",
      price: 4000,
      availableSeats: 300,
      category: "conference",
      organizer: admin._id,
      status: "approved",
      image:
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop",
      ratingsAverage: 4.6,
      ratingsQuantity: 20,
    },
    {
      title: "Photography Meetup & Photowalk",
      description:
        "Join fellow photographers for a guided photowalk through the historic streets of Lahore. Tips on street photography, composition, and editing.",
      date: new Date(now.getTime() + 5 * day),
      time: "04:00 PM",
      location: "Walled City, Lahore",
      price: 0,
      availableSeats: 50,
      category: "meetup",
      organizer: admin._id,
      status: "approved",
      image:
        "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&auto=format&fit=crop",
      ratingsAverage: 4.7,
      ratingsQuantity: 8,
    },
    {
      title: "E-Commerce Business Workshop",
      description:
        "Step-by-step guide to launching and scaling your online business. Covers Shopify, Daraz, social media marketing, and inventory management.",
      date: new Date(now.getTime() + 28 * day),
      time: "10:30 AM",
      location: "National Incubation Center, Lahore",
      price: 2000,
      availableSeats: 45,
      category: "workshop",
      organizer: admin._id,
      status: "pending",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop",
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    },
  ];

  const events = await Event.insertMany(eventsData);
  console.log(`Created ${events.length} events.`);

  // 4) Create a few sample bookings for the organizer (as attendee of admin's events)
  const adminEvents = events.filter(
    (e) =>
      e.organizer._id.toString() === admin._id.toString() &&
      e.status === "approved",
  );

  if (adminEvents.length >= 2) {
    const bookingsData = [
      {
        event: adminEvents[0]._id,
        user: organizer._id,
        numberOfTickets: 2,
        totalPrice: adminEvents[0].price * 2,
        status: "confirmed",
      },
      {
        event: adminEvents[1]._id,
        user: organizer._id,
        numberOfTickets: 1,
        totalPrice: adminEvents[1].price,
        status: "confirmed",
      },
    ];

    const bookings = await Booking.insertMany(bookingsData);
    console.log(`Created ${bookings.length} bookings.`);

    // Create payments for each booking
    for (const booking of bookings) {
      await Payment.create({
        booking: booking._id,
        user: organizer._id,
        amount: booking.totalPrice,
        method: "card",
        status: "completed",
      });
    }
    console.log("Created payments.");

    // Create tickets
    for (const booking of bookings) {
      await Ticket.create({
        booking: booking._id,
        event: booking.event,
        user: organizer._id,
        ticketType: "general",
      });
    }
    console.log("Created tickets.");

    // Create notifications
    await Notification.insertMany([
      {
        user: organizer._id,
        message: `Your booking for "${adminEvents[0].title}" has been confirmed!`,
        type: "booking_confirmation",
        read: false,
      },
      {
        user: organizer._id,
        message: `Payment of PKR ${adminEvents[0].price * 2} received successfully.`,
        type: "payment_confirmation",
        read: false,
      },
      {
        user: organizer._id,
        message: `Your booking for "${adminEvents[1].title}" has been confirmed!`,
        type: "booking_confirmation",
        read: true,
      },
      {
        user: admin._id,
        message: "New event pending approval: Cloud Computing Bootcamp",
        type: "event_update",
        read: false,
      },
      {
        user: admin._id,
        message: "New event pending approval: E-Commerce Business Workshop",
        type: "event_update",
        read: false,
      },
    ]);
    console.log("Created notifications.");
  }

  // 5) Create reviews on some approved organizer events (from admin as reviewer)
  const organizerApproved = events.filter(
    (e) =>
      e.organizer._id.toString() === organizer._id.toString() &&
      e.status === "approved",
  );

  if (organizerApproved.length >= 2) {
    await Review.create({
      comment:
        "Excellent event! Very well organized and the speakers were top-notch.",
      rating: 5,
      event: organizerApproved[0]._id,
      user: admin._id,
    });
    await Review.create({
      comment: "Great workshop, learned a lot. Would recommend to everyone.",
      rating: 4,
      event: organizerApproved[1]._id,
      user: admin._id,
    });
    console.log("Created reviews.");
  }

  console.log("\nSeeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
